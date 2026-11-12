# Cambios

## Sin publicar

- Se sacó el tipo único Debug y `GET /api/debug/env`. Esa ruta no pedía usuario y devolvía el nombre y la clave de Cloudinary.
- Arranque local con SQLite después de `npm ci`: se agregó `better-sqlite3` 11.3.0, se completó `.env.example`, el README y `.nvmrc` (Node 22).
