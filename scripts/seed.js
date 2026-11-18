/**
 * Datos de ejemplo para desarrollo. No corre al arrancar Strapi:
 * solo cuando hacés `npm run seed`, contra el CMS que ya está en marcha.
 *
 * Habla únicamente con 127.0.0.1 y se niega si la base no es SQLite.
 * Los permisos de lectura del rol Public los pone el arranque, no este script.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const PLACEHOLDERS = path.join(__dirname, 'placeholders');
const ADMIN_FILE = path.join(ROOT, '.tmp', 'seed-admin.json');
const SEED_EMAIL = 'seed-local@example.com';
const TIENDA_MODEL = 'api::tienda.tienda';
const TIENDA = {
  nombre: 'Mini Gonzi',
  texto_envio: 'A coordinar',
  moneda: 'ARS',
  whatsapp: null,
};

const CATEGORIES = [
  {
    slug: 'bodies',
    name: 'Bodies',
    description: 'Bodies de bebé para todos los días.',
    order: 1,
    active: true,
  },
  {
    slug: 'accesorios',
    name: 'Accesorios',
    description: 'Gorritos y otros accesorios.',
    order: 2,
    active: true,
  },
];

const VARIANT_MODEL = 'api::product-variant.product-variant';

const PRODUCTS = [
  {
    slug: 'body-de-algodon',
    name: 'Body de algodón',
    description: 'Body de algodón suave, manga corta.',
    base_price: 18900,
    featured: true,
    active: true,
    pieza_unica: false,
    categories: ['bodies', 'accesorios'],
    image: 'body-de-algodon.png',
    variants: [
      { size: '0-3 m', color: 'Crudo', color_hex: '#F4E1C1', stock_quantity: 4 },
      { size: '3-6 m', color: 'Rosa viejo', color_hex: '#C47A8A', stock_quantity: 1, price: 19900 },
      { size: '6-9 m', color: 'Rosa viejo', color_hex: '#C47A8A', stock_quantity: 0 },
      { size: '9-12 m', color: 'Celeste', color_hex: '#9EC3E6', stock_quantity: 3 },
    ],
  },
  {
    slug: 'gorrito',
    name: 'Gorrito',
    description: 'Gorrito de abrigo para recién nacido. Un solo talle.',
    base_price: 7500,
    featured: false,
    active: true,
    pieza_unica: false,
    categories: ['accesorios'],
    image: 'gorrito.png',
    variants: [
      { size: 'Talle único', color: 'Natural', color_hex: '#E6D5C3', stock_quantity: 5 },
    ],
  },
  {
    slug: 'manta',
    name: 'Manta',
    description: 'Manta liviana. Esta ficha no tiene foto a propósito y no tiene stock.',
    base_price: 24000,
    featured: false,
    active: true,
    pieza_unica: false,
    categories: ['bodies'],
    image: null,
    variants: [
      { size: '0-3 m', color: 'Gris', color_hex: '#BDBDBD', stock_quantity: 0 },
      { size: '3-6 m', color: 'Gris', color_hex: '#BDBDBD', stock_quantity: 0 },
    ],
  },
  {
    slug: 'body-bordado',
    name: 'Body bordado',
    description: 'Pieza única, bordada a mano. Hay una sola.',
    base_price: 32000,
    featured: false,
    active: true,
    pieza_unica: true,
    categories: ['bodies'],
    image: null,
    variants: [
      { size: '3-6 m', color: 'Verde salvia', color_hex: '#8FA58B', stock_quantity: 1 },
    ],
  },
];

function fail(message) {
  const error = new Error(message);
  error.seed = true;
  throw error;
}

function assertDevOnly() {
  if (process.env.NODE_ENV === 'production') {
    fail('npm run seed es solo para desarrollo. No lo corras en producción.');
  }
  const client = process.env.DATABASE_CLIENT || 'sqlite';
  if (client !== 'sqlite') {
    fail(`npm run seed solo corre con SQLite local. DATABASE_CLIENT=${client}.`);
  }
}

function baseUrl() {
  const port = process.env.PORT || '1337';
  if (!/^\d+$/.test(String(port))) {
    fail(`PORT no es un número: ${port}`);
  }
  return `http://127.0.0.1:${port}`;
}

async function request(url, { method = 'GET', token, body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  let response;
  try {
    response = await fetch(url, { method, headers, body: payload });
  } catch (error) {
    fail(
      `No pude conectar con ${url}. Levantá el CMS con npm run develop y volvé a correr npm run seed.\n${error.message}`
    );
  }
  const text = await response.text();
  let parsed = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }
  if (!response.ok) {
    const detail = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
    fail(`${method} ${url} respondió ${response.status}.\n${detail}`);
  }
  return parsed;
}

function makePassword() {
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const all = lower + upper + digits;
  const chars = [
    lower[crypto.randomInt(lower.length)],
    upper[crypto.randomInt(upper.length)],
    digits[crypto.randomInt(digits.length)],
  ];
  while (chars.length < 20) {
    chars.push(all[crypto.randomInt(all.length)]);
  }
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

function readSavedAdmin() {
  if (!fs.existsSync(ADMIN_FILE)) return null;
  const saved = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8'));
  if (!saved.email || !saved.password) return null;
  return saved;
}

function saveAdmin(email, password) {
  fs.mkdirSync(path.dirname(ADMIN_FILE), { recursive: true });
  fs.writeFileSync(ADMIN_FILE, JSON.stringify({ email, password }, null, 2));
}

async function login(root, email, password) {
  const body = await request(`${root}/admin/login`, {
    method: 'POST',
    body: { email, password },
  });
  const token = body?.data?.token;
  if (!token) fail('El login no devolvió un token.');
  return token;
}

async function tokenFor(root) {
  const init = await request(`${root}/admin/init`);
  const hasAdmin = Boolean(init?.data?.hasAdmin);
  const fromEnv = {
    email: (process.env.SEED_ADMIN_EMAIL || '').trim(),
    password: process.env.SEED_ADMIN_PASSWORD || '',
  };
  const saved = readSavedAdmin();

  if (!hasAdmin) {
    const email = fromEnv.email || saved?.email || SEED_EMAIL;
    const password = fromEnv.password || saved?.password || makePassword();
    const body = await request(`${root}/admin/register-admin`, {
      method: 'POST',
      body: {
        email,
        password,
        firstname: 'Seed',
        lastname: 'Local',
      },
    });
    saveAdmin(email, password);
    console.log('No había administrador. Creé uno local (solo esta máquina):');
    console.log(`  email: ${email}`);
    console.log(`  clave: ${password}`);
    console.log('  también quedó en .tmp/seed-admin.json');
    const token = body?.data?.token;
    if (!token) fail('El registro del administrador no devolvió un token.');
    return token;
  }

  const attempts = [];
  if (fromEnv.email && fromEnv.password) attempts.push(fromEnv);
  if (saved) attempts.push(saved);

  let lastError = null;
  for (const attempt of attempts) {
    try {
      const token = await login(root, attempt.email, attempt.password);
      console.log(`Entré con el administrador ${attempt.email}.`);
      return token;
    } catch (error) {
      if (!error.seed || String(error.message).includes('No pude conectar')) throw error;
      lastError = error;
    }
  }

  fail(
    [
      'Ya hay un administrador y no pude entrar.',
      'Poné SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD en el .env (los de tu panel) y volvé a correr npm run seed.',
      lastError ? String(lastError.message || lastError) : '',
    ]
      .filter(Boolean)
      .join('\n')
  );
}

async function findBySlug(root, token, model, slug) {
  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    pageSize: '5',
  });
  const found = [];
  for (const status of ['published', 'draft']) {
    params.set('status', status);
    const body = await request(
      `${root}/content-manager/collection-types/${model}?${params}`,
      { token }
    );
    for (const entry of body.results || []) {
      if (entry.slug === slug) found.push(entry);
    }
  }
  return found;
}

function documentIdFrom(body) {
  return body?.data?.documentId || body?.documentId || null;
}

async function publishNew(root, token, model, data) {
  const body = await request(
    `${root}/content-manager/collection-types/${model}/actions/publish`,
    { method: 'POST', token, body: data }
  );
  const documentId = documentIdFrom(body);
  if (!documentId) {
    fail(`Publiqué en ${model} pero no vino documentId.\n${JSON.stringify(body)}`);
  }
  return documentId;
}

async function uploadPlaceholder(root, token, filename) {
  const filePath = path.join(PLACEHOLDERS, filename);
  if (!fs.existsSync(filePath)) {
    fail(`Falta la imagen de ejemplo ${filePath}.`);
  }
  const bytes = fs.readFileSync(filePath);
  const form = new FormData();
  form.append('files', new Blob([bytes], { type: 'image/png' }), filename);
  const body = await request(`${root}/upload`, { method: 'POST', token, form });
  const file = Array.isArray(body) ? body[0] : body;
  if (!file?.id) {
    fail(`La subida de ${filename} no devolvió un id.\n${JSON.stringify(body)}`);
  }
  return file.id;
}

function tiendaIsSeeded(entry) {
  if (!entry?.documentId || !entry.publishedAt) return false;
  const whatsappEmpty = entry.whatsapp == null || entry.whatsapp === '';
  return (
    entry.nombre === TIENDA.nombre &&
    entry.texto_envio === TIENDA.texto_envio &&
    entry.moneda === TIENDA.moneda &&
    whatsappEmpty
  );
}

async function readPublishedTienda(root, token) {
  const url = `${root}/content-manager/single-types/${TIENDA_MODEL}?status=published`;
  const headers = { Authorization: `Bearer ${token}` };
  let response;
  try {
    response = await fetch(url, { headers });
  } catch (error) {
    fail(
      `No pude conectar con ${url}. Levantá el CMS con npm run develop y volvé a correr npm run seed.\n${error.message}`
    );
  }
  const text = await response.text();
  let parsed = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }
  if (response.status === 404) return null;
  if (!response.ok) {
    const detail = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
    fail(`GET ${url} respondió ${response.status}.\n${detail}`);
  }
  const data = parsed?.data;
  if (!data || !data.documentId) return null;
  return data;
}

async function ensureTienda(root, token) {
  const current = await readPublishedTienda(root, token);
  if (tiendaIsSeeded(current)) {
    console.log('Tienda: ya estaba.');
    return;
  }
  await request(`${root}/content-manager/single-types/${TIENDA_MODEL}/actions/publish`, {
    method: 'POST',
    token,
    body: TIENDA,
  });
  console.log(current ? 'Tienda: actualizada.' : 'Tienda: creada.');
}

function variantKey(size, color) {
  return `${size}\0${color}`;
}

function belongsToProduct(entry, productDocumentId) {
  const product = entry.product;
  if (!product) return true;
  if (typeof product === 'string') return product === productDocumentId;
  if (product.documentId) return product.documentId === productDocumentId;
  return true;
}

async function listVariants(root, token, productDocumentId) {
  const params = new URLSearchParams({
    pageSize: '100',
    'filters[product][documentId][$eq]': productDocumentId,
  });
  const found = [];
  for (const status of ['published', 'draft']) {
    params.set('status', status);
    const body = await request(
      `${root}/content-manager/collection-types/${VARIANT_MODEL}?${params}`,
      { token }
    );
    for (const entry of body.results || []) {
      if (entry.size && entry.color && belongsToProduct(entry, productDocumentId)) {
        found.push(entry);
      }
    }
  }
  return found;
}

async function ensureVariants(root, token, product, productDocumentId) {
  const existing = await listVariants(root, token, productDocumentId);
  const seen = new Set(existing.map((entry) => variantKey(entry.size, entry.color)));
  for (const variant of product.variants) {
    const key = variantKey(variant.size, variant.color);
    if (seen.has(key)) {
      console.log(`Variante ${product.slug} ${variant.size} / ${variant.color}: ya estaba.`);
      continue;
    }
    const data = {
      size: variant.size,
      color: variant.color,
      color_hex: variant.color_hex,
      stock_quantity: variant.stock_quantity,
      active: true,
      product: {
        connect: [productDocumentId],
      },
    };
    if (variant.price != null) data.price = variant.price;
    await publishNew(root, token, VARIANT_MODEL, data);
    seen.add(key);
    console.log(`Variante ${product.slug} ${variant.size} / ${variant.color}: creada.`);
  }
}

async function countPublished(root, plural) {
  const body = await request(`${root}/api/${plural}?pagination[pageSize]=1`);
  const total = body?.meta?.pagination?.total;
  if (typeof total !== 'number') {
    fail(`La API de ${plural} no trajo meta.pagination.total.\n${JSON.stringify(body)}`);
  }
  return total;
}

async function main() {
  assertDevOnly();
  const root = baseUrl();
  console.log(`Semilla contra ${root}`);

  const token = await tokenFor(root);
  const before = {
    categories: await countPublished(root, 'categories'),
    products: await countPublished(root, 'products'),
    variants: await countPublished(root, 'product-variants'),
  };

  const categoryIds = {};
  for (const category of CATEGORIES) {
    const existing = await findBySlug(root, token, 'api::category.category', category.slug);
    if (existing.length > 0) {
      categoryIds[category.slug] = existing[0].documentId;
      console.log(`Categoría ${category.slug}: ya estaba.`);
      continue;
    }
    categoryIds[category.slug] = await publishNew(root, token, 'api::category.category', {
      name: category.name,
      slug: category.slug,
      description: category.description,
      order: category.order,
      active: category.active,
    });
    console.log(`Categoría ${category.slug}: creada.`);
  }

  for (const product of PRODUCTS) {
    const existing = await findBySlug(root, token, 'api::product.product', product.slug);
    let documentId;
    if (existing.length > 0) {
      documentId = existing[0].documentId;
      console.log(`Producto ${product.slug}: ya estaba.`);
    } else {
      const data = {
        name: product.name,
        slug: product.slug,
        description: product.description,
        base_price: product.base_price,
        featured: product.featured,
        active: product.active,
        pieza_unica: product.pieza_unica,
        categories: {
          connect: product.categories.map((slug) => {
            const categoryId = categoryIds[slug];
            if (!categoryId) fail(`El producto ${product.slug} apunta a la categoría ${slug}, que no existe.`);
            return categoryId;
          }),
        },
      };
      if (product.image) {
        data.image = await uploadPlaceholder(root, token, product.image);
      }
      documentId = await publishNew(root, token, 'api::product.product', data);
      console.log(`Producto ${product.slug}: creado.`);
    }
    await ensureVariants(root, token, product, documentId);
  }

  await ensureTienda(root, token);

  const after = {
    categories: await countPublished(root, 'categories'),
    products: await countPublished(root, 'products'),
    variants: await countPublished(root, 'product-variants'),
  };
  console.log(`Categorías: ${after.categories} (antes ${before.categories})`);
  console.log(`Productos: ${after.products} (antes ${before.products})`);
  console.log(`Variantes: ${after.variants} (antes ${before.variants})`);
}

main().catch((error) => {
  console.error(error.seed ? error.message : error?.stack || error?.message || String(error));
  process.exit(1);
});
