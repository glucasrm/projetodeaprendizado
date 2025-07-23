// src/controllers/FriendshipController.js
class FriendshipController {
  constructor(prisma, notificationService) {
    this.prisma = prisma;
    this.notificationService = notificationService;
  }

  // Enviar convite de amizade
  async sendFriendRequest(request, reply) {
    // CORREÇÃO AQUI: Usando request.user.id para consistência
    const requesterId = request.user.id;
    const { receiverId } = request.body;

    console.log('DEBUG (FriendshipController.sendFriendRequest): requesterId (do JWT):', requesterId);
    console.log('DEBUG (FriendshipController.sendFriendRequest): receiverId (do body):', receiverId);
    console.log('DEBUG (FriendshipController.sendFriendRequest): Tipo de requesterId:', typeof requesterId);
    console.log('DEBUG (FriendshipController.sendFriendRequest): Conteúdo completo de request.user:', request.user); // Adicionado para depuração

    try {
      if (requesterId === receiverId) {
        return reply.status(400).send({
          error: 'Erro de validação',
          message: 'Não é possível enviar convite de amizade para si mesmo'
        });
      }

      // 1. Verificar se já são amigos (status "accepted")
      const existingFriendship = await this.prisma.friend.findFirst({
        where: {
          OR: [
            { requesterId: requesterId, receiverId: receiverId, status: "accepted" },
            { requesterId: receiverId, receiverId: requesterId, status: "accepted" }
          ]
        }
      });

      if (existingFriendship) {
        return reply.status(409).send({
          error: 'Conflito',
          message: 'Vocês já são amigos.'
        });
      }

      // 2. Verificar se já existe um convite pendente (requester -> receiver)
      const existingPendingRequest = await this.prisma.friend.findFirst({
        where: {
          requesterId: requesterId,
          receiverId: receiverId,
          status: "pending"
        }
      });

      if (existingPendingRequest) {
        return reply.status(409).send({
          error: 'Conflito',
          message: 'Já existe um convite de amizade pendente enviado para este usuário.'
        });
      }

      // 3. Verificar se já existe um convite pendente no sentido inverso (receiver -> requester)
      const existingInversePendingRequest = await this.prisma.friend.findFirst({
        where: {
          requesterId: receiverId,
          receiverId: requesterId,
          status: "pending"
        }
      });

      if (existingInversePendingRequest) {
        return reply.status(409).send({
          error: 'Conflito',
          message: 'Este usuário já te enviou um convite de amizade. Você pode aceitá-lo.'
        });
      }

      // Se passou por todas as verificações, crie o novo pedido
      const friendRequest = await this.prisma.friend.create({
        data: {
          requesterId,
          receiverId,
          status: "pending",
        },
      });

      const requesterUser = await this.prisma.user.findUnique({
        where: { id: requesterId },
        select: { nome: true, profile: { select: { username: true } } }
      });
      const requesterName = requesterUser?.profile?.username || requesterUser?.nome || requesterId;

      await this.notificationService.createNotification({
        userId: receiverId,
        type: "friend_invite",
        content: `Você recebeu um convite de amizade de ${requesterName}.`,
        link: `/profile/${requesterId}`,
        message: `Você recebeu um convite de amizade de ${requesterName}.`,
      });


      return reply.status(201).send({
        message: 'Convite de amizade enviado com sucesso',
        friendRequest,
      });

    } catch (error) {
      console.error('Erro detalhado ao enviar convite de amizade:', error);

      if (error.code === 'P2002') {
        return reply.status(409).send({
          error: 'Conflito',
          message: 'Já existe um convite de amizade pendente ou amizade estabelecida entre estes usuários.'
        });
      }

      return reply.status(500).send({
        error: 'Erro interno do servidor',
        message: 'Erro ao enviar convite de amizade'
      });
    }
  }


