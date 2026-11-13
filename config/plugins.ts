export default ({ env }) => {
  const cloudName = env('CLOUDINARY_NAME', '').trim();
  const apiKey = env('CLOUDINARY_KEY', '').trim();
  const apiSecret = env('CLOUDINARY_SECRET', '').trim();

  // Sin las tres variables, Strapi usa el proveedor local (public/uploads).
  if (!cloudName || !apiKey || !apiSecret) {
    return {};
  }

  return {
    upload: {
      config: {
        provider: 'cloudinary',
        providerOptions: {
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        },
        actionOptions: {
          upload: {
            folder: 'gonzi-store',
            resource_type: 'auto',
            use_filename: true,
            unique_filename: false,
            overwrite: false,
          },
          uploadStream: {
            folder: 'gonzi-store',
            resource_type: 'auto',
            use_filename: true,
            unique_filename: false,
            overwrite: false,
          },
          delete: {},
        },
      },
    },
  };
};
