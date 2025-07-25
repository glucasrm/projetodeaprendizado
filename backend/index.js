// C:\Users\lucas\Desktop\torneio\ggl\backend\index.js

import 'dotenv/config'; // <-- ADICIONE ESTA LINHA AQUI, NO TOPO!

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