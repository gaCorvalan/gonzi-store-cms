/**
 * debug router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/debug/env',
      handler: 'debug.env',
      config: {
        auth: false
      }
    },
  ],
}; 