// src/routes/matchmaking-routes.js
async function matchmakingRoutes(fastify, options) {
    const { matchmakingController } = options;

    fastify.post('/bets/join-queue', { preHandler: [fastify.authenticate] }, matchmakingController.joinBetQueue.bind(matchmakingController));
    fastify.post('/mediation/join-queue', { preHandler: [fastify.authenticate] }, matchmakingController.joinMediationQueue.bind(matchmakingController));
    fastify.post('/queue/leave', { preHandler: [fastify.authenticate] }, matchmakingController.leaveQueue.bind(matchmakingController));
    fastify.get('/matches/:matchId', { preHandler: [fastify.authenticate] }, matchmakingController.getMatchDetails.bind(matchmakingController));
}

export default matchmakingRoutes;