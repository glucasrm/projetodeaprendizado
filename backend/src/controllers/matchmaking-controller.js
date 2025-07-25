// src/controllers/matchmaking-controller.js
import { v4 as uuidv4 } from 'uuid';

class MatchmakingController {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async joinBetQueue(request, reply) {
    // Certifique-se de que o usuário está autenticado
    // O Fastify anexa o usuário autenticado em `request.user` após `preHandler: [fastify.authenticate]`
    if (!request.user || !request.user.id) {
      return reply.status(401).send({ error: 'Não autorizado: usuário não autenticado.' });
    }

    const playerId = request.user.id; // Obter o ID do usuário autenticado
    const { betAmount, modality, platform } = request.body;

    if (!betAmount || !modality || !platform) {
      return reply.status(400).send({ error: 'Parâmetros de aposta inválidos.' });
    }

    // Convert betAmount to a number for comparison
    const parsedBetAmount = parseFloat(betAmount);
    if (isNaN(parsedBetAmount) || parsedBetAmount <= 0) {
        return reply.status(400).send({ error: 'Valor da aposta inválido.' });
    }


    let newBet = null; // Declare newBet outside try block for wider scope

    try {
      // 1. Validar jogador e saldo
      const player = await this.prisma.user.findUnique({ where: { id: playerId } });
      if (!player) {
        return reply.status(404).send({ error: 'Jogador não encontrado.' });
      }
      // Prisma Decimal comparison
      if (player.balance.lt(parsedBetAmount)) {
        return reply.status(400).send({ error: 'Saldo insuficiente para a aposta.' });
      }

      // 2. Verificar se o jogador já está em uma fila de aposta ativa
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
        });
      }

      // Criar uma nova aposta direta
      newBet = await this.prisma.directBet.create({
        data: {
          playerId,
          betAmount: parseFloat(parsedBetAmount.toFixed(2)), // Garante precisão decimal
          modality,
          platform,
          status: 'WAITING_OPPONENT',
        },
        include: { // Include player to use username in notifications
            player: {
                select: { username: true }
            }
        }
      });

      // Debitar o valor da aposta do saldo do jogador imediatamente
      await this.prisma.user.update({
        where: { id: playerId },
        data: { balance: { decrement: newBet.betAmount } },
      });

      // 3. Lógica de Matchmaking
      const opponentBet = await this.prisma.directBet.findFirst({
        where: {
          modality,
          platform,
          betAmount: parseFloat(parsedBetAmount.toFixed(2)),
          status: 'WAITING_OPPONENT',
          NOT: {
            playerId: playerId, // Não pode ser o mesmo jogador
          },
        },
        orderBy: {
            createdAt: 'asc' // Busca o mais antigo na fila primeiro
        },
        include: { // Include player to use username in notifications
            player: {
                select: { username: true }
            }
        }
      });

      if (opponentBet) {
        // Encontrou um oponente!
        // Marcar ambas as apostas como pareadas dentro de uma transação
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

        // Procurar mediador disponível
        const availableMediatorRequest = await this.prisma.mediationRequest.findFirst({
          where: {
            status: 'AVAILABLE',
            mediator: {
              isAdmin: true,
            },
          },
          include: {
            mediator: true,
          },
          orderBy: {
            createdAt: 'asc' // Pega o mediador mais antigo na fila
          }
        });

        let createdMatch;
        const chatRoomId = uuidv4();

        if (availableMediatorRequest) {
          // Atribuir mediador
          await this.prisma.mediationRequest.update({
            where: { id: availableMediatorRequest.id },
            data: { status: 'IN_MEDIATION' }, // Mediador agora está ocupado
          });

          createdMatch = await this.prisma.match.create({
            data: {
              player1Id: newBet.playerId,
              player2Id: opponentBet.playerId,
              mediatorId: availableMediatorRequest.mediatorId,
              betAmount: newBet.betAmount,
              modality: newBet.modality,
              platform: newBet.platform,
              status: 'IN_PROGRESS', // O confronto já pode ser iniciado
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
                    content: `Seu confronto 🏆 ${newBet.modality} contra ${opponentBet.player.username} foi encontrado e um mediador foi atribuído!`,
                    message: `Seu confronto 🏆 ${newBet.modality} contra ${opponentBet.player.username} foi encontrado e um mediador foi atribuído!`,
                    link: `/apostas/detalhes/${chatRoomId}`, // Exemplo de link para o frontend
                  },
                  {
                    userId: opponentBet.playerId,
                    type: 'match_found',
                    content: `Seu confronto 🏆 ${opponentBet.modality} contra ${newBet.player.username} foi encontrado e um mediador foi atribuído!`,
                    message: `Seu confronto 🏆 ${opponentBet.modality} contra ${newBet.player.username} foi encontrado e um mediador foi atribuído!`,
                    link: `/apostas/detalhes/${chatRoomId}`,
                  },
                  {
                    userId: availableMediatorRequest.mediatorId,
                    type: 'mediation_assigned',
                    content: `Você foi atribuído para mediar um confronto ⚖️ ${newBet.modality} entre ${newBet.player.username} e ${opponentBet.player.username}.`,
                    message: `Você foi atribuído para mediar um confronto ⚖️ ${newBet.modality} entre ${newBet.player.username} e ${opponentBet.player.username}.`,
                    link: `/mediacao/detalhes/${chatRoomId}`,
                  },
                ],
              },
            },
            include: {
                player1: { select: { username: true } },
                player2: { select: { username: true } },
                mediator: { select: { username: true } },
            }
          });

          // Retornar dados da partida para o frontend
          return reply.status(200).send({
            message: 'Partida encontrada e mediador atribuído!',
            matchId: createdMatch.id,
            player1: createdMatch.player1,
            player2: createdMatch.player2,
            mediator: createdMatch.mediator,
            chatRoomId: createdMatch.chatRoomId,
            status: createdMatch.status,
          });

        } else {
          // Não encontrou mediador, a partida aguarda
          createdMatch = await this.prisma.match.create({
            data: {
              player1Id: newBet.playerId,
              player2Id: opponentBet.playerId,
              betAmount: newBet.betAmount,
              modality: newBet.modality,
              platform: newBet.platform,
              status: 'PENDING_MEDIATOR', // Aguardando mediador
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
                    link: `/apostas/detalhes/${chatRoomId}`,
                  },
                  {
                    userId: opponentBet.playerId,
                    type: 'match_found_pending_mediator',
                    content: `Oponente encontrado para seu confronto ${opponentBet.modality}! Aguardando um mediador.`,
                    message: `Oponente encontrado para seu confronto ${opponentBet.modality}! Aguardando um mediador.`,
                    link: `/apostas/detalhes/${chatRoomId}`,
                  },
                ],
              },
            },
            include: {
                player1: { select: { username: true } },
                player2: { select: { username: true } },
            }
          });

          return reply.status(202).send({
            message: 'Oponente encontrado, aguardando mediador.',
            matchId: createdMatch.id,
            player1: createdMatch.player1,
            player2: createdMatch.player2,
            chatRoomId: createdMatch.chatRoomId,
            status: createdMatch.status,
          });
        }
      } else {
        // Não encontrou oponente, permanece na fila
        return reply.status(200).send({
          message: 'Aguardando oponente. Sua aposta foi registrada.',
          betId: newBet.id,
          status: newBet.status,
        });
      }
    } catch (error) {
      request.log.error(error);
      // Em caso de erro, considerar estornar o valor da aposta
      if (newBet) { // Se a aposta foi criada e o saldo debitado
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
    if (!request.user || !request.user.id) {
      return reply.status(401).send({ error: 'Não autorizado: usuário não autenticado.' });
    }
    const mediatorId = request.user.id;

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
          return reply.status(200).send({ message: 'Você já está na fila de mediação.' });
        } else {
          // Atualiza para disponível se estiver em outro status (ex: OFFLINE, IN_MEDIATION)
          await this.prisma.mediationRequest.update({
            where: { id: existingMediationRequest.id },
            data: { status: 'AVAILABLE' },
          });
          return reply.status(200).send({ message: 'Você voltou para a fila de mediação.' });
        }
      } else {
        await this.prisma.mediationRequest.create({
          data: {
            mediatorId,
            status: 'AVAILABLE',
          },
        });
        return reply.status(200).send({ message: 'Você entrou na fila de mediação.' });
      }
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Erro interno do servidor ao entrar na fila de mediação.', details: error.message });
    }
  }

  async leaveQueue(request, reply) {
    if (!request.user || !request.user.id) {
      return reply.status(401).send({ error: 'Não autorizado: usuário não autenticado.' });
    }
    const userId = request.user.id;
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
          // Estornar o valor da aposta antes de cancelar
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
          return reply.status(200).send({ message: 'Sua aposta foi cancelada e o valor estornado. Você saiu da fila.' });
        } else {
          return reply.status(404).send({ message: 'Você não está em nenhuma fila de aposta ativa.' });
        }
      } else if (role === 'mediator') {
        const mediationRequest = await this.prisma.mediationRequest.findUnique({
          where: {
            mediatorId: userId,
          },
        });

        if (mediationRequest && mediationRequest.status === 'AVAILABLE') { // Só pode sair se estiver AVAILABLE
          await this.prisma.mediationRequest.update({
            where: { id: mediationRequest.id },
            data: { status: 'OFFLINE' },
          });
          return reply.status(200).send({ message: 'Você saiu da fila de mediação.' });
        } else if (mediationRequest && mediationRequest.status === 'IN_MEDIATION') {
          return reply.status(400).send({ message: 'Você não pode sair da fila, pois está mediando um confronto. Finalize-o primeiro.' });
        }
        else {
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
    if (!request.user || !request.user.id) {
      return reply.status(401).send({ error: 'Não autorizado: usuário não autenticado.' });
    }
    const { matchId } = request.params;
    const userId = request.user.id;

    try {
      const match = await this.prisma.match.findUnique({
        where: { id: matchId },
        include: {
          player1: {
            select: { id: true, username: true, avatar: true }, // Inclua avatar do perfil
          },
          player2: {
            select: { id: true, username: true, avatar: true },
          },
          mediator: {
            select: { id: true, username: true, avatar: true },
          },
          conversation: { // Inclui os dados da conversa
            select: { id: true, participants: { select: { id: true, username: true } } }
          }
        },
      });

      if (!match) {
        return reply.status(404).send({ error: 'Partida não encontrada.' });
      }

      // Verificar se o usuário autenticado faz parte desta partida
      const isParticipant = [match.player1Id, match.player2Id, match.mediatorId].includes(userId);
      if (!isParticipant) {
        return reply.status(403).send({ error: 'Acesso negado: Você não é participante desta partida.' });
      }

      return reply.status(200).send(match);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Erro interno do servidor ao obter detalhes da partida.', details: error.message });
    }
  }
}

export default MatchmakingController;