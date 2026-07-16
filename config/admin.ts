export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    resetPassword: {
      url: `${env('BACKEND_URL', 'http://y11r02bk4czqfk5rmmbs7xax.5.78.100.153.sslip.io')}/auth/reset-password`,
    },
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
