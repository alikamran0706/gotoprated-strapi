export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),

   proxy: true,   
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: env('BACKEND_URL', 'http://y11r02bk4czqfk5rmmbs7xax.5.78.100.153.sslip.io'),
});
