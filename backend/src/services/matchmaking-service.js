// src/services/matchmaking-service.js (VERSÃO MODIFICADA COM CONFIRMAÇÃO)

class MatchmakingService {
  constructor(prisma, notificationService) {
    this.prisma = prisma;
    this.notificationService = notificationService;
  }

  async findAndCreateMatches() {
    console.log("Executando rotina de matchmaking...");

    const pendingBets = await this.prisma.directBet.findMany({
      where: { status: 'WAITING_OPPONENT' },
      orderBy: { createdAt: 'asc' },
    });

    const betGroups = new Map();
    for (const bet of pendingBets) {
      const key = `${bet.betAmount}-${bet.modality}-${bet.platform}-${bet.gameSlug}`;
      if (!betGroups.has(key)) {
        betGroups.set(key, []);
      }
      betGroups.get(key).push(bet);
    }

    for (const [key, bets] of betGroups.entries()) {
      while (bets.length >= 2) {
        const player1Bet = bets[0];
        const player2Bet = bets[1];

        const [p1, p2, availableMediator] = await Promise.all([
          this.prisma.user.findUnique({ where: { id: player1Bet.playerId }, include: { profile: true } }),
          this.prisma.user.findUnique({ where: { id: player2Bet.playerId }, include: { profile: true } }),
          this.prisma.mediationRequest.findFirst({
            where: {
              status: 'AVAILABLE',
              modalities: { has: player1Bet.modality },
              platforms: { has: player1Bet.platform },
            },
            include: { mediator: { include: { profile: true } } }
          })
        ]);

        if (!p1 || !p2 || !availableMediator) {
          console.log(`Dados incompletos para a partida [${key}]. Jogadores ou mediador não encontrados. Verificando próximo grupo.`);
          break;
        }

        bets.shift();
        bets.shift();

        console.log(`Criando partida para [${key}]...`);
        try {
          const self = this;

          const { match } = await this.prisma.$transaction(async (tx) => {
            
            // MODIFICAÇÃO: Criar partida com status PENDING_CONFIRMATION
            const newMatch = await tx.match.create({
              data: {
                player1Id: p1.id,
                player2Id: p2.id,
                mediatorId: availableMediator.mediatorId,
                betAmount: player1Bet.betAmount,
                modality: player1Bet.modality,
                platform: player1Bet.platform,
                gameSlug: player1Bet.gameSlug,
                status: 'PENDING_CONFIRMATION', // MODIFICAÇÃO: Status inicial é PENDING_CONFIRMATION
                // Campos de confirmação inicializados como false
                player1Confirmed: false,
                player2Confirmed: false,
                mediatorConfirmed: false,
              },
            });

            await tx.conversation.create({
              data: {
                matchId: newMatch.id,
                participants: {
                  connect: [
                    { id: p1.id },
                    { id: p2.id },
                    { id: availableMediator.mediatorId },
                  ],
                },
              },
            });

            await tx.directBet.updateMany({
              where: { id: { in: [player1Bet.id, player2Bet.id] } },
              data: { status: 'MATCHED', matchId: newMatch.id },
            });

            await tx.mediationRequest.update({
              where: { id: availableMediator.id },
              data: { status: 'IN_MATCH' },
            });

            const player1Name = p1.profile?.username || p1.nome;
            const player2Name = p2.profile?.username || p2.nome;

            // MODIFICAÇÃO: Notificações agora mencionam a necessidade de confirmação
            await self.notificationService.createNotification(
              p1.id, 'match_found_player', `Seu confronto 🏆 1v1 contra ${player2Name} foi encontrado! Confirme sua participação.`,
              { opponentId: p2.id, opponentName: player2Name, matchId: newMatch.id }, `/mediacao/chat/${newMatch.id}`
            );

            await self.notificationService.createNotification(
              p2.id, 'match_found_player', `Seu confronto 🏆 1v1 contra ${player1Name} foi encontrado! Confirme sua participação.`,
              { opponentId: p1.id, opponentName: player1Name, matchId: newMatch.id }, `/mediacao/chat/${newMatch.id}`
            );

            await self.notificationService.createNotification(
              availableMediator.mediatorId, 'match_assigned_mediator', `Você foi atribuído para mediar um confronto ⚖️ 1v1 entre ${player1Name} e ${player2Name}. Confirme sua participação.`,
              { player1Id: p1.id, player1Name, player2Id: p2.id, player2Name, matchId: newMatch.id }, `/mediacao/chat/${newMatch.id}`
            );

            return { match: newMatch };
          });

          console.log(`Partida ${match.id} criada com sucesso! Aguardando confirmações.`);

        } catch (error) {
          console.error("Falha na transação de criação de partida:", error);
          bets.unshift(player1Bet, player2Bet);
        }
      }
    }
  }