  // Aceitar convite de amizade
  async acceptFriendRequest(request, reply) {
    try {
      const { friendshipId } = request.params;
      // CORREÇÃO AQUI: Usando request.user.id para consistência
      const authenticatedUserId = request.user.id;

      const friendship = await this.prisma.friend.findUnique({
        where: { id: friendshipId },
        include: {
          requester: {
            select: { id: true, nome: true, sobrenome: true, profile: { select: { username: true } } }
          },
          receiver: {
            select: { id: true, nome: true, sobrenome: true, profile: { select: { username: true } } }
          }
        }
      });

      if (!friendship) {
        return reply.status(404).send({
          error: 'Convite não encontrado',
          message: 'Convite de amizade não encontrado'
        });
      }

      if (friendship.receiverId !== authenticatedUserId) {
        return reply.status(403).send({
          error: 'Acesso negado',
          message: 'Você não tem permissão para aceitar este convite.'
        });
      }

      if (friendship.status !== 'pending') {
        return reply.status(400).send({
          error: 'Status inválido',
          message: `Convite já foi ${friendship.status === 'accepted' ? 'aceito' : 'recusado'}`
        });
      }

      const updatedFriendship = await this.prisma.friend.update({
        where: { id: friendshipId },
        data: { status: 'accepted' },
        include: {
          requester: {
            select: { id: true, nome: true, sobrenome: true, profile: { select: { username: true } } }
          },
          receiver: {
            select: { id: true, nome: true, sobrenome: true, profile: { select: { username: true } } }
          }
        }
      });

      try {
        await this.notificationService.createFriendAcceptedNotification(
          friendship.requesterId,
          friendship.receiverId
        );
      } catch (notificationError) {
        console.error('Erro ao criar notificação de amizade aceita:', notificationError);
      }

      return reply.status(200).send({
        message: 'Convite de amizade aceito com sucesso',
        data: updatedFriendship
      });

    } catch (error) {
      console.error('Erro ao aceitar convite de amizade:', error);
      return reply.status(500).send({
        error: 'Erro interno do servidor',
        message: 'Erro ao aceitar convite de amizade'
      });
    }
  }

  // Recusar convite de amizade
  async declineFriendRequest(request, reply) {
    try {
      const { friendshipId } = request.params;
      // CORREÇÃO AQUI: Usando request.user.id para consistência
      const authenticatedUserId = request.user.id;

      const friendship = await this.prisma.friend.findUnique({
        where: { id: friendshipId },
        include: {
          requester: {
            select: { id: true, nome: true, sobrenome: true, profile: { select: { username: true } } }
          },
          receiver: {
            select: { id: true, nome: true, sobrenome: true, profile: { select: { username: true } } }
          }
        }
      });

      if (!friendship) {
        return reply.status(404).send({
          error: 'Convite não encontrado',
          message: 'Convite de amizade não encontrado'
        });
      }

      if (friendship.receiverId !== authenticatedUserId) {
        return reply.status(403).send({
          error: 'Acesso negado',
          message: 'Você não tem permissão para recusar este convite.'
        });
      }

      if (friendship.status !== 'pending') {
        return reply.status(400).send({
          error: 'Status inválido',
          message: `Convite já foi ${friendship.status === 'accepted' ? 'aceito' : 'recusado'}`
        });
      }

      const updatedFriendship = await this.prisma.friend.update({
        where: { id: friendshipId },
        data: { status: 'declined' },
        include: {
          requester: {
            select: { id: true, nome: true, sobrenome: true, profile: { select: { username: true } } }
          },
          receiver: {
            select: { id: true, nome: true, sobrenome: true, profile: { select: { username: true } } }
          }
        }
      });

      try {
        await this.notificationService.createFriendDeclinedNotification(
          friendship.requesterId,
          friendship.receiverId
        );
      } catch (notificationError) {
        console.error('Erro ao criar notificação de amizade recusada:', notificationError);
      }

      return reply.status(200).send({
        message: 'Convite de amizade recusado',
        data: updatedFriendship
      });

    } catch (error) {
      console.error('Erro ao recusar convite de amizade:', error);
      return reply.status(500).send({
        error: 'Erro interno do servidor',
        message: 'Erro ao recusar convite de amizade'
      });
    }
  }

