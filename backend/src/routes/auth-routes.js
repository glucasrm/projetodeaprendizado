import { registerUser, loginUser } from '../controllers/auth-controller.js';


export default async function (fastify, opts) {
  fastify.post('/register', registerUser);
  fastify.post('/login', loginUser);
  // Mais rotas de auth se necessário...
}