// src/controllers/matchmaking-controller.js (VERSÃO CORRIGIDA)

class MatchmakingController {
  constructor(matchmakingService) {
    this.matchmakingService = matchmakingService;
  }

  async joinBetQueue(request, reply) {
    const { betAmount, modality, platform, gameSlug } = request.body;
    const userId = request.user.sub;

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
  const mediatorId = request.user.sub;

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
    const userId = request.user.sub;

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

  // MÉTODO CORRIGIDO: Finalizar mediação com tratamento de erro melhorado
  async completeMediation(request, reply) {
    const { matchId, result, statistics } = request.body;
    const mediatorId = request.user.sub;

    if (!mediatorId) {
      return reply.status(401).send({ message: "Mediador não autenticado." });
    }

    if (!matchId || !result) {
      return reply.status(400).send({ message: "matchId e result são obrigatórios." });
    }

    // Validar resultado
    const validResults = ['player1_win', 'player2_win', 'draw', 'player1_wo', 'player2_wo', 'cancelled'];
    if (!validResults.includes(result)) {
      return reply.status(400).send({ message: "Resultado inválido." });
    }

    // Validar e limpar estatísticas (se fornecidas)
    let cleanedStatistics = {};
    if (statistics && typeof statistics === 'object') {
      const validStatFields = ['player1Kills', 'player1Assists', 'player1Caps', 'player2Kills', 'player2Assists', 'player2Caps'];
      
      for (const field of validStatFields) {
        if (statistics[field] !== undefined && statistics[field] !== null && statistics[field] !== '') {
          const value = parseInt(statistics[field]);
          if (!isNaN(value) && value >= 0) {
            cleanedStatistics[field] = value;
          }
        }
      }
    }

    try {
      console.log(`Attempting to complete mediation for match ${matchId} with result ${result}`);
      console.log('Statistics:', cleanedStatistics);
      
      const completionResult = await this.matchmakingService.completeMediation(mediatorId, matchId, result, cleanedStatistics);
      
      console.log('Mediation completion result:', completionResult);
      
      return reply.send(completionResult);
    } catch (error) {
      console.error('Error in completeMediation controller:', error);
      console.error('Error stack:', error.stack);
      request.log.error(error);
      return reply.status(500).send({ 
        message: "Erro ao finalizar mediação.", 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async confirmMatch(request, reply) {
    const { matchId } = request.params;
    const userId = request.user.sub;

    if (!userId) {
      return reply.status(401).send({ message: "Usuário não autenticado." });
    }

    try {
      const result = await this.matchmakingService.confirmMatch(matchId, userId);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: "Erro ao confirmar partida.", error: error.message });
    }
  }

  async cancelMatch(request, reply) {
    const { matchId } = request.params;
    const userId = request.user.sub;

    if (!userId) {
      return reply.status(401).send({ message: "Usuário não autenticado." });
    }

    try {
      const result = await this.matchmakingService.cancelMatch(matchId, userId);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: "Erro ao cancelar partida.", error: error.message });
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
    const senderId = request.user.sub;

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

