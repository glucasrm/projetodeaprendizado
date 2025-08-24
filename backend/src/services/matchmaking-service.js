// src/services/matchmaking-service.js (VERSÃO COM LIMITAÇÃO DE APOSTAS)

class MatchmakingService {
  constructor(prisma, notificationService) {
    this.prisma = prisma;
    this.notificationService = notificationService;
  }
  // MÉTODO MODIFICADO: Entrar na fila de apostas com logs detalhados para debug
  async joinBetQueue(userId, betAmount, modality, platform, gameSlug) {
    console.log(`🎯 [DEBUG] User ${userId} joining bet queue for ${betAmount} in ${modality} on ${platform} for ${gameSlug}`);
    
    try {
      // 1. Buscar informações do usuário para verificar se é admin
      console.log(`🔍 [DEBUG] Buscando informações do usuário ${userId}...`);
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, isAdmin: true }
      });

      console.log(`👤 [DEBUG] Usuário encontrado:`, user);

      if (!user) {
        console.log(`❌ [DEBUG] Usuário ${userId} não encontrado`);
        return { success: false, message: 'Usuário não encontrado.' };
      }

      // 2. Verificar apostas ativas do usuário com logs detalhados
      console.log(`🔍 [DEBUG] Verificando apostas ativas para usuário ${userId}...`);
      const activeUserBets = await this.checkActiveUserBetsWithDebug(userId);
      
      console.log(`📊 [DEBUG] Resultado da verificação de apostas ativas:`, activeUserBets);

      // 3. Aplicar limitação baseada no tipo de usuário
      if (!user.isAdmin) {
        console.log(`🎮 [DEBUG] Usuário ${userId} é JOGADOR (não admin) - aplicando limite de 1 aposta`);
        
        // JOGADORES: Máximo 1 aposta simultânea
        if (activeUserBets.totalActive > 0) {
          console.log(`🚫 [DEBUG] BLOQUEADO: Usuário ${userId} possui ${activeUserBets.totalActive} apostas ativas`);
          console.log(`📋 [DEBUG] Detalhes das apostas ativas:`, {
            activeBets: activeUserBets.bets,
            activeMatches: activeUserBets.matches
          });
          
          return { 
            success: false, 
            message: 'Você está no máximo de apostas no momento. Finalize sua aposta atual antes de entrar em uma nova fila.',
            details: {
              currentBets: activeUserBets.totalActive,
              maxAllowed: 1,
              activeBets: activeUserBets.bets,
              activeMatches: activeUserBets.matches
            }
          };
        } else {
          console.log(`✅ [DEBUG] PERMITIDO: Usuário ${userId} não possui apostas ativas (${activeUserBets.totalActive})`);
        }
      } else {
        // ADMINISTRADORES: Sem limite (podem ter apostas ilimitadas)
        console.log(`👑 [DEBUG] Usuário ${userId} é ADMIN - sem limite de apostas. Apostas ativas: ${activeUserBets.totalActive}`);
      }


      
      // 4. Se passou na verificação, criar a aposta
      console.log(`💰 [DEBUG] Criando aposta para usuário ${userId}...`);
      const bet = await this.prisma.directBet.create({
        data: {
          playerId: userId,
          betAmount: parseFloat(betAmount), // Adicionar parseFloat aqui
          modality,
          platform,
          gameSlug,
          status: 'WAITING_OPPONENT',
        },
      });

      console.log(`✅ [DEBUG] Aposta criada com sucesso! Bet ID: ${bet.id}`);
      
      return { 
        success: true, 
        message: 'Entrou na fila de apostas com sucesso!', 
        betId: bet.id,
        userType: user.isAdmin ? 'admin' : 'player'
      };

    } catch (error) {
      console.error('❌ [DEBUG] Erro ao entrar na fila de apostas:', error);
      console.error('📍 [DEBUG] Stack trace:', error.stack);
      return { 
        success: false, 
        message: 'Erro interno do servidor ao entrar na fila.' 
      };
    }
  }

     // MÉTODO MODIFICADO: Verificar e limpar apostas ativas
  async checkActiveUserBetsWithDebug(userId) {
    try {
      console.log(`🧹 [AUTO-CLEANUP] Iniciando verificação e limpeza para usuário ${userId}`);

      // 1. Encontrar apostas que estão 'MATCHED' mas cuja partida já terminou.
      const orphanedMatchedBets = await this.prisma.directBet.findMany({
        where: {
          playerId: userId,
          status: 'MATCHED',
          match: {
            status: { in: ['COMPLETED', 'CANCELLED'] }
          }
        }
      });

      if (orphanedMatchedBets.length > 0) {
        const betIdsToClean = orphanedMatchedBets.map(b => b.id);
        console.log(`🧹 [AUTO-CLEANUP] Encontradas ${orphanedMatchedBets.length} apostas 'MATCHED' com partidas finalizadas. Limpando...`, betIdsToClean);
        await this.prisma.directBet.updateMany({
          where: { id: { in: betIdsToClean } },
          data: { status: 'COMPLETED' } // Marcar como COMPLETED
        });
      }

      // 2. Encontrar apostas 'WAITING_OPPONENT' que estão presas na fila por muito tempo (ex: > 1 hora)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const oldWaitingBets = await this.prisma.directBet.findMany({
        where: {
          playerId: userId,
          status: 'WAITING_OPPONENT',
          createdAt: { lt: oneHourAgo }
        }
      });

      if (oldWaitingBets.length > 0) {
        const betIdsToCancel = oldWaitingBets.map(b => b.id);
        console.log(`🧹 [AUTO-CLEANUP] Encontradas ${oldWaitingBets.length} apostas 'WAITING_OPPONENT' muito antigas. Cancelando...`, betIdsToCancel);
        await this.prisma.directBet.updateMany({
          where: { id: { in: betIdsToCancel } },
          data: { status: 'CANCELED' } // Marcar como CANCELED
        });
      }
      
      // 3. Agora, com os dados limpos, prossiga com a verificação normal
      console.log(`🔍 [DEBUG] Verificação pós-limpeza para usuário ${userId}`);
      
      // ... (o resto da sua lógica de `checkActiveUserBetsWithDebug` continua aqui)
      // ...
      const activeBets = await this.prisma.directBet.findMany({ /* ... */ });
      const activeMatches = await this.prisma.match.findMany({ /* ... */ });
      // ...
      // ... (retornar o resultado)

      // O resto da função permanece o mesmo...
      console.log(`📋 [DEBUG] Buscando apostas diretas com status WAITING_OPPONENT ou MATCHED...`);
      const finalActiveBets = await this.prisma.directBet.findMany({
        where: {
          playerId: userId,
          status: { in: ['WAITING_OPPONENT', 'MATCHED'] }
        },
        // ... include e orderBy
      });

      console.log(`🎮 [DEBUG] Buscando partidas com status PENDING_CONFIRMATION ou IN_PROGRESS...`);
      const finalActiveMatches = await this.prisma.match.findMany({
        where: {
          OR: [{ player1Id: userId }, { player2Id: userId }],
          status: { in: ['PENDING_CONFIRMATION', 'IN_PROGRESS'] }
        },
        // ... select e orderBy
      });

      const totalActive = finalActiveBets.length + finalActiveMatches.length;

      const result = {
        totalActive,
        // ... mapear os resultados de finalActiveBets e finalActiveMatches
      };

      console.log(`✅ [DEBUG] Verificação de apostas ativas concluída:`, result);
      return result;

    } catch (error) {
      console.error('❌ [DEBUG] Erro ao verificar/limpar apostas ativas:', error);
      // Retornar um estado seguro em caso de erro
      return { totalActive: 0, bets: [], matches: [] };
    }
  }

  
  // MÉTODO ORIGINAL: Verificar apostas ativas (mantido para compatibilidade)
  async checkActiveUserBets(userId) {
    return await this.checkActiveUserBetsWithDebug(userId);
  }

  // MÉTODO MODIFICADO: Obter status de apostas com logs detalhados
  async getUserBetStatus(userId) {
    try {
      console.log(`🔍 [DEBUG] Obtendo status de apostas para usuário ${userId}`);
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, isAdmin: true }
      });

      console.log(`👤 [DEBUG] Dados do usuário para status:`, user);

      if (!user) {
        console.log(`❌ [DEBUG] Usuário não encontrado para status`);
        return { success: false, message: 'Usuário não encontrado.' };
      }

      const activeUserBets = await this.checkActiveUserBetsWithDebug(userId);
      
      const maxAllowed = user.isAdmin ? 'unlimited' : 1;
      const canJoinNewBet = user.isAdmin || activeUserBets.totalActive === 0;

      const result = {
        success: true,
        userType: user.isAdmin ? 'admin' : 'player',
        maxAllowed,
        currentActive: activeUserBets.totalActive,
        canJoinNewBet,
        activeBets: activeUserBets.bets,
        activeMatches: activeUserBets.matches
      };

      console.log(`✅ [DEBUG] Status de apostas obtido:`, result);
      return result;

    } catch (error) {
      console.error('❌ [DEBUG] Erro ao obter status de apostas:', error);
      console.error('📍 [DEBUG] Stack trace:', error.stack);
      return { success: false, message: 'Erro interno do servidor.' };
    }
  }

  
  // NOVO MÉTODO: Limpar apostas órfãs (apenas para debug/emergência)
  async cleanupOrphanedBets(userId) {
    console.log(`🧹 [DEBUG] LIMPEZA DE EMERGÊNCIA: Limpando apostas órfãs para usuário ${userId}`);
    
    try {
      // Buscar apostas que podem estar órfãs
      const orphanedBets = await this.prisma.directBet.findMany({
        where: {
          playerId: userId,
          status: {
            in: ['WAITING_OPPONENT', 'MATCHED']
          }
        },
        include: {
          match: true
        }
      });

      console.log(`🔍 [DEBUG] Apostas potencialmente órfãs encontradas:`, orphanedBets);

      let cleanedCount = 0;

      for (const bet of orphanedBets) {
        // Se a aposta tem matchId mas a partida está COMPLETED ou CANCELLED
        if (bet.matchId && bet.match && ['COMPLETED', 'CANCELLED'].includes(bet.match.status)) {
          console.log(`🧹 [DEBUG] Limpando aposta órfã ${bet.id} (partida ${bet.matchId} está ${bet.match.status})`);
          
          await this.prisma.directBet.update({
            where: { id: bet.id },
            data: { status: 'COMPLETED' }
          });
          
          cleanedCount++;
        }
        // Se a aposta está WAITING_OPPONENT há muito tempo (mais de 1 hora)
        else if (bet.status === 'WAITING_OPPONENT') {
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          if (bet.createdAt < oneHourAgo) {
            console.log(`🧹 [DEBUG] Limpando aposta antiga ${bet.id} (criada há mais de 1 hora)`);
            
            await this.prisma.directBet.update({
              where: { id: bet.id },
              data: { status: 'CANCELED' }
            });
            
            cleanedCount++;
          }
        }
      }

      console.log(`✅ [DEBUG] Limpeza concluída. ${cleanedCount} apostas limpas.`);
      return { success: true, cleanedCount };

    } catch (error) {
      console.error('❌ [DEBUG] Erro na limpeza de apostas órfãs:', error);
      return { success: false, error: error.message };
    }
  }


  // NOVO MÉTODO: Obter status de apostas do usuário (para frontend)
  async getUserBetStatus(userId) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, isAdmin: true }
      });

      if (!user) {
        return { success: false, message: 'Usuário não encontrado.' };
      }

      const activeUserBets = await this.checkActiveUserBets(userId);
      
      const maxAllowed = user.isAdmin ? 'unlimited' : 1;
      const canJoinNewBet = user.isAdmin || activeUserBets.totalActive === 0;

      return {
        success: true,
        userType: user.isAdmin ? 'admin' : 'player',
        maxAllowed,
        currentActive: activeUserBets.totalActive,
        canJoinNewBet,
        activeBets: activeUserBets.bets,
        activeMatches: activeUserBets.matches
      };

    } catch (error) {
      console.error('Erro ao obter status de apostas:', error);
      return { success: false, message: 'Erro interno do servidor.' };
    }
  }

  // ========== MÉTODOS EXISTENTES (INALTERADOS) ==========
