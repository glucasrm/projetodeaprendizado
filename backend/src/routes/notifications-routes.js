// src/routes/notification-routes.js

import {
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/notifications-controller.js';
// REMOVIDO: import verifyJWT from '../middlewares/verify-jwt.js';

export default async function notificationsRoutes(app) {
  // Usando app.authenticate como preHandler
  app.get('/api/notifications', { preHandler: [app.authenticate] }, listNotifications);
  app.patch('/api/notifications/:id/read', { preHandler: [app.authenticate] }, markNotificationAsRead);
  app.patch('/api/notifications/read-all', { preHandler: [app.authenticate] }, markAllNotificationsAsRead);
}