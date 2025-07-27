export default {
  env: async (ctx) => {
    ctx.body = {
      cloudinary_name: process.env.CLOUDINARY_NAME || 'NOT_SET',
      cloudinary_key: process.env.CLOUDINARY_KEY || 'NOT_SET',
      cloudinary_secret: process.env.CLOUDINARY_SECRET ? 'SET' : 'NOT_SET',
      node_env: process.env.NODE_ENV,
      upload_provider: strapi.config.get('plugin.upload.provider') || 'NOT_CONFIGURED'
    }
  }
}