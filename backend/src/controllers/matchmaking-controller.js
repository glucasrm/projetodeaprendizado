// src/controllers/matchmaking-controller.js (VERSÃO COM LIMITAÇÃO DE APOSTAS)

class MatchmakingController {
  constructor(matchmakingService) {
    this.matchmakingService = matchmakingService;
  }

  // MÉTODO MODIFICADO: Entrar na fila de apostas com verificação de limite
  async joinBetQueue(request, reply) {
    const { betAmount, modality, platform, gameSlug } = request.body;
    const userId = request.user.sub;

    if (!userId) {
      return reply.status(401).send({ message: "Usuário não autenticado." });
    }

    // Validar dados obrigatórios
    if (!betAmount || !modality || !platform || !gameSlug) {
      return reply.status(400).send({ 
        message: "Dados obrigatórios faltando: betAmount, modality, platform, gameSlug." 
      });
    }

    // Validar valor da aposta
    const parsedBetAmount = parseFloat(betAmount);
    if (isNaN(parsedBetAmount) || parsedBetAmount <= 0) {
      return reply.status(400).send({ 
        message: "Valor da aposta deve ser um número positivo." 
      });
    }

    try {
      console.log(`User ${userId} attempting to join bet queue for ${parsedBetAmount}`);
      
      const result = await this.matchmakingService.joinBetQueue(userId, parsedBetAmount, modality, platform, gameSlug);
      
      // Se o usuário foi bloqueado por limite de apostas, retornar status 409 (Conflict)
      if (!result.success && result.message.includes('máximo de apostas')) {
        return reply.status(409).send(result);
      }
      
      return reply.send(result);
    } catch (error) {
      console.error('Erro no controller joinBetQueue:', error);
      request.log.error(error);
      return reply.status(500).send({ 
        message: "Erro ao entrar na fila de apostas.", 
        error: error.message 
      });
    }
  }

  // NOVO MÉTODO: Obter status de apostas do usuário
  async getUserBetStatus(request, reply) {
    const userId = request.user.sub;

    if (!userId) {
      return reply.status(401).send({ message: "Usuário não autenticado." });
    }

    try {
      const result = await this.matchmakingService.getUserBetStatus(userId);
      return reply.send(result);
    } catch (error) {
      console.error('Erro ao obter status de apostas:', error);
      request.log.error(error);
      return reply.status(500).send({ 
        message: "Erro ao obter status de apostas.", 
        error: error.message 
      });
    }
  }

  // NOVO MÉTODO: Verificar se usuário pode entrar em nova aposta
  async canJoinNewBet(request, reply) {
    const userId = request.user.sub;

    if (!userId) {
      return reply.status(401).send({ message: "Usuário não autenticado." });
    }

    try {
      const result = await this.matchmakingService.getUserBetStatus(userId);
      
      if (result.success) {
        return reply.send({
          success: true,
          canJoin: result.canJoinNewBet,
          reason: result.canJoinNewBet 
            ? 'Usuário pode entrar em nova aposta' 
            : `Usuário já possui ${result.currentActive} aposta(s) ativa(s). Limite: ${result.maxAllowed}`,
          userType: result.userType,
          currentActive: result.currentActive,
          maxAllowed: result.maxAllowed
        });
      } else {
        return reply.status(500).send(result);
      }
    } catch (error) {
      console.error('Erro ao verificar se pode entrar em nova aposta:', error);
      request.log.error(error);
      return reply.status(500).send({ 
        message: "Erro ao verificar permissão para nova aposta.", 
        error: error.message 
      });
    }
  }

  // ========== MÉTODOS EXISTENTES (INALTERADOS) ==========

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

  async completeMediation(request, reply) {
    const { matchId, result, statistics } = request.body;
    const mediatorId = request.user.sub;

    if (!mediatorId) {
      return reply.status(401).send({ message: "Mediador não autenticado." });
    }

    if (!matchId || !result) {
      return reply.status(400).send({ message: "matchId e result são obrigatórios." });
    }

    const validResults = ['player1_win', 'player2_win', 'draw', 'player1_wo', 'player2_wo', 'cancelled'];
    if (!validResults.includes(result)) {
      return reply.status(400).send({ message: "Resultado inválido." });
    }

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

  async getPlayerStatsSummary(request, reply) {
  try {
    const { userId } = request.params;
    const { gameSlug, period } = request.query;
    const stats = await this.matchmakingService.getPlayerStatsSummary(userId, gameSlug, period);
    return reply.send(stats);
  } catch (error) {
    request.log.error(error, 'Erro ao buscar resumo de estatísticas do jogador');
    return reply.status(500).send({ success: false, message: 'Erro interno do servidor.' });
  }
}
async getPlayersRanking(request, reply) {
    try {
      // Extrai os parâmetros da query com valores padrão
      const { 
        gameSlug, 
        sortBy = 'winRate', 
        limit = 50, 
        offset = 0 
      } = request.query;

      if (!gameSlug) {
        return reply.status(400).send({ success: false, message: 'O parâmetro gameSlug é obrigatório.' });
      }

      const result = await this.matchmakingService.getPlayersRanking(gameSlug, sortBy, limit, offset);
      
      return reply.send(result);

    } catch (error) {
      request.log.error(error, 'Erro ao buscar ranking de jogadores');
      return reply.status(500).send({ success: false, message: 'Erro interno do servidor ao processar o ranking.' });
    }
  }

}

export default MatchmakingController;

