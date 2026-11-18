import type { Core } from '@strapi/strapi';

/**
 * UIDs de solo lectura para el rol Public.
 *
 * `populate=*` pide las relaciones del primer nivel. El sanitizer del
 * content API las elimina si el rol no tiene `find` en el tipo destino
 * (`<uid>.find`). Producto apunta a categoría, variante y conjunto;
 * categoría apunta a producto y a conjunto. Sin ese `find`, el JSON
 * del listado no trae esas relaciones. `findOne` acompaña a
 * `find` para leer un ítem por id. No se otorgan create, update ni
 * delete. Promoción no es relación de estos tipos.
 *
 * Tienda es un tipo único: su ruta pública es `GET /api/tienda`
 * (`find`). No tiene `findOne`.
 */
const PUBLIC_READ_UIDS = [
  'api::product.product',
  'api::category.category',
  'api::product-variant.product-variant',
  'api::product-set.product-set',
] as const;

const PUBLIC_SINGLE_FIND_UIDS = ['api::tienda.tienda'] as const;

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

  const ensureAction = async (uid: string, actionName: string) => {
    const action = `${uid}.${actionName}`;
    const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
      where: {
        action,
        role: { id: publicRole.id },
      },
    });

    if (existing) {
      alreadyPresent += 1;
      return;
    }

    await strapi.db.query('plugin::users-permissions.permission').create({
      data: {
        action,
        role: publicRole.id,
      },
    });
    created += 1;
  };

  for (const uid of PUBLIC_READ_UIDS) {
    for (const actionName of READ_ACTIONS) {
      await ensureAction(uid, actionName);
    }
  }

  for (const uid of PUBLIC_SINGLE_FIND_UIDS) {
    await ensureAction(uid, 'find');
  }

  strapi.log.info(
    `Rol Public: find y findOne en product, category, product-variant y product-set; find en tienda. Nuevos: ${created}. Ya estaban: ${alreadyPresent}.`
  );
}
