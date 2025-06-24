import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

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

  const handleTournamentClick = (url) => {
    navigate(url);
  };

  const renderNotification = (notification) => {
    if (notification.type === 'friend_request') {
      return (
        <div key={notification.id} className="bg-gray-800 p-4 rounded-lg mb-3 text-white flex items-center justify-between">
          <div>
            <span className="font-bold">{notification.username}</span> te enviou um pedido de amizade.
            <p className="text-sm text-gray-400">{notification.time}</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Aceitar</button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded">Recusar</button>
          </div>
        </div>
      );
    }

    if (notification.type === 'tournament') {
      return (
        <div
          key={notification.id}
          onClick={() => handleTournamentClick(notification.url)}
          className="bg-gray-800 p-3 rounded-lg mb-2 text-white cursor-pointer hover:bg-gray-700 transition"
        >
          <p>{notification.message}</p>
          <p className="text-xs text-gray-400">{notification.time}</p>
        </div>
      );
    }

    return null;
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
