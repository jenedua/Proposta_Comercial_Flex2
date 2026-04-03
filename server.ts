import 'dotenv/config';
import {createServer as createViteServer} from 'vite';
import {createApp} from './server/app';

function resolvePort(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function startServer() {
  const app = createApp();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = resolvePort(process.env.PORT, 3001);
  const host = process.env.HOST || '0.0.0.0';
  const server = app.listen(port, host, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `A porta ${port} ja esta em uso. Encerre o processo que estiver usando essa porta ou defina PORT no arquivo .env. Exemplo: PORT=${port + 1}`,
      );
      process.exit(1);
    }

    throw error;
  });
}

startServer().catch((error) => {
  console.error('Falha ao iniciar o servidor:', error);
  process.exit(1);
});
