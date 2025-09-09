// src/routes/tournament-routes.js

import TournamentController from '../controllers/tournament-controller.js';

async function tournamentRoutes(fastify, options) {
  const tournamentController = new TournamentController(options.tournamentService);

  fastify.post(
    '/',
    {
      onRequest: [fastify.authenticate],
      // Adicione um schema de validação aqui no futuro
    },
    (request, reply) => tournamentController.create(request, reply)
  );

  // Adicione outras rotas (GET, PUT, DELETE) aqui
}

export default tournamentRoutes;
