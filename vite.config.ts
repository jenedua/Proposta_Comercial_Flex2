import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

function resolvePort(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const hmrDisabled = env.DISABLE_HMR === 'true';
  const hmrPort = resolvePort(env.VITE_HMR_PORT ?? env.HMR_PORT, 24678);

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: hmrDisabled
        ? false
        : {
            host: env.VITE_HMR_HOST || 'localhost',
            port: hmrPort,
            clientPort: hmrPort,
          },
    },
  };
});
