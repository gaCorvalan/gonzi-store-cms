# Cambios

## Sin publicar

- `npm run seed` carga 2 categorías y 3 productos publicados (uno sin foto) y no duplica si lo corrés otra vez. Sin datos de Cloudinary, los archivos se guardan en el disco local. La imagen del producto ya no es obligatoria.
- Se sacó el tipo único Debug y `GET /api/debug/env`. Esa ruta no pedía usuario y devolvía el nombre y la clave de Cloudinary.
- Arranque local con SQLite después de `npm ci`: se agregó `better-sqlite3` 11.3.0, se completó `.env.example`, el README y `.nvmrc` (Node 22).
