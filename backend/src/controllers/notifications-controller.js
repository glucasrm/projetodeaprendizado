// src/controllers/notifications-controller.js
import prisma from '../lib/prisma.js';
import { z } from 'zod';
/**
 * Lista notificações do usuário logado
 */
export async function listNotifications(request, reply) {
  const userId = request.user.sub;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  // Mapear notificações para parsear o campo 'content' se for JSON
  const formattedNotifications = notifications.map(notification => {
    if (notification.content) {
      try {
        // Tentativa de parsear o content se for um JSON string
        const parsedContent = JSON.parse(notification.content);
        return { ...notification, content: parsedContent };
      } catch (e) {
        // Se não for JSON válido, manter como string e logar um aviso
        console.warn('Conteúdo da notificação não é JSON válido ou já é um objeto:', notification.content);
      }
    }
    return notification;
  });

  return reply.send(formattedNotifications);
}

/**
 * Marca uma notificação como lida
 */
export async function markNotificationAsRead(request, reply) {
  const userId = request.user.sub;
  const { id } = request.params;

  const notification = await prisma.notification.updateMany({
    where: {
      id,
      userId
    },
    data: {
      read: true
    }
  });

  if (notification.count === 0) {
    return reply.status(404).send({ error: 'Notificação não encontrada ou não pertence ao usuário.' });
  }

  return reply.send({ success: true });
}

/**
 * Marca todas as notificações do usuário como lidas
 */
export async function markAllNotificationsAsRead(request, reply) {
  const userId = request.user.sub;

  await prisma.notification.updateMany({
    where: {
      userId,
      read: false
    },
    data: {
      read: true
    }
  });

  return reply.send({ success: true });
  
}export async function markNotificationsAsReadBatch(request, reply) {
    const userId = request.user.sub;
    const { notificationIds } = z.object({
        notificationIds: z.array(z.string().uuid()),
    }).parse(request.body); // Valida o array de IDs

    try {
        const updatedNotifications = await prisma.notification.updateMany({
            where: {
                id: {
                    in: notificationIds, // IDs na lista fornecida
                },
                userId: userId, // Garante que o usuário só possa marcar suas próprias
                read: false, // Opcional: só marca as que não estão lidas
            },
            data: {
                read: true,
            },
        });
        return reply.send({ count: updatedNotifications.count, success: true, message: 'Notificações marcadas como lidas.' });
    } catch (error) {
        console.error('Erro ao marcar notificações em lote como lidas:', error);
        return reply.status(500).send({ error: 'Erro ao marcar notificações em lote como lidas.' });
    }
}