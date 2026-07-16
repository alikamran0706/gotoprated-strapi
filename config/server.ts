export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),

   proxy: true,   
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: env('BACKEND_URL', 'http://cfr1jp25cz1altwthve7xjs0.5.78.100.153.sslip.io'),
});
