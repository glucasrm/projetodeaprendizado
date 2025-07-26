// src/context/UserContext.js
import React, { createContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios'; // Mantenha axios. Se você usa axios.create em outro lugar, pode ser axios

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [login, setLogin] = useState(false);
    const [loading, setLoading] = useState(true);

    const [isInBetQueue, setIsInBetQueue] = useState(false);
    const [currentBetId, setCurrentBetId] = useState(null);
    const [isInMediationQueue, setIsInMediationQueue] = useState(false);
    const [currentMatch, setCurrentMatch] = useState(null);

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
    }, []); // Dependências ajustadas para useCallback

    // --- NOVAS FUNÇÕES DE NOTIFICAÇÃO ---
    const fetchNotifications = useCallback(async () => {
        if (!login) { // Só busca se o usuário estiver logado
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
    }, [login]); // Dependências: apenas 'login'

    const markNotificationsAsRead = useCallback(async (notificationIds) => {
    if (!login || notificationIds.length === 0) return { success: false, message: "Nenhum ID fornecido ou não logado." };
    const token = localStorage.getItem('token');
    try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/notifications/mark-read-batch`, { notificationIds }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Atualiza o estado local para refletir que foram lidas
        setNotifications(prev =>
            prev.map(n => notificationIds.includes(n.id) ? { ...n, read: true } : n)
        );
        setUnreadNotificationsCount(prev => prev - notificationIds.length); // Decrementa o contador
        return { success: true, message: 'Notificações marcadas como lidas.' };
    } catch (error) {
        console.error('Erro ao marcar notificações como lidas:', error);
        return { success: false, message: 'Erro ao marcar notificações como lidas.' };
    }
}, [login]); // Dependências: 'login'


    // --- FIM NOVAS FUNÇÕES DE NOTIFICAÇÃO ---

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setLogin(false);
        setIsInBetQueue(false);
        setCurrentBetId(null);
        setIsInMediationQueue(false);
        setCurrentMatch(null);
        // Limpar estados de notificação também
        setNotifications([]);
        setUnreadNotificationsCount(0);
    };

    // ... (suas funções joinBetQueue, joinMediationQueue, leaveQueue, getMatchDetails - sem alterações aqui) ...
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

            if (res.data.status !== 'WAITING_OPPONENT') {
                fetchUser();
            } else {
                fetchUser();
            }

            if (res.status === 200 || res.status === 202) {
                setIsInBetQueue(true);
                setCurrentBetId(res.data.betId || null);
                if (res.data.matchId) {
                    setCurrentMatch({
                        id: res.data.matchId,
                        player1: res.data.player1,
                        player2: res.data.player2,
                        mediator: res.data.mediator,
                        chatRoomId: res.data.chatRoomId,
                        status: res.data.status,
                    });
                    // Opcional: Criar uma notificação no frontend ou acionar o backend para criar uma
                    // fetchNotifications(); // Se o backend gerar uma notificação de match_found
                    return { success: true, message: res.data.message, match: res.data };
                }
                return { success: true, message: res.data.message, betId: res.data.betId, status: res.data.status };
            }
        } catch (error) {
            console.error('Erro ao entrar na fila de apostas:', error.response?.data || error.message);
            fetchUser();
            setIsInBetQueue(false);
            setCurrentBetId(null);
            return { success: false, message: error.response?.data?.message || 'Erro ao entrar na fila.' };
        }
    };

    const joinMediationQueue = async () => { /* ... sua lógica ... */ };
    const leaveQueue = async (role) => { /* ... sua lógica ... */ };
    const getMatchDetails = async (matchId) => { /* ... sua lógica ... */ };


    // Efeito para buscar usuário na montagem e para notificação
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Novo useEffect para buscar notificações quando o login ou user mudar
    useEffect(() => {
        if (login) {
            fetchNotifications();
            // Opcional: polling ou WebSocket para notificações em tempo real
            // const interval = setInterval(fetchNotifications, 60000); // Ex: a cada 60 segundos
            // return () => clearInterval(interval);
        } else {
             // Limpa notificações se deslogado
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
            setCurrentMatch,
            // --- Novos valores expostos no contexto ---
            notifications,
            unreadNotificationsCount,
            fetchNotifications, // Expor para componentes que precisam recarregar
            markNotificationsAsRead,
            // ---
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;