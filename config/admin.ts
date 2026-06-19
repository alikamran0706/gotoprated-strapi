export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    resetPassword: {
      url: `${env('BACKEND_URL', 'https://production.flykaaba.com')}/auth/reset-password`,
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