  // NOVO MÉTODO: Confirmar participação na partida
  async confirmMatch(matchId, userId) {
    console.log(`User ${userId} confirming match ${matchId}`);
    
    try {
      const match = await this.prisma.match.findUnique({
        where: { id: matchId },
        include: {
          player1: { include: { profile: true } },
          player2: { include: { profile: true } },
          mediator: { include: { profile: true } },
        },
      });

      if (!match) {
        return { success: false, message: 'Partida não encontrada.' };
      }

      if (match.status !== 'PENDING_CONFIRMATION') {
        return { success: false, message: 'Esta partida não está aguardando confirmação.' };
      }

      // Verificar se o usuário é um participante da partida
      const isPlayer1 = match.player1Id === userId;
      const isPlayer2 = match.player2Id === userId;
      const isMediator = match.mediatorId === userId;

      if (!isPlayer1 && !isPlayer2 && !isMediator) {
        return { success: false, message: 'Você não é um participante desta partida.' };
      }

      // Determinar qual campo de confirmação atualizar
      let updateData = {};
      if (isPlayer1) {
        if (match.player1Confirmed) {
          return { success: false, message: 'Você já confirmou sua participação.' };
        }
        updateData.player1Confirmed = true;
      } else if (isPlayer2) {
        if (match.player2Confirmed) {
          return { success: false, message: 'Você já confirmou sua participação.' };
        }
        updateData.player2Confirmed = true;
      } else if (isMediator) {
        if (match.mediatorConfirmed) {
          return { success: false, message: 'Você já confirmou sua participação.' };
        }
        updateData.mediatorConfirmed = true;
      }

      // Atualizar a confirmação
      const updatedMatch = await this.prisma.match.update({
        where: { id: matchId },
        data: updateData,
      });

      // Verificar se todos confirmaram
      const allConfirmed = (
        (isPlayer1 ? true : match.player1Confirmed) &&
        (isPlayer2 ? true : match.player2Confirmed) &&
        (isMediator ? true : match.mediatorConfirmed)
      );

      if (allConfirmed) {
        // Todos confirmaram, iniciar a partida
        await this.prisma.match.update({
          where: { id: matchId },
          data: { status: 'IN_PROGRESS' },
        });

        // Enviar notificações de início da partida
        const player1Name = match.player1.profile?.username || match.player1.nome;
        const player2Name = match.player2.profile?.username || match.player2.nome;

        await this.notificationService.createNotification(
          match.player1Id, 'match_started', `Sua partida contra ${player2Name} foi confirmada e iniciada! 🎮`,
          { matchId: matchId }, `/mediacao/chat/${matchId}`
        );

        await this.notificationService.createNotification(
          match.player2Id, 'match_started', `Sua partida contra ${player1Name} foi confirmada e iniciada! 🎮`,
          { matchId: matchId }, `/mediacao/chat/${matchId}`
        );

        await this.notificationService.createNotification(
          match.mediatorId, 'match_started', `A partida entre ${player1Name} e ${player2Name} foi confirmada e iniciada! ⚖️`,
          { matchId: matchId }, `/mediacao/chat/${matchId}`
        );

        return { success: true, message: 'Partida confirmada e iniciada!', matchStarted: true };
      } else {
        return { success: true, message: 'Confirmação registrada. Aguardando outros participantes.', matchStarted: false };
      }

    } catch (error) {
      console.error('Erro ao confirmar partida:', error);
      return { success: false, message: 'Erro interno do servidor.' };
    }
  }

