# Cambios

## Sin publicar

- Strapi pasa de 5.18.1 a 5.62.0. Hace falta Node.js 22.19 o más nuevo.
- `npm run seed` carga 2 categorías y 3 productos publicados (uno sin foto) y no duplica si lo corrés otra vez.
- Sin datos de Cloudinary, los archivos se guardan en esta máquina. La imagen del producto ya no es obligatoria.
- Al arrancar, el rol Public queda con `find` y `findOne` en productos, categorías, variantes y conjuntos, así la tienda lee el catálogo con `populate=*` sin marcar permisos a mano.
- Se sacó el tipo único Debug y `GET /api/debug/env`. Esa ruta no pedía usuario y devolvía el nombre y la clave de Cloudinary.
- Arranque local con SQLite después de `npm ci`: se agregó `better-sqlite3` 11.3.0, se completó `.env.example`, el README y `.nvmrc` (Node 22).
