import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(
    `🚀 Servidor FluênciaLab rodando na porta ${env.PORT} em modo ${env.NODE_ENV}`,
  );
});

const shutdown = () => {
  console.log('Encerrando servidor...');
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
