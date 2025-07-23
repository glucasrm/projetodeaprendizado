import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // Função para extrair userId do token
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        return decodedToken.sub; // Supondo que o userId esteja em 'sub'
      }
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
    }
    return null;
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
      }
    };

    fetchNotifications();
  }, []);

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const handleTournamentClick = (url, notificationId) => {
    markNotificationAsRead(notificationId);
    navigate(url);
  };

  const handleFriendRequestAction = async (notificationId, friendshipId, action) => {
    try {
      const token = localStorage.getItem('token');
      const authenticatedUserId = getUserIdFromToken(); // Obtenha o userId autenticado

      if (!authenticatedUserId) {
        console.error('Usuário não autenticado.');
        return;
      }

      // As rotas de aceitar/recusar agora usam o userId do token para validação no backend
      // Portanto, não é estritamente necessário enviar o userId no body,
      // mas mantive para compatibilidade com o schema que você tinha.
      const url = `${import.meta.env.VITE_API_URL}/friends/${friendshipId}/${action}`;
      await axios.patch(url, { userId: authenticatedUserId }, { // userId no body pode ser removido se o schema permitir
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remover a notificação da lista (ou marcar como lida e processada)
      setNotifications(prevNotifications =>
        prevNotifications.filter(n => n.id !== notificationId)
      );

      // Opcional: Mostrar uma mensagem de sucesso para o usuário
      alert(`Pedido de amizade ${action === 'accept' ? 'aceito' : 'recusado'} com sucesso!`);

    } catch (error) {
      console.error(`Erro ao ${action} pedido de amizade:`, error);
      alert(`Erro ao ${action} pedido de amizade.`); // Feedback de erro
    }
  };

  const renderNotification = (notification) => {
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR });
    const isReadClass = notification.read ? 'opacity-60' : 'font-medium';

    if (notification.type === 'friend_request') {
      const { requesterId, requesterName, friendshipId } = notification.content || {};

      return (
        <div key={notification.id} className={`bg-gray-800 p-4 rounded-lg mb-3 text-white flex items-center justify-between ${isReadClass}`}>
          <div>
            <span className="font-bold">
              {requesterName || 'Um usuário'}
            </span> te enviou um pedido de amizade.
            <p className="text-sm text-gray-400">{timeAgo}</p>
          </div>
          <div className="flex space-x-2">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              onClick={() => handleFriendRequestAction(notification.id, friendshipId, 'accept')}
            >
              Aceitar
            </button>
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
              onClick={() => handleFriendRequestAction(notification.id, friendshipId, 'decline')}
            >
              Recusar
            </button>
          </div>
        </div>
      );
    }

    if (notification.type === 'friend_accepted' || notification.type === 'friend_declined') {
      const { acceptedByName, declinedByName } = notification.content || {};
      const userName = acceptedByName || declinedByName;
      const linkToProfile = notification.link;

      return (
        <div
          key={notification.id}
          // Marcar como lida ao clicar e navegar, se houver link
          onClick={() => notification.link && handleTournamentClick(notification.link, notification.id)}
          className={`bg-gray-800 p-3 rounded-lg mb-2 text-white cursor-pointer hover:bg-gray-700 transition ${isReadClass}`}
        >
          <p>
            <span className="font-bold">
              {userName || 'Um usuário'}
            </span> {notification.type === 'friend_accepted' ? 'aceitou' : 'recusou'} seu pedido de amizade.
          </p>
          <p className="text-xs text-gray-400">{timeAgo}</p>
        </div>
      );
    }

    // Para notificações de torneio ou outros tipos, use o campo 'message'
    return (
      <div
        key={notification.id}
        onClick={() => notification.link && handleTournamentClick(notification.link, notification.id)}
        className={`bg-gray-800 p-3 rounded-lg mb-2 text-white cursor-pointer hover:bg-gray-700 transition ${isReadClass}`}
      >
        <p>{notification.message}</p>
        <p className="text-xs text-gray-400">{timeAgo}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Notificações</h1>
        {notifications.length > 0 ? (
          notifications.map(renderNotification)
        ) : (
          <p className="text-gray-300">Nenhuma notificação por enquanto.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;