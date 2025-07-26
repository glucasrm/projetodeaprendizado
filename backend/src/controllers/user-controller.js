// src/controllers/user-controller.js
import { Prisma } from '@prisma/client';

class UserController {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Helper para buscar o status da amizade entre dois usuários E o friendshipId.
  async _getFriendshipStatus(currentUserId, targetUserId) {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      return { status: null, friendshipId: null };
    }

    const friendship = await this.prisma.friend.findFirst({
      where: {
        OR: [
          { requesterId: currentUserId, receiverId: targetUserId },
          { requesterId: targetUserId, receiverId: currentUserId }
        ],
      },
      select: {
        id: true, // Seleciona o ID da amizade
        requesterId: true,
        receiverId: true,
        status: true
      }
    });

    if (friendship) {
      let status = 'none';
      if (friendship.status === 'pending') {
        if (friendship.requesterId === currentUserId) {
          status = 'pending_sent'; // O usuário logado enviou o pedido
        } else {
          status = 'pending_received'; // O usuário logado recebeu o pedido
        }
      } else if (friendship.status === 'accepted') {
        status = 'friends'; // Já são amigos
      }
      return { status: status, friendshipId: friendship.id }; // Retorna o status E o ID da amizade
    }
    return { status: 'none', friendshipId: null }; // Não há relação de amizade
  }

  // Busca usuários por um termo de pesquisa (query)
  async searchUsers(request, reply) {
    try {
      const { query, limit = 10, page = 1 } = request.query;
      const currentUserId = request.user?.sub;

      console.log('DEBUG (UserController.searchUsers): Início da busca');
      console.log('DEBUG (UserController.searchUsers): currentUserId (do token):', currentUserId, 'Tipo:', typeof currentUserId);
      console.log('DEBUG (UserController.searchUsers): query:', query);
      console.log('DEBUG (UserController.searchUsers): Conteúdo completo de request.user:', request.user);

      if (!query || query.trim().length < 2) {
        return reply.status(400).send({
          error: 'Query inválida',
          message: 'A busca deve ter pelo menos 2 caracteres'
        });
      }

      const searchTerm = query.trim().toLowerCase();
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const users = await this.prisma.user.findMany({
        where: {
          AND: [
            {
              id: {
                not: currentUserId,
              },
            },
            {
              OR: [
                { nome: { contains: searchTerm, mode: 'insensitive' } },
                { sobrenome: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
                {
                  profile: {
                    username: { contains: searchTerm, mode: 'insensitive' },
                  },
                },
              ],
            },
          ],
        },
        select: {
          id: true,
          nome: true,
          sobrenome: true,
          email: true,
          createdAt: true,
          profile: {
            select: {
              userId: true,
              username: true,
              avatar: true,
              bio: true
            }
          }
        },
        skip: skip,
        take: parseInt(limit),
        orderBy: {
          nome: 'asc'
        }
      });

      console.log('DEBUG (UserController.searchUsers): Usuários encontrados na busca:', users.length);

      const usersWithFriendshipInfo = await Promise.all(
        users.map(async (user) => {
          const { status, friendshipId } = await this._getFriendshipStatus(currentUserId, user.id);
          return { ...user, friendshipStatus: status, friendshipId: friendshipId }; // Adiciona friendshipId
        })
      );

      const total = await this.prisma.user.count({
        where: {
          AND: [
            {
              id: {
                not: currentUserId,
              },
            },
            {
              OR: [
                { nome: { contains: searchTerm, mode: 'insensitive' } },
                { sobrenome: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
                {
                  profile: {
                    username: { contains: searchTerm, mode: 'insensitive' },
                  },
                },
              ],
            },
          ],
        },
      });

      return reply.status(200).send({
        message: 'Busca realizada com sucesso',
        data: usersWithFriendshipInfo, // Usa a lista com friendshipId
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('ERRO FATAL em searchUsers:', error);
      return reply.status(500).send({
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar usuários. Detalhes: ' + error.message
      });
    }
  }

  // Buscar usuário por ID
  async getUserById(request, reply) {
    try {
      const { userId } = request.params;
      const currentUserId = request.user?.sub;

      console.log('DEBUG (UserController.getUserById): Início da busca');
      console.log('DEBUG (UserController.getUserById): userId (da URL):', userId, 'Tipo:', typeof userId);
      console.log('DEBUG (UserController.getUserById): currentUserId (do token):', currentUserId, 'Tipo:', typeof currentUserId);
      console.log('DEBUG (UserController.getUserById): Conteúdo completo de request.user:', request.user);


      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nome: true,
          sobrenome: true,
          email: true,
          createdAt: true,
          profile: {
            select: {
              userId: true,
              username: true,
              avatar: true,
              bio: true
            }
          },
          socialLinks: {
            select: {
              id: true,
              platform: true,
              url: true
            }
          }
        }
      });

      if (!user) {
        console.warn('AVISO: Usuário não encontrado para ID:', userId);
        return reply.status(404).send({
          error: 'Usuário não encontrado',
          message: 'Usuário não encontrado.'
        });
      }

      console.log('DEBUG (UserController.getUserById): Usuário encontrado:', user.id);

      const { status, friendshipId } = await this._getFriendshipStatus(currentUserId, userId);
      // Retorna o friendshipId também para o caso de getUserById, se necessário no frontend
      return reply.status(200).send({
        message: 'Usuário encontrado',
        data: { ...user, friendshipStatus: status, friendshipId: friendshipId }
      });

    } catch (error) {
      console.error('ERRO FATAL em getUserById:', error);
      return reply.status(500).send({
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar usuário. Detalhes: ' + error.message
      });
    }
  }

  // Buscar usuários sugeridos (usuários que não são amigos)
  async getSuggestedUsers(request, reply) {
    try {
      const { userId } = request.params;
      const { limit = 10 } = request.query;
      const currentUserId = request.user?.sub;

      console.log('DEBUG (UserController.getSuggestedUsers): Início da busca');
      console.log('DEBUG (UserController.getSuggestedUsers): userId (da URL):', userId, 'Tipo:', typeof userId);
      console.log('DEBUG (UserController.getSuggestedUsers): currentUserId (do token):', currentUserId, 'Tipo:', typeof currentUserId);
      console.log('DEBUG (UserController.getSuggestedUsers): Conteúdo completo de request.user:', request.user);
      console.log('DEBUG (UserController.getSuggestedUsers): limit:', limit);

      if (!currentUserId || userId !== currentUserId) {
        console.warn('AVISO: Acesso negado em getSuggestedUsers. currentUserId ou userId mismatch.');
        return reply.status(403).send({ message: 'Acesso negado: Você só pode ver sugestões para seu próprio usuário ou não está autenticado.' });
      }

      const relatedFriendships = await this.prisma.friend.findMany({
        where: {
          OR: [
            { requesterId: currentUserId },
            { receiverId: currentUserId }
          ]
        },
        select: {
          requesterId: true,
          receiverId: true,
          id: true, // Seleciona o ID da amizade aqui também
        }
      });

      console.log('DEBUG (UserController.getSuggestedUsers): Amizades relacionadas encontradas:', relatedFriendships.length);

      const excludeUserIds = new Set([currentUserId]);
      // Mapeia os IDs de amizade para um mapa para uso posterior
      const friendshipIdMap = new Map(); // Key: otherUserId, Value: friendshipId

      relatedFriendships.forEach(friendship => {
        const otherUserId = friendship.requesterId === currentUserId ? friendship.receiverId : friendship.requesterId;
        excludeUserIds.add(otherUserId);
        friendshipIdMap.set(otherUserId, friendship.id); // Armazena o friendshipId
      });

      const excludeArray = Array.from(excludeUserIds);
      console.log('DEBUG (UserController.getSuggestedUsers): IDs a serem excluídos:', excludeArray);

      const suggestedUsers = await this.prisma.user.findMany({
        where: {
          id: {
            notIn: excludeArray
          }
        },
        select: {
          id: true,
          nome: true,
          sobrenome: true,
          email: true,
          createdAt: true,
          profile: {
            select: {
              userId: true,
              username: true,
              avatar: true,
              bio: true
            }
          }
        },
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log('DEBUG (UserController.getSuggestedUsers): Usuários sugeridos encontrados:', suggestedUsers.length);

      const suggestedUsersWithStatus = await Promise.all(
        suggestedUsers.map(async (user) => {
          const { status, friendshipId } = await this._getFriendshipStatus(currentUserId, user.id);
          return { ...user, friendshipStatus: status || 'none', friendshipId: friendshipId }; // Adiciona friendshipId
        })
      );

      return reply.status(200).send({
        message: 'Usuários sugeridos encontrados',
        data: suggestedUsersWithStatus,
        total: suggestedUsersWithStatus.length
      });

    } catch (error) {
      console.error('ERRO FATAL em getSuggestedUsers:', error);
      return reply.status(500).send({
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar usuários sugeridos. Detalhes: ' + error.message
      });
    }
  }
}

export default UserController;
