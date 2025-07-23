// src/routes/user-routes.js
// Este arquivo define as rotas da API para a gestão de usuários.

// userController é passado via options no app.register
async function userRoutes(fastify, options) {
  const { userController } = options; // Garante que o controller é acessível

  // Schema de validação para a rota de busca de usuários
  const searchUsersSchema = {
    querystring: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string', minLength: 1 },
        page: { type: 'integer', minimum: 1, default: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
      }
    }
  };

  // Schema de validação para buscar usuário por ID
  const getUserByIdSchema = {
    params: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string' }
      }
    }
  };

  // Schema de validação para buscar usuários sugeridos
  const getSuggestedUsersSchema = {
    params: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string' }
      }
    },
    querystring: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
      }
    }
  };

  // Rota GET para buscar usuários por termo de pesquisa
  // CORRIGIDO: Adicionado preHandler para autenticação
  fastify.get('/search', { // A rota final será /api/users/search
    preHandler: [fastify.authenticate], // <--- ADICIONADO AQUI!
    schema: searchUsersSchema,
    handler: async (request, reply) => {
      return await userController.searchUsers(request, reply);
    }
  });

  // Rota GET para buscar um usuário por ID
  // CORRIGIDO: Adicionado preHandler para autenticação
  fastify.get('/:userId', { // A rota final será /api/users/:userId
    preHandler: [fastify.authenticate], // <--- ADICIONADO AQUI!
    schema: getUserByIdSchema,
    handler: async (request, reply) => {
      return await userController.getUserById(request, reply);
    }
  });

  // Rota GET para buscar usuários sugeridos
  // CORRIGIDO: Adicionado preHandler para autenticação
  fastify.get('/:userId/suggestions', { // A rota final será /api/users/:userId/suggestions
    preHandler: [fastify.authenticate], // <--- ADICIONADO AQUI!
    schema: getSuggestedUsersSchema,
    handler: async (request, reply) => {
      return await userController.getSuggestedUsers(request, reply);
    }
  });
}

export default userRoutes;