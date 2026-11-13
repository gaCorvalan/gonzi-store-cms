# Mini Gonzi — CMS

Este proyecto es el CMS de la tienda Mini Gonzi. Corre [Strapi](https://strapi.io) 5.18.1. Ahí cargás productos, categorías, variantes, conjuntos y promociones. La tienda en sí es otra app, en Astro: [mi-emprendimiento](https://github.com/gaCorvalan/mi-emprendimiento). Esa app lee esta API; este CMS no la llama.

## Tipos de contenido

- **Product**: un producto (nombre, descripción, slug, precio base, imagen — puede no tener —, si está destacado o activo).
- **Category**: una categoría, con slug, orden y la posibilidad de colgar subcategorías.
- **Product variant**: talle, color, stock y precio de una variante de un producto.
- **Product set**: un conjunto de productos, con su propio precio.
- **Promotion**: una promo, con descuento por porcentaje o por monto fijo, fechas y código.

## Qué necesitás

- Node.js 22. El archivo `.nvmrc` fija esa versión. Strapi 5.18.1 acepta de 18 a 22; en este proyecto usamos 22.
- npm, el que viene con esa versión de Node.

En local la base es SQLite. No hace falta instalar Postgres ni el driver a mano: `better-sqlite3` 11.3.0 ya está en las dependencias. `pg` queda para producción.

## Cómo correrlo en tu máquina

```bash
nvm use
npm ci
cp .env.example .env
npm run develop
```

La primera vez tarda un poco: Strapi arma el panel de admin. Cuando termina, el log dice que el servidor está en `http://localhost:1337`.

- Panel: http://localhost:1337/admin
- API: http://localhost:1337/api

## Primer administrador

La primera vez que abrís `/admin`, Strapi te pide crear el usuario administrador (nombre, email y contraseña). Ese usuario entra al panel. No sale del `.env`: lo guardás en esa pantalla. Si antes corrés `npm run seed` y todavía no había administrador, el script lo crea y te muestra el email y la clave en la terminal.

## Para que la tienda pueda leer

La app pública pide `GET /api/products` y `GET /api/categories` sin token. Strapi, recién instalado, responde 403: el rol **Public** no tiene permiso de lectura.

`npm run seed` lo deja listo: el rol **Public** puede hacer **find** y **findOne** en **Product**, **Category**, **Product variant** y **Product set**. Si el rol no puede leer variantes y conjuntos, Strapi los saca de la respuesta del producto y la tienda no arma el sitio.

Si no usás el seed, habilitá lo mismo a mano:

1. Entrá al admin.
2. Andá a **Settings → Users & Permissions plugin → Roles → Public**.
3. En **Product**, **Category**, **Product variant** y **Product set**, marcá **find** y **findOne**.
4. Guardá.

Sin eso, la tienda no puede listar productos ni categorías. El resto de las acciones no hace falta para ese listado.

## Variables de entorno

Están todas en `.env.example`, agrupadas y comentadas. Copiá ese archivo a `.env`. Los valores de ejemplo son de relleno: no pongas claves reales en el repo.

En local dejá `DATABASE_CLIENT=sqlite`. El archivo de la base queda en `.tmp/data.db`.

Para Postgres (producción), cambiá `DATABASE_CLIENT` a `postgres` y descomentá `DATABASE_URL`, o el host, el puerto, el nombre, el usuario y la clave. Las opciones de conexión segura, el esquema y el tamaño del pool también están en el ejemplo. El paquete `pg` ya está instalado.

Cloudinary (`CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`) es el lugar de las imágenes cuando las tres variables tienen valor. Si las dejás vacías, Strapi guarda los archivos en `public/uploads` de esta máquina. El admin abre igual, y podés subir archivos sin una cuenta de Cloudinary.

## Cómo se conecta con la tienda

[mi-emprendimiento](https://github.com/gaCorvalan/mi-emprendimiento) usa la variable `STRAPI_URL` (si no está, usa `http://localhost:1337`). Al construir el sitio, `src/lib/strapi-loader.ts` hace:

- `GET {STRAPI_URL}/api/products?populate=*`
- `GET {STRAPI_URL}/api/categories?populate=*`

Esos datos alimentan las colecciones de Astro (productos y categorías). Por eso este CMS tiene que estar corriendo y el rol Public tiene que poder hacer `find` en esos dos tipos. Las imágenes salen de Cloudinary si configuraste la cuenta, o de `public/uploads` si no.

## Probar todo junto

El CMS y la tienda van en carpetas distintas. En este proyecto:

```bash
nvm use
npm ci
cp .env.example .env
npm run develop
```

Cuando el log dice que el servidor está en `http://localhost:1337`, en otra terminal, desde esta misma carpeta:

```bash
npm run seed
```

Eso publica 2 categorías y 3 productos de ejemplo. Uno no tiene imagen. Si lo corrés de nuevo, no duplica. La primera vez, si todavía no creaste el administrador, el script lo crea y te muestra el email y la clave. Quedan en `.tmp/seed-admin.json`. Si el administrador ya existía, poné `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` en el `.env`.

En [mi-emprendimiento](https://github.com/gaCorvalan/mi-emprendimiento):

```bash
STRAPI_URL=http://localhost:1337 npm run build && npm run preview
```
