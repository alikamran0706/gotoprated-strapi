import axios from 'axios';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE = 'https://maps.googleapis.com/maps/api/place';

export default {
  async autocomplete(ctx: any) {
    const { input, types } = ctx.query;
    const { data } = await axios.get(`${BASE}/autocomplete/json`, {
      params: { input, types, key: API_KEY }
    });
    ctx.body = data;
  },

  async details(ctx: any) {
    const { place_id, fields } = ctx.query;
    const { data } = await axios.get(`${BASE}/details/json`, {
      params: { place_id, fields, key: API_KEY }
    });
    ctx.body = data;
  },

  async photo(ctx: any) {
    const { photo_reference, maxwidth = 800 } = ctx.query;
    const response = await axios.get(`${BASE}/photo`, {
      params: { photo_reference, maxwidth, key: API_KEY },
      responseType: 'arraybuffer',
    });
    ctx.set('Content-Type', response.headers['content-type']);
    ctx.body = response.data;
  },
};