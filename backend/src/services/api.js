import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento de erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.warn('Token expirado ou inválido. Redirecionando...');
      // Exemplo: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// SERVIÇOS: Notificações
export const notificationService = {
  async createNotification(notificationData) {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },
  async getPendingNotifications(userId) {
    const response = await api.get(`/notifications/pending/${userId}`);
    return response.data;
  },
  async getAllNotifications(userId, page = 1, limit = 20) {
    const response = await api.get(`/notifications/all/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  },
  async markAsRead(notificationId, userId) {
    const response = await api.put(`/notifications/${notificationId}/read`, {
      userId,
    });
    return response.data;
  },
  async markAllAsRead(userId) {
    const response = await api.put(`/notifications/read-all/${userId}`);
    return response.data;
  },
  async deleteNotification(notificationId, userId) {
    const response = await api.delete(`/notifications/${notificationId}`, {
      data: { userId },
    });
    return response.data;
  },
  async getUnreadCount(userId) {
    const response = await api.get(`/notifications/unread-count/${userId}`);
    return response.data;
  },
};

// SERVIÇOS: Amizades
export const friendshipService = {
  async sendFriendRequest(requesterId, receiverId) {
    const response = await api.post('/api/friendship/friends/request', {
      requesterId,
      receiverId,
    });
    return response.data;
  },
  async acceptFriendRequest(friendshipId, userId) {
    const response = await api.patch(`/api/friendship/friends/${friendshipId}/accept`, {
      userId,
    });
    return response.data;
  },
  async declineFriendRequest(friendshipId, userId) {
    const response = await api.patch(`/api/friendship/friends/${friendshipId}/decline`, {
      userId,
    });
    return response.data;
  },
  async getFriends(userId) {
    const response = await api.get(`/api/friendship/friends/${userId}`);
    return response.data;
  },
  async getPendingRequests(userId) {
    const response = await api.get(`/api/friendship/friends/pending/${userId}`);
    return response.data;
  },
  async removeFriendship(friendshipId, userId) {
    const response = await api.delete(`/api/friendship/friends/${friendshipId}`, {
      data: { userId },
    });
    return response.data;
  },
};

// SERVIÇOS: Usuários
export const userService = {
  async searchUsers(query, page = 1, limit = 10) {
    const response = await api.get('/api/users/search', {
      params: { query, page, limit },
    });
    return response.data;
  },
  async getUserById(userId) {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },
  async getSuggestedUsers(userId, limit = 10) {
    const response = await api.get(`/api/users/${userId}/suggestions`, {
      params: { limit },
    });
    return response.data;
  },
};

export default api;
