import type { Core } from '@strapi/strapi';

/**
 * UIDs de solo lectura para el rol Public.
 *
 * `populate=*` pide las relaciones del primer nivel. El sanitizer del
 * content API las elimina si el rol no tiene `find` en el tipo destino
 * (`<uid>.find`). Producto apunta a variante y conjunto; categoría
 * también apunta a conjunto. Sin ese `find`, el JSON del listado no
 * trae `product_variants` ni `product_sets`. `findOne` acompaña a
 * `find` para leer un ítem por id. No se otorgan create, update ni
 * delete. Promoción no es relación de estos tipos.
 */
const PUBLIC_READ_UIDS = [
  'api::product.product',
  'api::category.category',
  'api::product-variant.product-variant',
  'api::product-set.product-set',
] as const;

const READ_ACTIONS = ['find', 'findOne'] as const;

export async function ensurePublicCatalogPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) {
    throw new Error(
      'No existe el rol Public de users-permissions. No se pueden asegurar los permisos de catálogo.'
    );
  }

  let created = 0;
  let alreadyPresent = 0;

  for (const uid of PUBLIC_READ_UIDS) {
    for (const actionName of READ_ACTIONS) {
      const action = `${uid}.${actionName}`;
      const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
        where: {
          action,
          role: { id: publicRole.id },
        },
      });

      if (existing) {
        alreadyPresent += 1;
        continue;
      }

      await strapi.db.query('plugin::users-permissions.permission').create({
        data: {
          action,
          role: publicRole.id,
        },
      });
      created += 1;
    }
  }

  strapi.log.info(
    `Rol Public: find y findOne en product, category, product-variant y product-set. Nuevos: ${created}. Ya estaban: ${alreadyPresent}.`
  );
}
