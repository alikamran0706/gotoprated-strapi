export default {
  routes: [
    {
      method: 'GET',
      path: '/google-proxy/places/autocomplete',
      handler: 'google-proxy.autocomplete',
      config: { auth: false }
    },
    {
      method: 'GET',
      path: '/google-proxy/places/details',
      handler: 'google-proxy.details',
      config: { auth: false }
    },
    {
      method: 'GET',
      path: '/google-proxy/places/photo',
      handler: 'google-proxy.photo',
      config: { auth: false }
    },
  ]
};