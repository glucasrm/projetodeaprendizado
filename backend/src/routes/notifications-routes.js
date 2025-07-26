// src/routes/notification-routes.js

import {
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  markNotificationsAsReadBatch
} from '../controllers/notifications-controller.js';
// REMOVIDO: import verifyJWT from '../middlewares/verify-jwt.js';

export default async function notificationsRoutes(app) {
  // Usando app.authenticate como preHandler
  app.get('/notifications', { preHandler: [app.authenticate] }, listNotifications);
  app.patch('/notifications/:id/read', { preHandler: [app.authenticate] }, markNotificationAsRead);
  app.patch('/notifications/read-all', { preHandler: [app.authenticate] }, markAllNotificationsAsRead);
  // Para marcar um array de IDs específico (ideal para o frontend)
    app.post('/notifications/mark-read-batch', { preHandler: [app.authenticate] }, markNotificationsAsReadBatch);
}