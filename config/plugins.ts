export default ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {
          folder: 'gonzi-store', // Carpeta en Cloudinary donde se guardarán los archivos
          resource_type: 'auto', // Detecta automáticamente el tipo de archivo
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
});
