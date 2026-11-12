# Mini Gonzi — CMS

Este proyecto es el CMS de la tienda Mini Gonzi. Corre [Strapi](https://strapi.io) 5.18.1. Ahí cargás productos, categorías, variantes, conjuntos y promociones. La tienda en sí es otra app, en Astro: [mi-emprendimiento](https://github.com/gaCorvalan/mi-emprendimiento). Esa app lee esta API; este CMS no la llama.

## Tipos de contenido

- **Product**: un producto (nombre, descripción, slug, precio base, imagen, si está destacado o activo).
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

La primera vez que abrís `/admin`, Strapi te pide crear el usuario administrador (nombre, email y contraseña). Ese usuario entra al panel. No sale del `.env`: lo guardás en esa pantalla.

## Para que la tienda pueda leer

La app pública pide `GET /api/products` y `GET /api/categories` sin token, con `?populate=*`.

Al arrancar, el CMS le asegura al rol **Public** permiso de solo lectura (`find` y `findOne`) en **Product**, **Category**, **Product variant** y **Product set**. Si el permiso ya está, no crea otro. Si marcaste algo más a mano, lo deja. No habilita `create`, `update` ni `delete`, y no toca **Promotion**.

`populate=*` pide las relaciones del primer nivel. Strapi las devuelve solo si el rol puede hacer `find` en el tipo relacionado. Sin eso, `product_variants` y `product_sets` no salen en el JSON, aunque el producto o la categoría sí. Por eso la variante y el conjunto entran en esa lectura. `findOne` queda junto a `find` para leer un ítem por id.

No hace falta entrar a **Settings → Users & Permissions plugin → Roles → Public** para marcarlos.

## Variables de entorno

Están todas en `.env.example`, agrupadas y comentadas. Copiá ese archivo a `.env`. Los valores de ejemplo son de relleno: no pongas claves reales en el repo.

En local dejá `DATABASE_CLIENT=sqlite`. El archivo de la base queda en `.tmp/data.db`.

Para Postgres (producción), cambiá `DATABASE_CLIENT` a `postgres` y descomentá `DATABASE_URL`, o el host, el puerto, el nombre, el usuario y la clave. Las opciones de conexión segura, el esquema y el tamaño del pool también están en el ejemplo. El paquete `pg` ya está instalado.

Cloudinary (`CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`) es el lugar donde se guardan las imágenes. Podés arrancar con esos campos vacíos; el admin abre igual, pero subir un archivo falla hasta que los completes.

## Cómo se conecta con la tienda

[mi-emprendimiento](https://github.com/gaCorvalan/mi-emprendimiento) usa la variable `STRAPI_URL` (si no está, usa `http://localhost:1337`). Al construir el sitio, `src/lib/strapi-loader.ts` hace:

- `GET {STRAPI_URL}/api/products?populate=*`
- `GET {STRAPI_URL}/api/categories?populate=*`

Esos datos alimentan las colecciones de Astro (productos y categorías). Por eso este CMS tiene que estar corriendo. El permiso de lectura del rol Public se aplica solo al arrancar, como dice la sección anterior. Las imágenes de los productos salen de Cloudinary, que es donde este proyecto sube los archivos.