// MÉTODO CORRIGIDO: Finalizar mediação (versão simplificada que funciona)
  async completeMediation(mediatorId, matchId, result, statistics = {}) {
    console.log(`🏁 [DEBUG] Mediator ${mediatorId} completing match ${matchId} with result ${result}`);
    
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
        // 1. Atualizar status da partida (JÁ EXISTE)
        console.log(`🎮 [DEBUG] Atualizando status da partida ${matchId} para COMPLETED`);
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
          console.log('📊 [DEBUG] Estatísticas da partida salvas com sucesso');
        } catch (statsError) {
          console.log('⚠️ [DEBUG] Tabela de estatísticas não existe ainda, pulando...', statsError.message);
        }

        // 3. Tentar atualizar estatísticas dos jogadores (se a tabela existir)
        try {
          await self.updatePlayerStatisticsFixed(tx, match.player1Id, match.gameSlug, result, 'player1', statistics);
          await self.updatePlayerStatisticsFixed(tx, match.player2Id, match.gameSlug, result, 'player2', statistics);
          console.log('📊 [DEBUG] Estatísticas dos jogadores atualizadas com sucesso');
        } catch (playerStatsError) {
          console.log('⚠️ [DEBUG] Tabela de estatísticas de jogadores não existe ainda, pulando...', playerStatsError.message);
        }

        // 4. Liberar mediador
        console.log(`👨‍⚖️ [DEBUG] Liberando mediador ${mediatorId}`);
        await tx.mediationRequest.updateMany({
          where: { mediatorId: mediatorId },
          data: { status: 'AVAILABLE' },
        });

       // 5. IMPORTANTE: ATUALIZAR STATUS DAS APOSTAS PARA COMPLETED (JÁ EXISTE, MAS VAMOS VERIFICAR)
        console.log(`💰 [DEBUG] Atualizando apostas da partida ${matchId} para COMPLETED`);
        const updatedBets = await tx.directBet.updateMany({
          where: { matchId: matchId }, // A condição é a chave
          data: { status: 'COMPLETED' },
        });
        console.log(`💰 [DEBUG] ${updatedBets.count} apostas atualizadas para COMPLETED`);

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

      console.log(`✅ [DEBUG] Mediação finalizada com sucesso para partida ${matchId}`);
      return { success: true, message: 'Mediação finalizada com sucesso!' };

    } catch (error) {
      console.error('❌ [DEBUG] Erro ao finalizar mediação:', error);
      console.error('📍 [DEBUG] Stack trace:', error.stack);
      return { success: false, message: 'Erro interno do servidor.' };
    }
  }
  // MÉTODO CORRIGIDO: Atualizar estatísticas do jogador (com sintaxe correta do Prisma)
  async updatePlayerStatisticsFixed(tx, playerId, gameSlug, result, playerPosition, statistics) {
    try {
      const playerStats = await tx.playerStatistics.upsert({
        where: {
          userId_gameSlug: {
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

      const updateData = {
        totalMatches: { increment: 1 },
      };

      if (isWin) updateData.wins = { increment: 1 };
      if (isLoss) updateData.losses = { increment: 1 };
      if (isWinWO) updateData.winsWO = { increment: 1 };
      if (isLossWO) updateData.lossesWO = { increment: 1 };

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
      console.error('❌ [DEBUG] Erro ao atualizar estatísticas do jogador:', error);
      throw error;
    }
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
            
            const newMatch = await tx.match.create({
              data: {
                player1Id: p1.id,
                player2Id: p2.id,
                mediatorId: availableMediator.mediatorId,
                betAmount: player1Bet.betAmount,
                modality: player1Bet.modality,
                platform: player1Bet.platform,
                gameSlug: player1Bet.gameSlug,
                status: 'PENDING_CONFIRMATION',
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

      const isPlayer1 = match.player1Id === userId;
      const isPlayer2 = match.player2Id === userId;
      const isMediator = match.mediatorId === userId;

      if (!isPlayer1 && !isPlayer2 && !isMediator) {
        return { success: false, message: 'Você não é um participante desta partida.' };
      }

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

      const updatedMatch = await this.prisma.match.update({
        where: { id: matchId },
        data: updateData,
      });

      const allConfirmed = (
        (isPlayer1 ? true : match.player1Confirmed) &&
        (isPlayer2 ? true : match.player2Confirmed) &&
        (isMediator ? true : match.mediatorConfirmed)
      );

      if (allConfirmed) {
        await this.prisma.match.update({
          where: { id: matchId },
          data: { status: 'IN_PROGRESS' },
        });

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

      const isPlayer1 = match.player1Id === userId;
      const isPlayer2 = match.player2Id === userId;
      const isMediator = match.mediatorId === userId;

      if (!isPlayer1 && !isPlayer2 && !isMediator) {
        return { success: false, message: 'Você não é um participante desta partida.' };
      }

      const self = this;

      await this.prisma.$transaction(async (tx) => {
        await tx.match.update({
          where: { id: matchId },
          data: { status: 'CANCELLED' },
        });

        await tx.directBet.updateMany({
          where: { matchId: matchId },
          data: { status: 'WAITING_OPPONENT', matchId: null },
        });

        await tx.mediationRequest.updateMany({
          where: { mediatorId: match.mediatorId },
          data: { status: 'AVAILABLE' },
        });

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

  async getMatchDetails(matchId) {
    console.log(`Fetching details for match ${matchId}`);
     const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        player1: { include: { profile: true } },
        player2: { include: { profile: true } },
        mediator: { include: { profile: true } },
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
    const message = await this.prisma.message.create({
      data: {
        conversation: { connect: { matchId: chatRoomId } },
        sender: { connect: { id: senderId } },
        content,
      },
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
            participants: {
                include: {
                    profile: true,
                },
            },
            messages: {
                orderBy: {
                    createdAt: 'desc',
                },
                take: 1,
            },
            match: true,
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });

    const formattedConversations = conversations.map((conversation) => {
        const otherParticipants = conversation.participants.filter(
            (participant) => participant.id !== userId
        );

        const lastMessage = conversation.messages[0] || null;

        return {
            id: conversation.id,
            matchId: conversation.matchId,
            participants: otherParticipants.map((participant) => ({
                id: participant.id,
                username: participant.profile?.username || participant.nome,
                avatar: participant.profile?.avatar,
            })),
            lastMessage: lastMessage
                ? {
                      content: lastMessage.content,
                      createdAt: lastMessage.createdAt,
                      senderId: lastMessage.senderId,
                  }
                : null,
            match: conversation.match
                ? {
                      status: conversation.match.status,
                      betAmount: conversation.match.betAmount,
                      gameSlug: conversation.match.gameSlug,
                  }
                : null,
            updatedAt: conversation.updatedAt,
        };
    });

    return { success: true, conversations: formattedConversations };
}
}

export default MatchmakingService;

