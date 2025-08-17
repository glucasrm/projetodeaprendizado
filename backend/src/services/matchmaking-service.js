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

  async completeMediation(mediatorId, matchId, result) {
    console.log(`Mediator ${mediatorId} completing match ${matchId} with result ${result}`);
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: { status: 'COMPLETED', result: result },
    });
    return { success: true, message: 'Mediação finalizada', match };
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