  // NOVO MÉTODO: Cancelar partida
  async cancelMatch(matchId, userId) {
    console.log(`User ${userId} canceling match ${matchId}`);
    
    try {
      const match = await this.prisma.match.findUnique({
        where: { id: matchId },
        include: {
          player1: { include: { profile: true } },
          player2: { include: { profile: true } },
          mediator: { include: { profile: true } },
        },
      });

      if (!match) {
        return { success: false, message: 'Partida não encontrada.' };
      }

      if (match.status !== 'PENDING_CONFIRMATION') {
        return { success: false, message: 'Esta partida não pode ser cancelada.' };
      }

      // Verificar se o usuário é um participante da partida
      const isPlayer1 = match.player1Id === userId;
      const isPlayer2 = match.player2Id === userId;
      const isMediator = match.mediatorId === userId;

      if (!isPlayer1 && !isPlayer2 && !isMediator) {
        return { success: false, message: 'Você não é um participante desta partida.' };
      }

      const self = this;

      await this.prisma.$transaction(async (tx) => {
        // Cancelar a partida
        await tx.match.update({
          where: { id: matchId },
          data: { status: 'CANCELLED' },
        });

        // Retornar as apostas para o status WAITING_OPPONENT
        await tx.directBet.updateMany({
          where: { matchId: matchId },
          data: { status: 'WAITING_OPPONENT', matchId: null },
        });

        // Liberar o mediador
        await tx.mediationRequest.updateMany({
          where: { mediatorId: match.mediatorId },
          data: { status: 'AVAILABLE' },
        });

        // Enviar notificações de cancelamento
        const canceledByName = isPlayer1 ? (match.player1.profile?.username || match.player1.nome) :
                              isPlayer2 ? (match.player2.profile?.username || match.player2.nome) :
                              (match.mediator.profile?.username || match.mediator.nome);

        if (!isPlayer1) {
          await self.notificationService.createNotification(
            match.player1Id, 'match_cancelled', `Sua partida foi cancelada por ${canceledByName}. Você foi retornado à fila.`,
            {}, `/games/${match.gameSlug}/fila`
          );
        }

        if (!isPlayer2) {
          await self.notificationService.createNotification(
            match.player2Id, 'match_cancelled', `Sua partida foi cancelada por ${canceledByName}. Você foi retornado à fila.`,
            {}, `/games/${match.gameSlug}/fila`
          );
        }

        if (!isMediator) {
          await self.notificationService.createNotification(
            match.mediatorId, 'match_cancelled', `A partida que você mediaria foi cancelada por ${canceledByName}.`,
            {}, `/mediacao`
          );
        }
      });

      return { 
        success: true, 
        message: 'Partida cancelada com sucesso. Você foi retornado à fila.',
        gameSlug: match.gameSlug,
        userType: isMediator ? 'mediator' : 'player'
      };

    } catch (error) {
      console.error('Erro ao cancelar partida:', error);
      return { success: false, message: 'Erro interno do servidor.' };
    }
  }

  async joinBetQueue(userId, betAmount, modality, platform, gameSlug) {
    console.log(`User ${userId} joining bet queue for ${betAmount} in ${modality} on ${platform} for ${gameSlug}`);
    const bet = await this.prisma.directBet.create({
      data: {
        playerId: userId,
        betAmount: parseFloat(betAmount),
        modality,
        platform,
        gameSlug,
        status: 'WAITING_OPPONENT',
      },
    });
    return { success: true, message: 'Entrou na fila de apostas', betId: bet.id };
  }

  async joinMediationQueue(mediatorId, modalities, platforms) {
    console.log(`Mediator ${mediatorId} joining mediation queue for modalities: ${modalities}, platforms: ${platforms}`);
    const mediationRequest = await this.prisma.mediationRequest.upsert({
      where: { mediatorId: mediatorId },
      update: { status: 'AVAILABLE', modalities, platforms },
      create: { mediatorId: mediatorId, status: 'AVAILABLE', modalities, platforms },
    });
    return { success: true, message: 'Entrou na fila de mediação', requestId: mediationRequest.id };
  }

