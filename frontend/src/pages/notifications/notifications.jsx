// src/pages/notifications/notifications.jsx
import React, { useEffect, useState, useContext } from 'react'; // Importe useContext
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserContext } from '../../context/UserContext'; // <--- Importe o UserContext

const NotificationsPage = () => {
    // Pegue as notificações e funções do UserContext
    const { notifications, unreadNotificationsCount, loading, login, fetchNotifications, markNotificationsAsRead } = useContext(UserContext);
    const navigate = useNavigate();

    // Quando a página de notificações é carregada e elas já foram buscadas,
    // marca todas as notificações não lidas como lidas.
    useEffect(() => {
    if (!loading && login && notifications.length > 0 && unreadNotificationsCount > 0) {
        // Pega os IDs das notificações não lidas para passar para markNotificationsAsRead
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length > 0) {
            markNotificationsAsRead(unreadIds); // Isso usaria a nova rota mark-read-batch
        }
    }
}, [notifications, loading, login, unreadNotificationsCount, markNotificationsAsRead]);
    // Não precisamos mais de getUserIdFromToken ou fetchNotifications aqui,
    // pois elas são gerenciadas pelo UserContext.

    const handleFriendRequestAction = async (notificationId, friendshipId, action) => {
        // A lógica de aceitar/recusar amizade continua aqui, mas podemos
        // chamar markNotificationsAsRead para o ID específico após a ação.
        try {
            const token = localStorage.getItem('token');
            const url = `${import.meta.env.VITE_API_URL}/friends/${friendshipId}/${action}`;
            // Não precisa enviar userId no body se seu backend validar pelo token
            await axios.patch(url, {}, { // Removido { userId: authenticatedUserId } do body
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Após a ação, marca esta notificação específica como lida
            await markNotificationsAsRead([notificationId]); // Marca apenas esta notificação como lida

            alert(`Pedido de amizade ${action === 'accept' ? 'aceito' : 'recusado'} com sucesso!`);
            // Atualiza a lista de notificações para remover a notificação de pedido
            fetchNotifications(); // Rebusca as notificações para refletir a mudança
        } catch (error) {
            console.error(`Erro ao ${action} pedido de amizade:`, error.response?.data?.message || error.message);
            alert(`Erro ao ${action} pedido de amizade.`);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Marca a notificação como lida ao clicar, se ela ainda não foi lida
        if (!notification.read) {
            await markNotificationsAsRead([notification.id]); // Mark just this one
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };


    const renderNotification = (notification) => {
        const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR });
        const isReadClass = notification.read ? 'opacity-60 bg-gray-700' : 'bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md';

        if (notification.type === 'friend_request') {
            const { requesterId, requesterName, friendshipId } = notification.content || {};

            return (
                <div key={notification.id} className={`p-4 rounded-lg mb-3 flex items-center justify-between transition duration-200 ease-in-out ${isReadClass}`}>
                    <div>
                        <span className="font-bold">
                            {requesterName || 'Um usuário'}
                        </span> te enviou um pedido de amizade.
                        <p className="text-sm text-gray-300 mt-1">{timeAgo}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            onClick={(e) => { e.stopPropagation(); handleFriendRequestAction(notification.id, friendshipId, 'accept'); }}
                        >
                            Aceitar
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            onClick={(e) => { e.stopPropagation(); handleFriendRequestAction(notification.id, friendshipId, 'decline'); }}
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
            // O link para o perfil pode vir da notificação.link se seu backend enviar
            // const linkToProfile = notification.link;

            return (
                <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)} // Clica para marcar lida e navegar
                    className={`p-4 rounded-lg mb-3 cursor-pointer transition duration-200 ease-in-out ${isReadClass}`}
                >
                    <p className="text-lg">
                        <span className="font-bold">
                            {userName || 'Um usuário'}
                        </span> {notification.type === 'friend_accepted' ? 'aceitou' : 'recusou'} seu pedido de amizade.
                    </p>
                    <p className="text-sm text-gray-300 mt-1">{timeAgo}</p>
                </div>
            );
        }

        // Para notificações de torneio ou outros tipos, use o campo 'message'
        return (
            <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)} // Clica para marcar lida e navegar
                className={`p-4 rounded-lg mb-3 cursor-pointer transition duration-200 ease-in-out ${isReadClass}`}
            >
                <p className="text-lg">{notification.message}</p>
                <p className="text-sm text-gray-300 mt-1">{timeAgo}</p>
            </div>
        );
    };

    if (loading) {
        return <p className="text-center text-gray-400 mt-10 text-xl">Carregando notificações...</p>;
    }

    if (!login) {
        return <p className="text-center text-red-500 mt-10 text-xl">Faça login para ver suas notificações.</p>;
    }

    return (
        <div className="min-h-screen bg-gray-900 py-8 px-4">
            <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl">
                <h1 className="text-3xl font-bold mb-6 text-white text-center">
                    Suas Notificações
                    {unreadNotificationsCount > 0 && (
                        <span className="ml-3 bg-red-600 text-white text-sm px-3 py-1 rounded-full font-bold">
                            {unreadNotificationsCount} novas
                        </span>
                    )}
                </h1>

                {notifications.length === 0 ? (
                    <p className="text-gray-400 text-center text-lg py-10">Nenhuma notificação por enquanto.</p>
                ) : (
                    <div className="space-y-4">
                        {notifications.map(renderNotification)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;