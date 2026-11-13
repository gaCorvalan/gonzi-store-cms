# Cambios

## Sin publicar

- Sin datos de Cloudinary, los archivos se guardan en esta máquina. La imagen del producto ya no es obligatoria.
- Al arrancar, el rol Public queda con `find` y `findOne` en productos, categorías, variantes y conjuntos, así la tienda lee el catálogo con `populate=*` sin marcar permisos a mano.
- Se sacó el tipo único Debug y `GET /api/debug/env`. Esa ruta no pedía usuario y devolvía el nombre y la clave de Cloudinary.
- Arranque local con SQLite después de `npm ci`: se agregó `better-sqlite3` 11.3.0, se completó `.env.example`, el README y `.nvmrc` (Node 22).
