class MatchmakingController {
  constructor(matchmakingService) {
    this.matchmakingService = matchmakingService;
  }

  async joinBetQueue(request, reply) {
    const { betAmount, modality, platform, gameSlug } = request.body;
    const userId = request.user.sub; // ID do usuário autenticado

    if (!userId) {
      return reply.status(401).send({ message: "Usuário não autenticado." });
    }

    try {
      const result = await this.matchmakingService.joinBetQueue(userId, betAmount, modality, platform, gameSlug);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: "Erro ao entrar na fila de apostas.", error: error.message });
    }
  }
async joinMediationQueue(request, reply) {
  const { modalities, platforms } = request.body;
  const mediatorId = request.user.sub; // ID do usuário autenticado

  if (!mediatorId) {
    return reply.status(401).send({ message: "Mediador não autenticado." });
  }

  try {
    const result = await this.matchmakingService.joinMediationQueue(mediatorId, modalities, platforms);
    return reply.send(result);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: "Erro ao entrar na fila de mediação.", error: error.message });
  }
}


  async leaveQueue(request, reply) {
    const { role } = request.body;
    const userId = request.user.sub; // ID do usuário autenticado

    if (!userId) {
      return reply.status(401).send({ message: "Usuário não autenticado." });
    }

    try {
      const result = await this.matchmakingService.leaveQueue(userId, role);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: "Erro ao sair da fila.", error: error.message });
    }
  }

  async completeMediation(request, reply) {
    const { matchId, result } = request.body;
    const mediatorId = request.user.sub; // ID do mediador autenticado

    if (!mediatorId) {
      return reply.status(401).send({ message: "Mediador não autenticado." });
    }

    // TODO: Adicionar verificação se o usuário é o mediador da partida

    try {
      const completionResult = await this.matchmakingService.completeMediation(mediatorId, matchId, result);
      return reply.send(completionResult);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: "Erro ao finalizar mediação.", error: error.message });
    }
  }

  async getMatchDetails(request, reply) {
    const { matchId } = request.params;

    try {
      const result = await this.matchmakingService.getMatchDetails(matchId);
      if (!result.match) {
        return reply.status(404).send({ message: "Partida não encontrada." });
      }
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: "Erro ao buscar detalhes da partida.", error: error.message });
    }
  }

  async getChatHistory(request, reply) {
    const { chatRoomId } = request.params;

    try {
      const result = await this.matchmakingService.getChatHistory(chatRoomId);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: "Erro ao buscar histórico do chat.", error: error.message });
    }
  }

  async sendMessage(request, reply) {
    const { chatRoomId, content, messageType } = request.body;
    const senderId = request.user.sub; // ID do remetente autenticado

    if (!senderId) {
      return reply.status(401).send({ message: "Usuário não autenticado." });
    }

    try {
      const result = await this.matchmakingService.sendMessage(chatRoomId, senderId, content, messageType);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: "Erro ao enviar mensagem.", error: error.message });
    }
  }
  async listUserConversations(request, reply) {
    const userId = request.user.sub;
    try {
        const result = await this.matchmakingService.listUserConversations(userId);
        return reply.send(result);
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ message: "Erro ao buscar conversas.", error: error.message });
    }
}
}

export default MatchmakingController;

