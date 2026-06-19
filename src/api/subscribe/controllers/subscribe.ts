import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::subscribe.subscribe', ({ strapi }) => ({
  async create(ctx) {
    const email = ctx.request.body?.data?.email;

    if (!email) {
      return ctx.badRequest('Email is required');
    }

    const existing = await strapi.db.query('api::subscribe.subscribe').findOne({
      where: { email },
    });

    if (existing) {
      return ctx.badRequest('You have already subscribed');
    }

    const entry = await strapi.entityService.create('api::subscribe.subscribe', {
      data: ctx.request.body.data,
    });

    return ctx.send({ data: entry }, 201);
  },
}));
