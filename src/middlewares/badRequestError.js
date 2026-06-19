// path to my file: src/middlewares/badRequestError.js
module.exports = () => {
  return async (ctx, next) => { 
    console.log('ddddddddddddddddddddddd')
    if (ctx.request.url === "/api/auth/local" && ctx.response.status === 400) {
      return ctx.badRequest("Email or password - invalid. Please try again");
    }
    await next();
  };
};

module.exports = [
  "strapi::errors",
  "strapi::security",
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
  "global::badRequestErorr",
  {
    resolve: "../src/middlewares/badRequestErorr.js",
    config: {},
  },
];