// src/controllers/matchmaking-controller.js
import { v4 as uuidv4 } from 'uuid';

class MatchmakingController {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async joinBetQueue(request, reply) {
    if (!request.user || !request.user.sub) {
      return reply.status(401).send({ error: 'Não autorizado: usuário não autenticado.' });
    }

    const playerId = request.user.sub;
    const { betAmount, modality, platform } = request.body;

    if (!betAmount || !modality || !platform) {
      return reply.status(400).send({ error: 'Parâmetros de aposta inválidos.' });
    }

    const parsedBetAmount = parseFloat(betAmount);
    if (isNaN(parsedBetAmount) || parsedBetAmount <= 0) {
      return reply.status(400).send({ error: 'Valor da aposta inválido.' });
    }

    let newBet = null;

    try {
      const player = await this.prisma.user.findUnique({
        where: { id: playerId },
        include: {
          profile: {
            select: { username: true }
          }
        }
      });

      if (!player) {
        return reply.status(404).send({ error: 'Jogador não encontrado.' });
      }

      // IMPORTANTE: Assumindo que player.balance é um objeto Decimal do Prisma.
      // Se for um Number, a comparação direta é OK.
      // Se for um Decimal, use métodos como .lt() ou .gte().
      if (player.balance.lt(parsedBetAmount)) { 
        return reply.status(400).send({ error: 'Saldo insuficiente para a aposta.' });
      }

      const existingBet = await this.prisma.directBet.findFirst({
        where: {
          playerId: playerId,
          status: 'WAITING_OPPONENT',
        },
      });

      if (existingBet) {
        return reply.status(200).send({
          message: 'Você já está na fila de espera para uma aposta.',
          betId: existingBet.id,
          status: existingBet.status,
          userBalance: player.balance.toNumber(), // Retorna saldo atualizado se já estiver na fila
        });
      }

      newBet = await this.prisma.directBet.create({
        data: {
          playerId,
          // Garante que o valor seja armazenado com duas casas decimais,
          // importante para valores monetários com Prisma.
          betAmount: parseFloat(parsedBetAmount.toFixed(2)), 
          modality,
          platform,
          status: 'WAITING_OPPONENT',
        },
      });

      // Atualiza o saldo do jogador
      const updatedPlayer = await this.prisma.user.update({
        where: { id: playerId },
        data: { balance: { decrement: newBet.betAmount } },
      });

      const opponentBet = await this.prisma.directBet.findFirst({
        where: {
          modality,
          platform,
          betAmount: parseFloat(parsedBetAmount.toFixed(2)),
          status: 'WAITING_OPPONENT',
          NOT: {
            playerId: playerId,
          },
        },
        orderBy: {
          createdAt: 'asc'
        },
        include: {
          player: {
            select: {
              id: true,
              profile: {
                select: { username: true }
              }
            }
          }
        }
      });

      if (opponentBet) {
        await this.prisma.$transaction(async (prisma) => {
          await prisma.directBet.update({
            where: { id: newBet.id },
            data: { status: 'MATCHED' },
          });
          await prisma.directBet.update({
            where: { id: opponentBet.id },
            data: { status: 'MATCHED' },
          });
        });

        const availableMediatorRequest = await this.prisma.mediationRequest.findFirst({
          where: {
            status: 'AVAILABLE',
            mediator: {
              isAdmin: true,
            },
          },
          include: {
            mediator: {
              select: {
                id: true,
                profile: {
                  select: { username: true }
                }
              }
            },
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        let createdMatch;
        const chatRoomId = uuidv4();

        const newPlayerUsername = player.profile?.username || 'Jogador Desconhecido';
        const opponentPlayerUsername = opponentBet.player.profile?.username || 'Oponente Desconhecido';

        if (availableMediatorRequest) {
          await this.prisma.mediationRequest.update({
            where: { id: availableMediatorRequest.id },
            data: { status: 'IN_MEDIATION' },
          });

          const mediatorUsername = availableMediatorRequest.mediator.profile?.username || 'Mediador Desconhecido';

          createdMatch = await this.prisma.match.create({
            data: {
              player1Id: newBet.playerId,
              player2Id: opponentBet.playerId,
              mediatorId: availableMediatorRequest.mediatorId,
              betAmount: newBet.betAmount,
              modality: newBet.modality,
              platform: newBet.platform,
              status: 'IN_PROGRESS',
              chatRoomId: chatRoomId,
              directBets: {
                connect: [{ id: newBet.id }, { id: opponentBet.id }],
              },
              conversation: {
                create: {
                  participants: {
                    connect: [
                      { id: newBet.playerId },
                      { id: opponentBet.playerId },
                      { id: availableMediatorRequest.mediatorId },
                    ],
                  },
                },
              },
              notifications: {
                create: [
                  {
                    userId: newBet.playerId,
                    type: 'match_found',
                    content: `Seu confronto 🏆 ${newBet.modality} contra ${opponentPlayerUsername} foi encontrado e um mediador foi atribuído!`,
                    message: `Seu confronto 🏆 ${newBet.modality} contra ${opponentPlayerUsername} foi encontrado e um mediador foi atribuído!`,
                    // CORRIGIDO: Usa createdMatch.id para o link
                    link: `/apostas/detalhes/${createdMatch.id}`, 
                  },
                  {
                    userId: opponentBet.playerId,
                    type: 'match_found',
                    content: `Seu confronto 🏆 ${opponentBet.modality} contra ${newPlayerUsername} foi encontrado e um mediador foi atribuído!`,
                    message: `Seu confronto 🏆 ${opponentBet.modality} contra ${newPlayerUsername} foi encontrado e um mediador foi atribuído!`,
                    // CORRIGIDO: Usa createdMatch.id para o link
                    link: `/apostas/detalhes/${createdMatch.id}`, 
                  },
                  {
                    userId: availableMediatorRequest.mediatorId,
                    type: 'mediation_assigned',
                    content: `Você foi atribuído para mediar um confronto ⚖️ ${newBet.modality} entre ${newPlayerUsername} e ${opponentPlayerUsername}.`,
                    message: `Você foi atribuído para mediar um confronto ⚖️ ${newBet.modality} entre ${newPlayerUsername} e ${opponentPlayerUsername}.`,
                    // CORRIGIDO: Usa createdMatch.id para o link
                    link: `/mediacao/detalhes/${createdMatch.id}`, 
                  },
                ],
              },
            },
            include: {
              player1: { select: { profile: { select: { username: true } } } },
              player2: { select: { profile: { select: { username: true } } } },
              mediator: { select: { profile: { select: { username: true } } } },
            }
          });

          return reply.status(200).send({
            message: 'Partida encontrada e mediador atribuído!',
            matchId: createdMatch.id,
            player1: createdMatch.player1.profile,
            player2: createdMatch.player2.profile,
            mediator: createdMatch.mediator.profile,
            chatRoomId: createdMatch.chatRoomId,
            status: createdMatch.status,
            userBalance: updatedPlayer.balance.toNumber(), // Retorna saldo atualizado
            currentMatch: { // Adiciona o objeto currentMatch completo para o frontend
                id: createdMatch.id,
                chatRoomId: createdMatch.chatRoomId,
                status: createdMatch.status,
                player1Id: createdMatch.player1Id,
                player2Id: createdMatch.player2Id,
                mediatorId: createdMatch.mediatorId,
            }
          });

        } else {
          createdMatch = await this.prisma.match.create({
            data: {
              player1Id: newBet.playerId,
              player2Id: opponentBet.playerId,
              betAmount: newBet.betAmount,
              modality: newBet.modality,
              platform: newBet.platform,
              status: 'PENDING_MEDIATOR',
              chatRoomId: chatRoomId,
              directBets: {
                connect: [{ id: newBet.id }, { id: opponentBet.id }],
              },
              conversation: {
                create: {
                  participants: {
                    connect: [
                      { id: newBet.playerId },
                      { id: opponentBet.playerId },
                    ],
                  },
                },
              },
              notifications: {
                create: [
                  {
                    userId: newBet.playerId,
                    type: 'match_found_pending_mediator',
                    content: `Oponente encontrado para seu confronto ${newBet.modality}! Aguardando um mediador.`,
                    message: `Oponente encontrado para seu confronto ${newBet.modality}! Aguardando um mediador.`,
                    // CORRIGIDO: Usa createdMatch.id para o link
                    link: `/apostas/detalhes/${createdMatch.id}`, 
                  },
                  {
                    userId: opponentBet.playerId,
                    type: 'match_found_pending_mediator',
                    content: `Oponente encontrado para seu confronto ${opponentBet.modality}! Aguardando um mediador.`,
                    message: `Oponente encontrado para seu confronto ${opponentBet.modality}! Aguardando um mediador.`,
                    // CORRIGIDO: Usa createdMatch.id para o link
                    link: `/apostas/detalhes/${createdMatch.id}`, 
                  },
                ],
              },
            },
            include: {
              player1: { select: { profile: { select: { username: true } } } },
              player2: { select: { profile: { select: { username: true } } } },
            }
          });

          return reply.status(202).send({
            message: 'Oponente encontrado, aguardando mediador.',
            matchId: createdMatch.id,
            player1: createdMatch.player1.profile,
            player2: createdMatch.player2.profile,
            chatRoomId: createdMatch.chatRoomId,
            status: createdMatch.status,
            userBalance: updatedPlayer.balance.toNumber(), // Retorna saldo atualizado
            currentMatch: { // Adiciona o objeto currentMatch completo para o frontend
                id: createdMatch.id,
                chatRoomId: createdMatch.chatRoomId,
                status: createdMatch.status,
                player1Id: createdMatch.player1Id,
                player2Id: createdMatch.player2Id,
            }
          });
        }
      } else {
        // Se não encontrar oponente, retorna a aposta e o saldo atualizado
        return reply.status(200).send({
          message: 'Aguardando oponente. Sua aposta foi registrada.',
          betId: newBet.id,
          status: newBet.status,
          userBalance: updatedPlayer.balance.toNumber(), // Retorna saldo atualizado
          currentMatch: { // Se o player está esperando, adiciona a aposta atual como currentMatch
              betId: newBet.id,
              status: newBet.status,
              modality: newBet.modality,
              platform: newBet.platform,
              betAmount: newBet.betAmount.toNumber()
          },
          isInBetQueue: true // Para o frontend saber que está na fila
        });
      }
    } catch (error) {
      request.log.error(error);
      // Se a aposta foi criada e o saldo decrementado, tenta estornar
      if (newBet) {
        await this.prisma.user.update({
          where: { id: playerId },
          data: { balance: { increment: newBet.betAmount } },
        }).catch(err => request.log.error('Erro ao estornar saldo:', err));
        await this.prisma.directBet.delete({ where: { id: newBet.id } }).catch(err => request.log.error('Erro ao deletar aposta:', err));
      }
      return reply.status(500).send({ error: 'Erro interno do servidor ao entrar na fila.', details: error.message });
    }
  }

  async joinMediationQueue(request, reply) {
    if (!request.user || !request.user.sub) {
      return reply.status(401).send({ error: 'Não autorizado: usuário não autenticado.' });
    }
    const mediatorId = request.user.sub;

    try {
      const mediator = await this.prisma.user.findUnique({ where: { id: mediatorId } });
      if (!mediator || !mediator.isAdmin) {
        return reply.status(403).send({ error: 'Usuário não autorizado a mediar.' });
      }

      const existingMediationRequest = await this.prisma.mediationRequest.findUnique({
        where: { mediatorId: mediatorId },
      });

      if (existingMediationRequest) {
        if (existingMediationRequest.status === 'AVAILABLE') {
          return reply.status(200).send({ message: 'Você já está na fila de mediação.', isInMediationQueue: true });
        } else if (existingMediationRequest.status === 'IN_MEDIATION') {
            // Se já está em mediação, pode ser que o frontend precise dos detalhes da partida
            // Poderíamos buscar a partida atual do mediador e retornar
            const currentMatch = await this.prisma.match.findFirst({
                where: { mediatorId: mediatorId, status: { in: ['IN_PROGRESS', 'PENDING_MEDIATOR'] } },
                select: { id: true, chatRoomId: true, status: true }
            });
            return reply.status(200).send({ message: 'Você já está mediando um confronto.', isInMediationQueue: true, currentMatch: currentMatch });
        } else {
          await this.prisma.mediationRequest.update({
            where: { id: existingMediationRequest.id },
            data: { status: 'AVAILABLE' },
          });
          return reply.status(200).send({ message: 'Você voltou para a fila de mediação.', isInMediationQueue: true });
        }
      } else {
        await this.prisma.mediationRequest.create({
          data: {
            mediatorId,
            status: 'AVAILABLE',
          },
        });
        return reply.status(200).send({ message: 'Você entrou na fila de mediação.', isInMediationQueue: true });
      }
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Erro interno do servidor ao entrar na fila de mediação.', details: error.message });
    }
  }

  async leaveQueue(request, reply) {
    if (!request.user || !request.user.sub) {
      return reply.status(401).send({ error: 'Não autorizado: usuário não autenticado.' });
    }
    const userId = request.user.sub;
    const { role } = request.body;

    if (!role) {
      return reply.status(400).send({ error: 'Papel (role) deve ser fornecido.' });
    }

    try {
      if (role === 'player') {
        const bet = await this.prisma.directBet.findFirst({
          where: {
            playerId: userId,
            status: 'WAITING_OPPONENT',
          },
        });

        if (bet) {
          // Usa uma transação para garantir que ambas as operações sejam atômicas
          await this.prisma.$transaction(async (prisma) => {
            await prisma.directBet.update({
              where: { id: bet.id },
              data: { status: 'CANCELED' },
            });
            await prisma.user.update({
              where: { id: userId },
              data: { balance: { increment: bet.betAmount } },
            });
          });
          // Busca o saldo atualizado para retornar ao frontend
          const updatedPlayer = await this.prisma.user.findUnique({ where: { id: userId }, select: { balance: true } });

          return reply.status(200).send({ message: 'Sua aposta foi cancelada e o valor estornado. Você saiu da fila.', userBalance: updatedPlayer.balance.toNumber(), isInBetQueue: false });
        } else {
          return reply.status(404).send({ message: 'Você não está em nenhuma fila de aposta ativa.' });
        }
      } else if (role === 'mediator') {
        const mediationRequest = await this.prisma.mediationRequest.findUnique({
          where: {
            mediatorId: userId,
          },
        });

        if (mediationRequest && mediationRequest.status === 'AVAILABLE') {
          await this.prisma.mediationRequest.update({
            where: { id: mediationRequest.id },
            data: { status: 'OFFLINE' },
          });
          return reply.status(200).send({ message: 'Você saiu da fila de mediação.', isInMediationQueue: false });
        } else if (mediationRequest && mediationRequest.status === 'IN_MEDIATION') {
          return reply.status(400).send({ message: 'Você não pode sair da fila, pois está mediando um confronto. Finalize-o primeiro.' });
        } else {
          return reply.status(404).send({ message: 'Você não está em nenhuma fila de mediação ativa.' });
        }
      } else {
        return reply.status(400).send({ error: 'Papel inválido fornecido.' });
      }
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Erro interno do servidor ao sair da fila.', details: error.message });
    }
  }

  async getMatchDetails(request, reply) {
    if (!request.user || !request.user.sub) {
      return reply.status(401).send({ error: 'Não autorizado: usuário não autenticado.' });
    }
    const { matchId } = request.params;
    const userId = request.user.sub;

    try {
      const match = await this.prisma.match.findUnique({
        where: { id: matchId },
        include: {
          player1: {
            select: {
              id: true,
              profile: { select: { username: true, avatar: true } },
            },
          },
          player2: {
            select: {
              id: true,
              profile: { select: { username: true, avatar: true } },
            },
          },
          mediator: {
            select: {
              id: true,
              profile: { select: { username: true, avatar: true } },
            },
          },
          conversation: {
            select: { id: true, participants: { select: { id: true, profile: { select: { username: true } } } } }
          }
        },
      });

      if (!match) {
        return reply.status(404).send({ error: 'Partida não encontrada.' });
      }

      const isParticipant = [match.player1Id, match.player2Id, match.mediatorId].includes(userId);
      if (!isParticipant) {
        return reply.status(403).send({ error: 'Acesso negado: Você não é participante desta partida.' });
      }

      const transformedMatch = {
        ...match,
        player1: match.player1 ? { id: match.player1.id, username: match.player1.profile?.username, avatar: match.player1.profile?.avatar } : null,
        player2: match.player2 ? { id: match.player2.id, username: match.player2.profile?.username, avatar: match.player2.profile?.avatar } : null,
        mediator: match.mediator ? { id: match.mediator.id, username: match.mediator.profile?.username, avatar: match.mediator.profile?.avatar } : null,
        conversation: match.conversation ? {
          ...match.conversation,
          participants: match.conversation.participants.map(p => ({
            id: p.id,
            username: p.profile?.username
          }))
        } : null,
        // Garante que betAmount é um Number para o frontend
        betAmount: match.betAmount.toNumber ? match.betAmount.toNumber() : match.betAmount 
      };

      return reply.status(200).send(transformedMatch);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Erro interno do servidor ao obter detalhes da partida.', details: error.message });
    }
  }
}

export default MatchmakingController;