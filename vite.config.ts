import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { handleLocalApi } from './server/localApiMiddleware.js';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-sheets-api-plugin',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (handleLocalApi(req, res)) {
            return;
          }
          next();
        });
      }
    }
  ],
});
