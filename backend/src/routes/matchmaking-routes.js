import MatchmakingController from "../controllers/matchmaking-controller.js";

async function matchmakingRoutes(fastify, options) {
  const matchmakingService = options.matchmakingService; 
  
  if (!matchmakingService) {
    throw new Error("MatchmakingService não foi fornecido para as rotas.");
  }

    const matchmakingController = new MatchmakingController(matchmakingService);

  // Rotas de apostas (jogadores)
  fastify.post(
    "/bets/join-queue",
    { onRequest: [fastify.authenticate] },
    (request, reply) => matchmakingController.joinBetQueue(request, reply)
  );

  // Rotas de mediação (mediadores)
  fastify.post(
    "/mediation/join-queue",
    { onRequest: [fastify.authenticate] },
    (request, reply) => matchmakingController.joinMediationQueue(request, reply)
  );

  fastify.post(
    "/mediation/complete",
    { onRequest: [fastify.authenticate] },
    (request, reply) => matchmakingController.completeMediation(request, reply)
  );

  // Rotas gerais de fila (sair da fila)
  fastify.post(
    "/queue/leave",
    { onRequest: [fastify.authenticate] },
    (request, reply) => matchmakingController.leaveQueue(request, reply)
  );

  // Rotas de detalhes da partida
  fastify.get(
    "/matches/:matchId",
    { onRequest: [fastify.authenticate] },
    (request, reply) => matchmakingController.getMatchDetails(request, reply)
  );

  // Rotas de chat
  fastify.get(
    "/chat-history/:chatRoomId",
    { onRequest: [fastify.authenticate] },
    (request, reply) => matchmakingController.getChatHistory(request, reply)
  );

  fastify.post(
    "/chat/send-message",
    { onRequest: [fastify.authenticate] },
    (request, reply) => matchmakingController.sendMessage(request, reply)
  );
  
  fastify.get(
    "/conversations",
    { onRequest: [fastify.authenticate] },
    (request, reply) => matchmakingController.listUserConversations(request, reply)
  );
}

export default matchmakingRoutes;

