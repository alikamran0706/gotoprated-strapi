import { mergeConfig, type UserConfig } from 'vite';

export default (config: UserConfig) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    resolve: {
      alias: {
        '@': '/src',
      },
    },

     // ✅ Add this block
    server: {
      allowedHosts: [
        "pgwwo8g80kgwwwcgk8cw8scw.5.78.100.153.sslip.io",
        ".sslip.io",
        "staging.flykaaba.com",
      ],
    },
  });
};