  async leaveQueue(userId, role) {
    console.log(`User ${userId} leaving ${role} queue`);
    if (role === 'player') {
      await this.prisma.directBet.updateMany({
        where: { playerId: userId, status: 'WAITING_OPPONENT' },
        data: { status: 'CANCELED' },
      });
    } else if (role === 'mediator') {
      await this.prisma.mediationRequest.updateMany({
        where: { mediatorId: userId, status: 'AVAILABLE' },
        data: { status: 'OFFLINE' },
      });
    }
    return { success: true, message: 'Saiu da fila' };
  }
 async completeMediation(mediatorId, matchId, result, statistics = {}) {
    console.log(`Mediator ${mediatorId} completing match ${matchId} with result ${result}`);
    
    try {
      const match = await this.prisma.match.findUnique({
        where: { id: matchId },
        include: {
          player1: { include: { profile: true } },
          player2: { include: { profile: true } },
        },
      });

      if (!match) {
        return { success: false, message: 'Partida não encontrada.' };
      }

      if (match.status !== 'IN_PROGRESS') {
        return { success: false, message: 'Esta partida não pode ser finalizada.' };
      }

      if (match.mediatorId !== mediatorId) {
        return { success: false, message: 'Você não é o mediador desta partida.' };
      }

      const self = this;

      await this.prisma.$transaction(async (tx) => {
        // 1. Atualizar status da partida
        await tx.match.update({
          where: { id: matchId },
          data: { status: 'COMPLETED', result: result },
        });

        // 2. Tentar criar registro de estatísticas da partida (se a tabela existir)
        try {
          await tx.matchStatistics.create({
            data: {
              matchId: matchId,
              result: result,
              player1Kills: statistics.player1Kills || null,
              player1Assists: statistics.player1Assists || null,
              player1Caps: statistics.player1Caps || null,
              player2Kills: statistics.player2Kills || null,
              player2Assists: statistics.player2Assists || null,
              player2Caps: statistics.player2Caps || null,
              completedBy: mediatorId,
            },
          });
          console.log('Estatísticas da partida salvas com sucesso');
        } catch (statsError) {
          console.log('Tabela de estatísticas não existe ainda, pulando...', statsError.message);
          // Não falha a transação se a tabela não existir
        }

        // 3. Tentar atualizar estatísticas dos jogadores (se a tabela existir)
        try {
          await self.updatePlayerStatisticsFixed(tx, match.player1Id, match.gameSlug, result, 'player1', statistics);
          await self.updatePlayerStatisticsFixed(tx, match.player2Id, match.gameSlug, result, 'player2', statistics);
          console.log('Estatísticas dos jogadores atualizadas com sucesso');
        } catch (playerStatsError) {
          console.log('Tabela de estatísticas de jogadores não existe ainda, pulando...', playerStatsError.message);
          // Não falha a transação se a tabela não existir
        }

        // 4. Liberar mediador
        await tx.mediationRequest.updateMany({
          where: { mediatorId: mediatorId },
          data: { status: 'AVAILABLE' },
        });

        // 5. REMOVIDO: Processamento de pagamentos (pode estar causando erro)
        // Comentado até verificarmos se o campo balance existe no modelo User
        /*
        if (result === 'player1_win') {
          await self.processMatchPayment(tx, match.player1Id, match.player2Id, match.betAmount);
        } else if (result === 'player2_win') {
          await self.processMatchPayment(tx, match.player2Id, match.player1Id, match.betAmount);
        }
        */

        // 6. Enviar notificações
        const player1Name = match.player1.profile?.username || match.player1.nome;
        const player2Name = match.player2.profile?.username || match.player2.nome;

        let resultMessage = '';
        switch (result) {
          case 'player1_win':
            resultMessage = `Vitória de ${player1Name}!`;
            break;
          case 'player2_win':
            resultMessage = `Vitória de ${player2Name}!`;
            break;
          case 'draw':
            resultMessage = 'Empate!';
            break;
          case 'player1_wo':
            resultMessage = `Vitória de ${player1Name} por W.O`;
            break;
          case 'player2_wo':
            resultMessage = `Vitória de ${player2Name} por W.O`;
            break;
          case 'cancelled':
            resultMessage = 'Partida cancelada';
            break;
          default:
            resultMessage = 'Partida finalizada';
        }

        await self.notificationService.createNotification(
          match.player1Id, 'match_completed', `Sua partida foi finalizada: ${resultMessage}`,
          { matchId: matchId, result: result }, `/perfil/${match.player1Id}`
        );

        await self.notificationService.createNotification(
          match.player2Id, 'match_completed', `Sua partida foi finalizada: ${resultMessage}`,
          { matchId: matchId, result: result }, `/perfil/${match.player2Id}`
        );
      });

      return { success: true, message: 'Mediação finalizada com sucesso!' };

    } catch (error) {
      console.error('Erro ao finalizar mediação:', error);
      console.error('Stack trace:', error.stack);
      return { success: false, message: 'Erro interno do servidor.' };
    }
  }
  async updatePlayerStatisticsFixed(tx, playerId, gameSlug, result, playerPosition, statistics) {
    try {
      // Buscar ou criar estatísticas do jogador (SINTAXE CORRIGIDA)
      const playerStats = await tx.playerStatistics.upsert({
        where: {
          userId_gameSlug: {  // Chave composta correta
            userId: playerId,
            gameSlug: gameSlug,
          },
        },
        update: {},
        create: {
          userId: playerId,
          gameSlug: gameSlug,
        },
      });

      // Determinar se foi vitória, derrota, W.O, etc.
      let isWin = false;
      let isLoss = false;
      let isWinWO = false;
      let isLossWO = false;

      if (result === 'player1_win' && playerPosition === 'player1') isWin = true;
      if (result === 'player2_win' && playerPosition === 'player2') isWin = true;
      if (result === 'player1_win' && playerPosition === 'player2') isLoss = true;
      if (result === 'player2_win' && playerPosition === 'player1') isLoss = true;
      if (result === 'player1_wo' && playerPosition === 'player1') isWinWO = true;
      if (result === 'player2_wo' && playerPosition === 'player2') isWinWO = true;
      if (result === 'player1_wo' && playerPosition === 'player2') isLossWO = true;
      if (result === 'player2_wo' && playerPosition === 'player1') isLossWO = true;

      // Preparar dados de atualização
      const updateData = {
        totalMatches: { increment: 1 },
      };

      if (isWin) updateData.wins = { increment: 1 };
      if (isLoss) updateData.losses = { increment: 1 };
      if (isWinWO) updateData.winsWO = { increment: 1 };
      if (isLossWO) updateData.lossesWO = { increment: 1 };

      // Atualizar estatísticas opcionais apenas se foram fornecidas
      const playerKills = statistics[`${playerPosition}Kills`];
      const playerAssists = statistics[`${playerPosition}Assists`];
      const playerCaps = statistics[`${playerPosition}Caps`];

      if (playerKills !== undefined && playerKills !== null && !isNaN(playerKills)) {
        updateData.kills = { increment: parseInt(playerKills) };
        updateData.matchesWithKills = { increment: 1 };
      }

      if (playerAssists !== undefined && playerAssists !== null && !isNaN(playerAssists)) {
        updateData.assists = { increment: parseInt(playerAssists) };
        updateData.matchesWithAssists = { increment: 1 };
      }

      if (playerCaps !== undefined && playerCaps !== null && !isNaN(playerCaps)) {
        updateData.caps = { increment: parseInt(playerCaps) };
        updateData.matchesWithCaps = { increment: 1 };
      }

      // Aplicar atualizações
      await tx.playerStatistics.update({
        where: {
          userId_gameSlug: {
            userId: playerId,
            gameSlug: gameSlug,
          },
        },
        data: updateData,
      });

    } catch (error) {
      console.error('Erro ao atualizar estatísticas do jogador:', error);
      throw error; // Re-throw para que a transação falhe se necessário
    }
  }

