// index.js
import app from './src/app.js';

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log('🚀 Servidor rodando em http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
