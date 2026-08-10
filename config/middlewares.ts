export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:3000',
        'https://gotoprated.com',
        'https://www.gotoprated.com',
        'https://www.y11r02bk4czqfk5rmmbs7xax.5.78.100.153.sslip.io',
        'http://y11r02bk4czqfk5rmmbs7xax.5.78.100.153.sslip.io',
      ],
      headers: ['Content-Type', 'Authorization', 'X-App-Version'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      maxAge: 86400,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