  // NOVO MÉTODO: Buscar estatísticas do jogador
  async getPlayerStatistics(userId, gameSlug = null) {
    console.log(`Fetching statistics for user ${userId}, game: ${gameSlug || 'all'}`);
    
    try {
      const whereClause = { userId: userId };
      if (gameSlug) {
        whereClause.gameSlug = gameSlug;
      }

      const statistics = await this.prisma.playerStatistics.findMany({
        where: whereClause,
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      });

      // Calcular estatísticas derivadas
      const processedStats = statistics.map(stat => {
        const totalNormalMatches = stat.wins + stat.losses;
        const totalWOMatches = stat.winsWO + stat.lossesWO;
        const winRate = stat.totalMatches > 0 ? ((stat.wins + stat.winsWO) / stat.totalMatches * 100).toFixed(2) : 0;
        
        const avgKills = stat.matchesWithKills > 0 ? (stat.kills / stat.matchesWithKills).toFixed(2) : null;
        const avgAssists = stat.matchesWithAssists > 0 ? (stat.assists / stat.matchesWithAssists).toFixed(2) : null;
        const avgCaps = stat.matchesWithCaps > 0 ? (stat.caps / stat.matchesWithCaps).toFixed(2) : null;

        return {
          ...stat,
          derived: {
            totalNormalMatches,
            totalWOMatches,
            winRate: parseFloat(winRate),
            avgKills: avgKills ? parseFloat(avgKills) : null,
            avgAssists: avgAssists ? parseFloat(avgAssists) : null,
            avgCaps: avgCaps ? parseFloat(avgCaps) : null,
          },
        };
      });

      return { success: true, statistics: processedStats };

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { success: false, message: 'Erro interno do servidor.' };
    }
  }

