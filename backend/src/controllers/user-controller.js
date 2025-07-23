// src/controllers/user-controller.js
import { Prisma } from '@prisma/client';

class UserController {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Helper para buscar o status da amizade entre dois usuários.
  async _getFriendshipStatus(currentUserId, targetUserId) {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      return null;
    }

    const friendship = await this.prisma.friend.findFirst({
      where: {
        OR: [
          { requesterId: currentUserId, receiverId: targetUserId },
          { requesterId: targetUserId, receiverId: currentUserId }
        ],
      }
    });

    if (friendship) {
      if (friendship.status === 'pending') {
        if (friendship.requesterId === currentUserId) {
          return 'pending_sent'; // O usuário logado enviou o pedido
        } else {
          return 'pending_received'; // O usuário logado recebeu o pedido
        }
      } else if (friendship.status === 'accepted') {
        return 'friends'; // Já são amigos
      }
    }
    return 'none'; // Não há relação de amizade
  }

  // Busca usuários por um termo de pesquisa (query)
  async searchUsers(request, reply) {
    try {
      const { query, limit = 10, page = 1 } = request.query;
      // USANDO request.user.id - Consistente com authenticate.js
      const currentUserId = request.user?.id;

      console.log('DEBUG (UserController.searchUsers): Início da busca');
      console.log('DEBUG (UserController.searchUsers): currentUserId (do token):', currentUserId, 'Tipo:', typeof currentUserId);
      console.log('DEBUG (UserController.searchUsers): query:', query);
      console.log('DEBUG (UserController.searchUsers): Conteúdo completo de request.user:', request.user); // Adicionado para depuração

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

      const usersWithFriendshipStatus = await Promise.all(
        users.map(async (user) => {
          const friendshipStatus = await this._getFriendshipStatus(currentUserId, user.id);
          return { ...user, friendshipStatus };
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
        data: usersWithFriendshipStatus,
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
      // USANDO request.user.id - Consistente com authenticate.js
      const currentUserId = request.user?.id;

      console.log('DEBUG (UserController.getUserById): Início da busca');
      console.log('DEBUG (UserController.getUserById): userId (da URL):', userId, 'Tipo:', typeof userId);
      console.log('DEBUG (UserController.getUserById): currentUserId (do token):', currentUserId, 'Tipo:', typeof currentUserId);
      console.log('DEBUG (UserController.getUserById): Conteúdo completo de request.user:', request.user); // Adicionado para depuração


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

      const friendshipStatus = await this._getFriendshipStatus(currentUserId, userId);

      return reply.status(200).send({
        message: 'Usuário encontrado',
        data: { ...user, friendshipStatus }
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
      // USANDO request.user.id - Consistente com authenticate.js
      const currentUserId = request.user?.id;

      console.log('DEBUG (UserController.getSuggestedUsers): Início da busca');
      console.log('DEBUG (UserController.getSuggestedUsers): userId (da URL):', userId, 'Tipo:', typeof userId);
      console.log('DEBUG (UserController.getSuggestedUsers): currentUserId (do token):', currentUserId, 'Tipo:', typeof currentUserId);
      console.log('DEBUG (UserController.getSuggestedUsers): Conteúdo completo de request.user:', request.user); // MUITO IMPORTANTE!
      console.log('DEBUG (UserController.getSuggestedUsers): limit:', limit);

      // Validação de segurança: Garante que o usuário autenticado é o mesmo da requisição.
      // SE currentUserId FOR undefined/null, OU userId DA URL FOR DIFERENTE DO currentUserId DO TOKEN, RETORNA 403
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
        }
      });

      console.log('DEBUG (UserController.getSuggestedUsers): Amizades relacionadas encontradas:', relatedFriendships.length);

      const excludeUserIds = new Set([currentUserId]); // Sempre exclui o próprio usuário
      relatedFriendships.forEach(friendship => {
        excludeUserIds.add(friendship.requesterId);
        excludeUserIds.add(friendship.receiverId);
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
          const friendshipStatus = await this._getFriendshipStatus(currentUserId, user.id);
          return { ...user, friendshipStatus: friendshipStatus || 'none' };
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