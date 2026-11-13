/**
 * Datos de ejemplo para desarrollo. No corre al arrancar Strapi:
 * solo cuando hacés `npm run seed`, contra el CMS que ya está en marcha.
 *
 * Habla únicamente con 127.0.0.1 y se niega si la base no es SQLite.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const PLACEHOLDERS = path.join(__dirname, 'placeholders');
const ADMIN_FILE = path.join(ROOT, '.tmp', 'seed-admin.json');
const SEED_EMAIL = 'seed-local@example.com';

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

const PRODUCTS = [
  {
    slug: 'body-de-algodon',
    name: 'Body de algodón',
    description: 'Body de algodón suave, manga corta.',
    base_price: 18900,
    featured: true,
    active: true,
    category: 'bodies',
    image: 'body-de-algodon.png',
  },
  {
    slug: 'gorrito',
    name: 'Gorrito',
    description: 'Gorrito de abrigo para recién nacido.',
    base_price: 7500,
    featured: false,
    active: true,
    category: 'accesorios',
    image: 'gorrito.png',
  },
  {
    slug: 'manta',
    name: 'Manta',
    description: 'Manta liviana. Esta ficha no tiene foto a propósito.',
    base_price: 24000,
    featured: false,
    active: true,
    category: 'bodies',
    image: null,
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

function enableAction(permissions, typeName, controllerName, actionName) {
  const action = permissions?.[typeName]?.controllers?.[controllerName]?.[actionName];
  if (!action) {
    fail(
      `No encontré el permiso ${typeName}.${controllerName}.${actionName}. ¿El CMS ya terminó de arrancar?`
    );
  }
  action.enabled = true;
}

async function ensurePublicRead(root, token) {
  const list = await request(`${root}/users-permissions/roles`, { token });
  const publicRole = (list.roles || []).find((role) => role.type === 'public');
  if (!publicRole) fail('No encontré el rol Public.');

  const detail = await request(`${root}/users-permissions/roles/${publicRole.id}`, { token });
  const permissions = detail?.role?.permissions;
  if (!permissions) fail('La respuesta del rol Public no trae permisos.');

  const reads = [
    ['api::product', 'product'],
    ['api::category', 'category'],
    ['api::product-variant', 'product-variant'],
    ['api::product-set', 'product-set'],
  ];
  for (const [typeName, controllerName] of reads) {
    enableAction(permissions, typeName, controllerName, 'find');
    enableAction(permissions, typeName, controllerName, 'findOne');
  }

  await request(`${root}/users-permissions/roles/${publicRole.id}`, {
    method: 'PUT',
    token,
    body: {
      name: detail.role.name,
      description: detail.role.description,
      permissions,
    },
  });
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
  return body?.data?.documentId || body?.documentId || body?.data?.data?.documentId || null;
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
  const file = Array.isArray(body) ? body[0] : body?.data?.[0] || body;
  if (!file?.id) {
    fail(`La subida de ${filename} no devolvió un id.\n${JSON.stringify(body)}`);
  }
  return file.id;
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
  await ensurePublicRead(root, token);

  const before = {
    categories: await countPublished(root, 'categories'),
    products: await countPublished(root, 'products'),
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
    if (existing.length > 0) {
      console.log(`Producto ${product.slug}: ya estaba.`);
      continue;
    }
    const data = {
      name: product.name,
      slug: product.slug,
      description: product.description,
      base_price: product.base_price,
      featured: product.featured,
      active: product.active,
      categories: {
        connect: [categoryIds[product.category]],
      },
    };
    if (product.image) {
      data.image = await uploadPlaceholder(root, token, product.image);
    }
    await publishNew(root, token, 'api::product.product', data);
    console.log(`Producto ${product.slug}: creado.`);
  }

  const after = {
    categories: await countPublished(root, 'categories'),
    products: await countPublished(root, 'products'),
  };
  console.log(`Categorías: ${after.categories} (antes ${before.categories})`);
  console.log(`Productos: ${after.products} (antes ${before.products})`);
}

main().catch((error) => {
  console.error(error.seed ? error.message : error?.stack || error?.message || String(error));
  process.exit(1);
});
