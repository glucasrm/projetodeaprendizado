// src/context/UserContext.jsx
import React, { createContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [login, setLogin] = useState(false);
    const [loading, setLoading] = useState(true);

    const [isInBetQueue, setIsInBetQueue] = useState(false);
    const [currentBetId, setCurrentBetId] = useState(null);
    const [isInMediationQueue, setIsInMediationQueue] = useState(false);
    const [currentMatch, setCurrentMatch] = useState(null); // Importante manter aqui

    // --- NOVOS ESTADOS PARA NOTIFICAÇÕES ---
    const [notifications, setNotifications] = useState([]);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    // ---

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setLogin(false);
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data && res.data.userId) {
                setUser({
                    id: res.data.userId,
                    username: res.data.username,
                    avatar: res.data.avatar,
                    banner: res.data.banner,
                    bio: res.data.bio,
                    balance: res.data.balance,
                    isAdmin: res.data.isAdmin,
                });
                setLogin(true);
            } else {
                setUser(null);
                setLogin(false);
            }

        } catch (error) {
            console.error('Erro ao verificar token:', error);
            localStorage.removeItem('token');
            setUser(null);
            setLogin(false);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (!login) {
            setNotifications([]);
            setUnreadNotificationsCount(0);
            return;
        }
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
            setUnreadNotificationsCount(response.data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
            setNotifications([]);
            setUnreadNotificationsCount(0);
        }
    }, [login]);

    const markNotificationsAsRead = useCallback(async (notificationIds) => {
        if (!login || notificationIds.length === 0) return { success: false, message: "Nenhum ID fornecido ou não logado." };
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/notifications/mark-read-batch`, { notificationIds }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev =>
                prev.map(n => notificationIds.includes(n.id) ? { ...n, read: true } : n)
            );
            setUnreadNotificationsCount(prev => prev - notificationIds.length);
            return { success: true, message: 'Notificações marcadas como lidas.' };
        } catch (error) {
            console.error('Erro ao marcar notificações como lidas:', error);
            return { success: false, message: 'Erro ao marcar notificações como lidas.' };
        }
    }, [login]);

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setLogin(false);
        setIsInBetQueue(false);
        setCurrentBetId(null);
        setIsInMediationQueue(false);
        setCurrentMatch(null); // Resetar currentMatch no logout
        setNotifications([]);
        setUnreadNotificationsCount(0);
    };

    const joinBetQueue = async (betAmount, modality, platform) => {
        if (!user || !login) {
            console.error("Usuário não logado para entrar na fila de apostas.");
            return { success: false, message: "Usuário não logado." };
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/matchmaking/bets/join-queue`,
                { betAmount, modality, platform },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Sempre busca o usuário para atualizar o saldo e status da fila
            fetchUser();

            if (res.status === 200 || res.status === 202) {
                setIsInBetQueue(true);
                setCurrentBetId(res.data.betId || null);
                if (res.data.matchId) {
                    // Se um match foi encontrado, define o currentMatch
                    setCurrentMatch({
                        id: res.data.matchId,
                        player1: res.data.player1,
                        player2: res.data.player2,
                        mediator: res.data.mediator,
                        chatRoomId: res.data.chatRoomId,
                        status: res.data.status,
                    });
                    return { success: true, message: res.data.message, match: res.data };
                }
                return { success: true, message: res.data.message, betId: res.data.betId, status: res.data.status };
            }
        } catch (error) {
            console.error('Erro ao entrar na fila de apostas:', error.response?.data || error.message);
            fetchUser(); // Tenta buscar o usuário mesmo em erro para atualizar saldo
            setIsInBetQueue(false);
            setCurrentBetId(null);
            setCurrentMatch(null); // Limpa currentMatch em caso de erro ao entrar na fila
            return { success: false, message: error.response?.data?.message || 'Erro ao entrar na fila.' };
        }
    };

    const joinMediationQueue = async () => {
        if (!user || !login || !user.isAdmin) {
            return { success: false, message: "Você precisa ser um administrador logado para mediar." };
        }
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/matchmaking/mediation/join-queue`, {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchUser(); // Atualiza o status do usuário

            if (res.status === 200 || res.status === 202) {
                setIsInMediationQueue(true);
                // Se um match for atribuído ao mediador imediatamente
                if (res.data.matchId) {
                    setCurrentMatch({
                        id: res.data.matchId,
                        player1: res.data.player1,
                        player2: res.data.player2,
                        mediator: res.data.mediator,
                        chatRoomId: res.data.chatRoomId,
                        status: res.data.status,
                    });
                    return { success: true, message: res.data.message, match: res.data };
                }
                return { success: true, message: res.data.message };
            }
        } catch (error) {
            console.error('Erro ao entrar na fila de mediação:', error.response?.data || error.message);
            fetchUser();
            setIsInMediationQueue(false);
            setCurrentMatch(null); // Limpa currentMatch em caso de erro
            return { success: false, message: error.response?.data?.message || 'Erro ao entrar na fila de mediação.' };
        }
    };

    const leaveQueue = async (role) => {
        if (!user || !login) {
            return { success: false, message: "Usuário não logado." };
        }
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/queue/leave`, { role },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchUser(); // Atualiza o saldo e status do usuário
            setIsInBetQueue(false);
            setIsInMediationQueue(false);
            setCurrentBetId(null);
            setCurrentMatch(null); // **IMPORTANTE**: Limpa o currentMatch ao sair da fila
            return { success: true, message: res.data.message };
        } catch (error) {
            console.error('Erro ao sair da fila:', error.response?.data || error.message);
            fetchUser(); // Tenta buscar o usuário mesmo em erro
            return { success: false, message: error.response?.data?.message || 'Erro ao sair da fila.' };
        }
    };

    const getMatchDetails = async (matchId) => {
        if (!login) return null;
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/matchmaking/matches/${matchId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data;
        } catch (error) {
            console.error('Erro ao buscar detalhes da partida:', error.response?.data || error.message);
            return null;
        }
    };

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (login) {
            fetchNotifications();
        } else {
            setNotifications([]);
            setUnreadNotificationsCount(0);
        }
    }, [login, fetchNotifications]);

    return (
        <UserContext.Provider value={{
            user,
            login,
            loading,
            logout,
            fetchUser,
            isInBetQueue,
            currentBetId,
            isInMediationQueue,
            currentMatch,
            joinBetQueue,
            joinMediationQueue,
            leaveQueue,
            getMatchDetails,
            setCurrentMatch, // Expor setCurrentMatch para uso em outras lógicas, se necessário.
            notifications,
            unreadNotificationsCount,
            fetchNotifications,
            markNotificationsAsRead,
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;