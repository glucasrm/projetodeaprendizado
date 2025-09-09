// src/controllers/tournament-controller.js

class TournamentController {
  constructor(tournamentService) {
    this.tournamentService = tournamentService;
  }

  async create(request, reply) {
    try {
      const creatorId = request.user.sub;
      const result = await this.tournamentService.createTournament(request.body, creatorId);
      return reply.status(201).send(result);
    } catch (error) {
      request.log.error(error, 'Erro ao criar torneio');
      return reply.status(400).send({ success: false, message: error.message });
    }
  }
}

export default TournamentController;
