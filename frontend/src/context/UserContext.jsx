// src/context/UserContext.jsx (ATUALIZADO COM MEDIAÇÃO)
import React, { createContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [login, setLogin] = useState(false);
    const [loading, setLoading] = useState(true);

    const [isInBetQueue, setIsInBetQueue] = useState(false);
    const [currentBetId, setCurrentBetId] = useState(null);
    
    // Estados de mediação existentes no UserContext do usuário
    const [isInMediationQueue, setIsInMediationQueue] = useState(false);
    const [currentMatch, setCurrentMatch] = useState(null); 

    // --- NOVOS ESTADOS PARA NOTIFICAÇÕES ---
    const [notifications, setNotifications] = useState([]);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    // ---

    // --- NOVOS ESTADOS PARA MEDIAÇÃO (ADICIONADOS/AJUSTADOS) ---
    const [mediationPreferences, setMediationPreferences] = useState({
        modalities: [],
        platforms: []
    });
    const [mediationStats, setMediationStats] = useState({
        totalMediations: 0,
        successfulMediations: 0,
        rating: 0,
        totalEarnings: 0,
    });
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
        setMediationPreferences({ modalities: [], platforms: [] });
        setMediationStats({ totalMediations: 0, successfulMediations: 0, rating: 0, totalEarnings: 0 });
    };

    const joinBetQueue = async (betAmount, modality, platform, gameSlug) => {
        if (!user || !login) {
            return { success: false, message: "Usuário não logado." };
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/matchmaking/bets/join-queue`,
                { betAmount, modality, platform, gameSlug },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchUser();

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
                }

                return { success: true, message: res.data.message, ...res.data };
            }
        } catch (error) {
            console.error('Erro ao entrar na fila de apostas:', error.response?.data || error.message);
            fetchUser();
            setIsInBetQueue(false);
            setCurrentBetId(null);
            setCurrentMatch(null);
            return { success: false, message: error.response?.data?.message || 'Erro ao entrar na fila.' };
        }
    };

    // Função joinMediationQueue atualizada para aceitar modalidades e plataformas
    const joinMediationQueue = async (modalities, platforms) => {
        if (!user || !login || !user.isAdmin) {
            return { success: false, message: "Você precisa ser um administrador logado para mediar." };
        }
        if (!modalities || modalities.length === 0 || !platforms || platforms.length === 0) {
            return { success: false, message: "Selecione pelo menos uma modalidade e uma plataforma para mediar." };
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/matchmaking/mediation/join-queue`, 
                { modalities, platforms }, // Enviando modalidades e plataformas
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchUser(); 

            if (res.status === 200 || res.status === 202) {
                setIsInMediationQueue(true);
                setMediationPreferences({ modalities, platforms }); // Salva as preferências
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
            setCurrentMatch(null); 
            return { success: false, message: error.response?.data?.message || 'Erro ao entrar na fila de mediação.' };
        }
    };

    // Função leaveQueue atualizada para aceitar o tipo de fila
    const leaveQueue = async (role) => {
        if (!user || !login) {
            return { success: false, message: "Usuário não logado." };
        }
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/queue/leave`, { role },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchUser(); 
            if (role === 'player') {
                setIsInBetQueue(false);
                setCurrentBetId(null);
            } else if (role === 'mediator') {
                setIsInMediationQueue(false);
                setMediationPreferences({ modalities: [], platforms: [] });
            }
            setCurrentMatch(null); 
            return { success: true, message: res.data.message };
        } catch (error) {
            console.error('Erro ao sair da fila:', error.response?.data || error.message);
            fetchUser(); 
            return { success: false, message: error.response?.data?.message || 'Erro ao sair da fila.' };
        }
    };

    // Nova função para finalizar mediação
    const completeMediation = async (matchId, result) => {
        if (!user || !login || !user.isAdmin) {
            return { success: false, message: "Você não tem permissão para finalizar mediações." };
        }
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/mediation/complete`, 
                { matchId, result, mediatorId: user.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchUser(); // Atualiza o saldo e estatísticas do usuário
            setMediationStats(prev => ({
                ...prev,
                totalMediations: prev.totalMediations + 1,
                successfulMediations: result !== 'cancelled' ? prev.successfulMediations + 1 : prev.successfulMediations,
                totalEarnings: prev.totalEarnings + (res.data.reward || 0)
            }));
            setCurrentMatch(null); // Limpa a partida atual após a finalização
            return { success: true, message: res.data.message, reward: res.data.reward };
        } catch (error) {
            console.error('Erro ao finalizar mediação:', error.response?.data || error.message);
            return { success: false, message: error.response?.data?.message || 'Erro ao finalizar mediação.' };
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

    // Função para atualizar estatísticas de mediação (pode ser chamada pelo backend ou manualmente)
    const updateMediationStats = (newStats) => {
        setMediationStats(prev => ({
            ...prev,
            ...newStats
        }));
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
            setCurrentMatch, 
            notifications,
            unreadNotificationsCount,
            fetchNotifications,
            markNotificationsAsRead,
            // Novos valores para mediação
            mediationPreferences,
            mediationStats,
            completeMediation,
            updateMediationStats,
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
