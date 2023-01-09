import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from 'vite-plugin-vuetify';

// https://vitejs.dev/config/

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [vue(), vuetify({ autoImport: true })],
    img: 'src',
    server: {
      port: process.env.VITE_SERVE_PORT,
      strictPort: true,
    },
    define: {
      'process.env': process.env,
    },
  });
};
