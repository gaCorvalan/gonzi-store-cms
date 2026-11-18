# Cambios

## Sin publicar

- El slug de producto y de categoría pasa a `uid` (sale del nombre, es obligatorio y único) y la descripción del producto pasa a texto largo. La imagen del producto y la de la categoría solo aceptan imágenes.
- Producto y categoría pasan a many-to-many: un producto puede tener varias categorías y una categoría varios productos. El seed deja Bodies en el body y en la manta, y el body también en Accesorios.
- Strapi pasa de 5.18.1 a 5.62.0. Hace falta Node.js 22.19 o más nuevo.
- `npm run seed` carga 2 categorías y 3 productos publicados (uno sin foto) y no duplica si lo corrés otra vez.
- Sin datos de Cloudinary, los archivos se guardan en esta máquina. La imagen del producto ya no es obligatoria.
- Al arrancar, el rol Public queda con `find` y `findOne` en productos, categorías, variantes y conjuntos, así la tienda lee el catálogo con `populate=*` sin marcar permisos a mano.
- Se sacó el tipo único Debug y `GET /api/debug/env`. Esa ruta no pedía usuario y devolvía el nombre y la clave de Cloudinary.
- Arranque local con SQLite después de `npm ci`: se agregó `better-sqlite3` 11.3.0, se completó `.env.example`, el README y `.nvmrc` (Node 22).
