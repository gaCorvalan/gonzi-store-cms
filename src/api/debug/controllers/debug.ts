/**
 * debug controller
 */

export default {
  async env(ctx) {
    ctx.body = {
      cloudinary_name: process.env.CLOUDINARY_NAME || 'NOT_SET',
      cloudinary_key: process.env.CLOUDINARY_KEY || 'NOT_SET',
      cloudinary_secret: process.env.CLOUDINARY_SECRET ? 'SET' : 'NOT_SET',
      node_env: process.env.NODE_ENV,
      upload_provider: strapi.config.get('plugin.upload.provider') || 'NOT_CONFIGURED',
      strapi_app_keys: process.env.APP_KEYS ? 'SET' : 'NOT_SET',
      database_client: process.env.DATABASE_CLIENT || 'NOT_SET',
      jwt_secret: process.env.JWT_SECRET ? 'SET' : 'NOT_SET'
    };
  }
}; 