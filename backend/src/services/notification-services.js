// src/services/notificacoes-services.js

class NotificationService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Método genérico para criar qualquer tipo de notificação
  async createNotification(userId, type, message, content = null, link = null) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          type,
          message,
          content: content ? JSON.stringify(content) : null, // Armazenar JSON stringificado
          link,
          read: false,
        },
      });
      return notification;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  // Helper para buscar nome do usuário (priorizando username)
  async getUserDisplayNome(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { nome: true, sobrenome: true, profile: { select: { username: true } } }
    });
    if (!user) {
      return 'Um usuário'; // Fallback
    }
    return user.profile?.username || `${user.nome} ${user.sobrenome}`;
  }

  // Criar notificação para pedido de amizade
  async createFriendRequestNotification(requesterId, receiverId, friendshipId) { // Adicionado friendshipId
    try {
      const requesterName = await this.getUserDisplayNome(requesterId);

      const contentData = {
        requesterId: requesterId,
        requesterName: requesterName,
        friendshipId: friendshipId, // Adicionado o ID da amizade pendente
      };

      const notification = await this.createNotification(
        receiverId, // Notificação para o receptor
        'friend_request', // Tipo específico para frontend
        `${requesterName} te enviou um pedido de amizade.`,
        contentData, // Dados estruturados para o frontend
        `/profile/${requesterId}` // Link para o perfil do solicitante
      );
      return notification;
    } catch (error) {
      console.error('Erro ao criar notificação de pedido de amizade:', error);
      throw error;
    }
  }

  // Criar notificação para amizade aceita
  async createFriendAcceptedNotification(requesterId, receiverId) {
    try {
      const receiverName = await this.getUserDisplayNome(receiverId);

      const contentData = {
        acceptedById: receiverId,
        acceptedByName: receiverName,
      };

      const notification = await this.createNotification(
        requesterId, // Notificação para o solicitante
        'friend_accepted', // Tipo específico para frontend
        `${receiverName} aceitou seu pedido de amizade.`,
        contentData,
        `/profile/${receiverId}` // Link para o perfil de quem aceitou
      );
      return notification;
    } catch (error) {
      console.error('Erro ao criar notificação de amizade aceita:', error);
      throw error;
    }
  }

  // Criar notificação para amizade recusada
  async createFriendDeclinedNotification(requesterId, receiverId) {
    try {
      const receiverName = await this.getUserDisplayNome(receiverId);

      const contentData = {
        declinedById: receiverId,
        declinedByName: receiverName,
      };

      const notification = await this.createNotification(
        requesterId, // Notificação para o solicitante
        'friend_declined', // Tipo específico para frontend
        `${receiverName} recusou seu pedido de amizade.`,
        contentData,
        `/profile/${receiverId}` // Link para o perfil de quem recusou
      );
      return notification;
    } catch (error) {
      console.error('Erro ao criar notificação de amizade recusada:', error);
      throw error;
    }
  }

  // Buscar notificações não lidas de um usuário
  async getUnreadNotifications(userId) {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: {
          userId,
          read: false
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return notifications;
    } catch (error) {
      console.error('Erro ao buscar notificações não lidas:', error);
      throw error;
    }
  }

  // Contar notificações não lidas de um usuário
  async getUnreadCount(userId) {
    try {
      const count = await this.prisma.notification.count({
        where: {
          userId,
          read: false
        }
      });
      return count;
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      throw error;
    }
  }
}

export default NotificationService; // Exporta a classe, não a instância.