  // Listar amigos de um usuário
  async getFriends(request, reply) {
    try {
      const { userId } = request.params;
      // CORREÇÃO AQUI: Usando request.user.id para consistência
      if (request.user.id !== userId) {
        return reply.status(403).send({
          error: 'Acesso negado',
          message: 'Você só pode listar seus próprios amigos.'
        });
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return reply.status(404).send({
          error: 'Usuário não encontrado',
          message: 'Usuário não encontrado'
        });
      }

      const friendships = await this.prisma.friend.findMany({
        where: {
          OR: [
            { requesterId: userId, status: 'accepted' },
            { receiverId: userId, status: 'accepted' }
          ]
        },
        include: {
          requester: {
            select: { id: true, nome: true, sobrenome: true, profile: { select: { username: true, avatar: true } } }
          },
          receiver: {
            select: { id: true, nome: true, sobrenome: true, profile: { select: { username: true, avatar: true } } }
          }
        }
      });

      const friends = friendships.map(friendship => {
        const friend = friendship.requesterId === userId
          ? friendship.receiver
          : friendship.requester;

        return {
          friendshipId: friendship.id,
          friend: {
            id: friend.id,
            nome: friend.nome,
            sobrenome: friend.sobrenome,
            username: friend.profile?.username,
            avatar: friend.profile?.avatar,
          },
          createdAt: friendship.createdAt
        };
      });

      return reply.status(200).send({
        message: 'Amigos listados com sucesso',
        data: friends,
        total: friends.length
      });

    } catch (error) {
      console.error('Erro ao listar amigos:', error);
      return reply.status(500).send({
        error: 'Erro interno do servidor',
        message: 'Erro ao listar amigos'
      });
    }
  }

  // Listar convites pendentes de um usuário
  async getPendingRequests(request, reply) {
    try {
      const { userId } = request.params;
      // CORREÇÃO AQUI: Usando request.user.id para consistência
      if (request.user.id !== userId) {
        return reply.status(403).send({
          error: 'Acesso negado',
          message: 'Você só pode listar seus próprios convites pendentes.'
        });
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return reply.status(404).send({
          error: 'Usuário não encontrado',
          message: 'Usuário não encontrado'
        });
      }

      const receivedRequests = await this.prisma.friend.findMany({
        where: {
          receiverId: userId,
          status: 'pending'
        },
        include: {
          requester: {
            select: { id: true, nome: true, sobrenome: true, profile: { select: { username: true, avatar: true } } }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const sentRequests = await this.prisma.friend.findMany({
        where: {
          requesterId: userId,
          status: 'pending'
        },
        include: {
          receiver: {
            select: { id: true, nome: true, sobrenome: true, profile: { select: { username: true, avatar: true } } }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return reply.status(200).send({
        message: 'Convites pendentes listados com sucesso',
        data: {
          received: receivedRequests.map(req => ({
            id: req.id,
            from: {
              id: req.requester.id,
              nome: req.requester.nome,
              sobrenome: req.requester.sobrenome,
              username: req.requester.profile?.username,
              avatar: req.requester.profile?.avatar,
            },
            createdAt: req.createdAt
          })),
          sent: sentRequests.map(req => ({
            id: req.id,
            to: {
              id: req.receiver.id,
              nome: req.receiver.nome,
              sobrenome: req.receiver.sobrenome,
              username: req.receiver.profile?.username,
              avatar: req.receiver.profile?.avatar,
            },
            createdAt: req.createdAt
          }))
        }
      });

    } catch (error) {
      console.error('Erro ao listar convites pendentes:', error);
      return reply.status(500).send({
        error: 'Erro interno do servidor',
        message: 'Erro ao listar convites pendentes'
      });
    }
  }

  // Remover amizade
  async removeFriendship(request, reply) {
    try {
      const { friendshipId } = request.params;
      // CORREÇÃO AQUI: Usando request.user.id para consistência
      const authenticatedUserId = request.user.id;

      const friendship = await this.prisma.friend.findUnique({
        where: { id: friendshipId },
        include: {
          requester: {
            select: { id: true, nome: true, sobrenome: true }
          },
          receiver: {
            select: { id: true, nome: true, sobrenome: true }
          }
        }
      });

      if (!friendship) {
        return reply.status(404).send({
          error: 'Amizade não encontrada',
          message: 'Amizade não encontrada'
        });
      }

      if (friendship.requesterId !== authenticatedUserId && friendship.receiverId !== authenticatedUserId) {
        return reply.status(403).send({
          error: 'Acesso negado',
          message: 'Você não pode remover esta amizade'
        });
      }

      if (friendship.status !== 'accepted') {
        return reply.status(400).send({
          error: 'Status inválido',
          message: 'Apenas amizades aceitas podem ser removidas'
        });
      }

      await this.prisma.friend.delete({
        where: { id: friendshipId }
      });

      return reply.status(200).send({
        message: 'Amizade removida com sucesso'
      });

    } catch (error) {
      console.error('Erro ao remover amizade:', error);
      return reply.status(500).send({
        error: 'Erro interno do servidor',
        message: 'Erro ao remover amizade'
      });
    }
  }
}

export default FriendshipController;