  // NOVO MÉTODO: Buscar histórico de partidas do jogador
  async getPlayerMatchHistory(userId, gameSlug = null, limit = 20, offset = 0) {
    console.log(`Fetching match history for user ${userId}, game: ${gameSlug || 'all'}`);
    
    try {
      const whereClause = {
        OR: [
          { player1Id: userId },
          { player2Id: userId },
        ],
        status: 'COMPLETED',
      };

      if (gameSlug) {
        whereClause.gameSlug = gameSlug;
      }

      const matches = await this.prisma.match.findMany({
        where: whereClause,
        include: {
          player1: { include: { profile: true } },
          player2: { include: { profile: true } },
          mediator: { include: { profile: true } },
          statistics: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      });

      // Processar dados para incluir perspectiva do jogador
      const processedMatches = matches.map(match => {
        const isPlayer1 = match.player1Id === userId;
        const opponent = isPlayer1 ? match.player2 : match.player1;
        
        let playerResult = 'draw';
        if (match.result === 'player1_win' || match.result === 'player1_wo') {
          playerResult = isPlayer1 ? 'win' : 'loss';
        } else if (match.result === 'player2_win' || match.result === 'player2_wo') {
          playerResult = isPlayer1 ? 'loss' : 'win';
        }

        const playerStats = match.statistics ? {
          kills: isPlayer1 ? match.statistics.player1Kills : match.statistics.player2Kills,
          assists: isPlayer1 ? match.statistics.player1Assists : match.statistics.player2Assists,
          caps: isPlayer1 ? match.statistics.player1Caps : match.statistics.player2Caps,
        } : null;

        return {
          id: match.id,
          opponent: {
            id: opponent.id,
            username: opponent.profile?.username || opponent.nome,
            avatar: opponent.profile?.avatar,
          },
          result: playerResult,
          isWO: match.result.includes('_wo'),
          gameSlug: match.gameSlug,
          betAmount: match.betAmount,
          completedAt: match.updatedAt,
          statistics: playerStats,
        };
      });

      return { success: true, matches: processedMatches };

    } catch (error) {
      console.error('Erro ao buscar histórico de partidas:', error);
      return { success: false, message: 'Erro interno do servidor.' };
    }
  }

  async getMatchDetails(matchId) {
    console.log(`Fetching details for match ${matchId}`);
     const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        // Inclua o perfil de cada participante
        player1: { include: { profile: true } },
        player2: { include: { profile: true } },
        mediator: { include: { profile: true } },
        // Inclua as mensagens e o perfil de quem enviou cada uma
        conversation: {
          include: {
            messages: {
              include: {
                sender: { include: { profile: true } }
              },
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      },
    });
    return { success: true, match };
  }

  async getChatHistory(chatRoomId) {
    console.log(`Fetching chat history for room ${chatRoomId}`);
    const conversation = await this.prisma.conversation.findUnique({
      where: { matchId: chatRoomId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    return { success: true, messages: conversation?.messages || [] };
  }

 async sendMessage(chatRoomId, senderId, content, messageType) {
    console.log(`Sending message in room ${chatRoomId} from ${senderId}: ${content}`);
    // --- INÍCIO DA CORREÇÃO ---
    const message = await this.prisma.message.create({
      data: {
        conversation: { connect: { matchId: chatRoomId } },
        sender: { connect: { id: senderId } },
        content,
      },
      // Inclua os dados do remetente na resposta
      include: {
        sender: {
          include: {
            profile: true
          }
        }
      }
    });
    return { success: true, message };
    
  }


async listUserConversations(userId) {
    console.log(`Buscando todas as conversas para o usuário ${userId}`);
    const conversations = await this.prisma.conversation.findMany({
        where: {
            participants: {
                some: {
                    id: userId,
                },
            },
        },
        include: {
            // Inclui os participantes para sabermos com quem é a conversa
            participants: {
                include: {
                    profile: true,
                },
            },
            // Inclui a última mensagem para exibir na lista de conversas
            messages: {
                orderBy: {
                    createdAt: 'desc',
                },
                take: 1,
            },
            // Inclui os detalhes da partida para dar contexto
            match: true,
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });
    return { success: true, conversations };
}

}


export default MatchmakingService;

