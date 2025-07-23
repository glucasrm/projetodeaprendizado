// src/routes/friendship-routes.js (Sem alterações significativas aqui, apenas para referência)

async function friendshipRoutes(fastify, options) {
  const { friendshipController } = options; // friendshipController virá do registro do plugin

  // Schema de validação para enviar convite
  const sendRequestSchema = {
    body: {
      type: 'object',
      required: ['receiverId'],
      properties: {
        receiverId: { type: 'string' }
      }
    }
  };

  // Schema de validação para aceitar/recusar convite
  const respondRequestSchema = {
    params: {
      type: 'object',
      required: ['friendshipId'],
      properties: {
        friendshipId: { type: 'string' }
      }
    },
    // Removido 'userId' do body. O controller agora usa request.user.sub para validação.
    // Pode ser mantido aqui para fins de documentação, mas não é estritamente necessário para a validação.
    body: {
      type: 'object',
      // required: ['userId'], // Não é mais necessário no body, pois pegamos do token
      properties: {
        userId: { type: 'string' } // Pode manter para documentação swagger/fastify-swagger
      }
    }
  };

  // Schema de validação para listar amigos/convites
  const getUserDataSchema = {
    params: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string' }
      }
    }
  };

  // Schema de validação para remover amizade
  const removeFriendshipSchema = {
    params: {
      type: 'object',
      required: ['friendshipId'],
      properties: {
        friendshipId: { type: 'string' }
      }
    },
    body: {
      type: 'object',
      // required: ['userId'], // Não é mais necessário no body, pois pegamos do token
      properties: {
        userId: { type: 'string' } // Pode manter para documentação swagger/fastify-swagger
      }
    }
  };

  // Rotas da API de amizade

  fastify.post('/friends/request', {
    preHandler: fastify.authenticate,
    schema: sendRequestSchema,
    handler: async (request, reply) => friendshipController.sendFriendRequest(request, reply)
  });

  // Mudança de PUT para PATCH (mais semântico para atualização parcial de status)
  fastify.patch('/friends/:friendshipId/accept', {
    preHandler: fastify.authenticate,
    schema: respondRequestSchema,
    handler: async (request, reply) => friendshipController.acceptFriendRequest(request, reply)
  });

  fastify.patch('/friends/:friendshipId/decline', {
    preHandler: fastify.authenticate,
    schema: respondRequestSchema,
    handler: async (request, reply) => friendshipController.declineFriendRequest(request, reply)
  });

  fastify.get('/friends/:userId', {
    preHandler: fastify.authenticate,
    schema: getUserDataSchema,
    handler: async (request, reply) => friendshipController.getFriends(request, reply)
  });

  fastify.get('/friends/pending/:userId', {
    preHandler: fastify.authenticate,
    schema: getUserDataSchema,
    handler: async (request, reply) => friendshipController.getPendingRequests(request, reply)
  });

  fastify.delete('/friends/:friendshipId', {
    preHandler: fastify.authenticate,
    schema: removeFriendshipSchema,
    handler: async (request, reply) => friendshipController.removeFriendship(request, reply)
  });
}

export default friendshipRoutes;