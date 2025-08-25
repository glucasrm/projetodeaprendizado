// src/context/UserContext.jsx (VERSÃO MODIFICADA COM CONFIRMAÇÃO)

import React, { createContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [login, setLogin] = useState(false);
    const [loading, setLoading] = useState(true);

    const [isInBetQueue, setIsInBetQueue] = useState(false);
    const [currentBetId, setCurrentBetId] = useState(null);
    
    // --- Mediação ---
    const [isInMediationQueue, setIsInMediationQueue] = useState(false);
    const [currentMatch, setCurrentMatch] = useState(null); 
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

     //status
      const [betStatus, setBetStatus] = useState(null); // Estado para status de apostas

    // --- Notificações ---
    const [notifications, setNotifications] = useState([]);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

    const [conversations, setConversations] = useState([]);

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
            setUnreadNotificationsCount(prev => Math.max(0, prev - notificationIds.length));
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
        setCurrentMatch(null); 
        setNotifications([]);
        setUnreadNotificationsCount(0);
        setMediationPreferences({ modalities: [], platforms: [] });
        setMediationStats({ totalMediations: 0, successfulMediations: 0, rating: 0, totalEarnings: 0 });
    };

    // NOVA FUNÇÃO: Confirmar participação na partida
    const confirmMatch = async (matchId) => {
        if (!user || !login) {
            return { success: false, message: "Usuário não logado." };
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/matchmaking/matches/${matchId}/confirm`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.status === 200) {
                // Atualizar os dados da partida atual
                const updatedMatchData = await getMatchDetails(matchId);
                if (updatedMatchData?.success && updatedMatchData.match) {
                    setCurrentMatch(updatedMatchData.match);
                }

                // Se a partida foi iniciada, sair das filas
                if (res.data.matchStarted) {
                    setIsInBetQueue(false);
                    setIsInMediationQueue(false);
                    setCurrentBetId(null);
                }

                return { success: true, message: res.data.message, matchStarted: res.data.matchStarted };
            }
        } catch (error) {
            console.error('Erro ao confirmar partida:', error.response?.data || error.message);
            return { success: false, message: error.response?.data?.message || 'Erro ao confirmar partida.' };
        }
    };

 // FUNÇÃO MODIFICADA: Cancelar partida com atualização de status
        const cancelMatch = async (matchId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/matchmaking/matches/${matchId}/cancel`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Atualizar status de apostas após cancelar partida
            if (response.data.success) {
                await getUserBetStatus();
            }

            return response.data;
        } catch (error) {
            console.error('Erro ao cancelar partida:', error);
            return { success: false, message: 'Erro ao cancelar partida.' };
        }
    };

    // NOVA FUNÇÃO: Verificar status de apostas do usuário
    const getUserBetStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token não encontrado');
                return null;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/matchmaking/bets/status`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data.success) {
                setBetStatus(response.data);
                return response.data;
            } else {
                console.error('Erro ao obter status de apostas:', response.data.message);
                return null;
            }
        } catch (error) {
            console.error('Erro ao obter status de apostas:', error);
            return null;
        }
    };

    // NOVA FUNÇÃO: Verificar se pode entrar em nova aposta
    const canJoinNewBet = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { success: false, canJoin: false, reason: 'Usuário não autenticado' };
            }

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/matchmaking/bets/can-join`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error('Erro ao verificar se pode entrar em nova aposta:', error);
            return { success: false, canJoin: false, reason: 'Erro de conexão' };
        }
    };

    // NOVA FUNÇÃO: Verificar status específico da fila para um jogo
    const getQueueStatus = async (gameSlug) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { success: false, inQueue: false, reason: 'Usuário não autenticado' };
            }

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/matchmaking/queue/status`,
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    params: { gameSlug }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Erro ao verificar status da fila:', error);
            return { success: false, inQueue: false, reason: 'Erro de conexão' };
        }
    };


     // FUNÇÃO MODIFICADA: Entrar na fila de apostas com verificação de limite
    const joinBetQueue = async (betAmount, modality, platform, gameSlug) => {
        try {
            // Primeiro, verificar se pode entrar em nova aposta
            const canJoinResult = await canJoinNewBet();
            
            if (!canJoinResult.success || !canJoinResult.canJoin) {
                return {
                    success: false,
                    message: canJoinResult.reason || 'Você não pode entrar em uma nova aposta no momento.',
                    isLimitReached: true,
                    userType: canJoinResult.userType,
                    currentActive: canJoinResult.currentActive,
                    maxAllowed: canJoinResult.maxAllowed
                };
            }

            // Se pode entrar, fazer a requisição
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/matchmaking/bets/join-queue`,
                { betAmount, modality, platform, gameSlug },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Atualizar status de apostas após entrar na fila
            if (response.data.success) {
                await getUserBetStatus();
            }

            return response.data;
        } catch (error) {
            console.error('Erro ao entrar na fila de apostas:', error);
            
            // Se for erro 409 (Conflict), é limite de apostas
            if (error.response?.status === 409) {
                return {
                    success: false,
                    message: error.response.data.message || 'Você está no máximo de apostas no momento.',
                    isLimitReached: true,
                    details: error.response.data.details
                };
            }
            
            return { 
                success: false, 
                message: 'Erro ao entrar na fila de apostas.' 
            };
        }
    };


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
                { modalities, platforms },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchUser(); 

            if (res.status === 200 || res.status === 202) {
                setIsInMediationQueue(true);
                setMediationPreferences({ modalities, platforms }); 
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
 // FUNÇÃO MODIFICADA: Sair da fila com atualização de status
    const leaveQueue = async (role) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/matchmaking/queue/leave`,
                { role },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Atualizar status de apostas após sair da fila
            if (response.data.success && role === 'player') {
                await getUserBetStatus();
            }

            return response.data;
        } catch (error) {
            console.error('Erro ao sair da fila:', error);
            return { success: false, message: 'Erro ao sair da fila.' };
        }
    };

// FUNÇÃO MODIFICADA: Finalizar mediação com atualização de status
    const completeMediation = async (matchId, result, statistics = {}) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/matchmaking/mediation/complete`,
                { 
                    matchId, 
                    result,
                    statistics
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Atualizar status de apostas após finalizar partida
            if (response.data.success) {
                await getUserBetStatus();
            }

            return response.data;
        } catch (error) {
            console.error('Erro ao finalizar mediação:', error);
            return { success: false, message: 'Erro ao finalizar mediação.' };
        }
    };


    // NOVA FUNÇÃO: Buscar estatísticas do usuário logado
    const getMyStatistics = async (gameSlug = null) => {
        try {
            const token = localStorage.getItem('token');
            const url = gameSlug 
                ? `${import.meta.env.VITE_API_URL}/api/matchmaking/statistics/me?gameSlug=${gameSlug}`
                : `${import.meta.env.VITE_API_URL}/api/matchmaking/statistics/me`;
            
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return { success: false, message: 'Erro ao buscar estatísticas.' };
        }
    };

    // NOVA FUNÇÃO: Buscar estatísticas de um jogador específico
    const getPlayerStatistics = async (userId, gameSlug = null) => {
        try {
            const token = localStorage.getItem('token');
            const url = gameSlug 
                ? `${import.meta.env.VITE_API_URL}/api/matchmaking/statistics/player/${userId}?gameSlug=${gameSlug}`
                : `${import.meta.env.VITE_API_URL}/api/matchmaking/statistics/player/${userId}`;
            
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar estatísticas do jogador:', error);
            return { success: false, message: 'Erro ao buscar estatísticas do jogador.' };
        }
    };

    // NOVA FUNÇÃO: Buscar histórico de partidas do usuário logado
    const getMyMatchHistory = async (gameSlug = null, limit = 20, offset = 0) => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (gameSlug) params.append('gameSlug', gameSlug);
            params.append('limit', limit.toString());
            params.append('offset', offset.toString());
            
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/matchmaking/matches/history/me?${params}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar histórico de partidas:', error);
            return { success: false, message: 'Erro ao buscar histórico de partidas.' };
        }
    };

    // NOVA FUNÇÃO: Buscar histórico de partidas de um jogador específico
    const getPlayerMatchHistory = async (userId, gameSlug = null, limit = 20, offset = 0) => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (gameSlug) params.append('gameSlug', gameSlug);
            params.append('limit', limit.toString());
            params.append('offset', offset.toString());
            
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/matchmaking/matches/history/player/${userId}?${params}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar histórico do jogador:', error);
            return { success: false, message: 'Erro ao buscar histórico do jogador.' };
        }
    };

    // NOVA FUNÇÃO: Buscar ranking de jogadores
    const getPlayersRanking = async (gameSlug, sortBy = 'winRate', limit = 50, offset = 0) => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            params.append('gameSlug', gameSlug);
            params.append('sortBy', sortBy);
            params.append('limit', limit.toString());
            params.append('offset', offset.toString());
            
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/matchmaking/ranking?${params}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar ranking:', error);
            return { success: false, message: 'Erro ao buscar ranking.' };
        }
    };

    // NOVA FUNÇÃO: Buscar estatísticas detalhadas de uma partida
    const getMatchStatistics = async (matchId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/matchmaking/matches/${matchId}/statistics`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar estatísticas da partida:', error);
            return { success: false, message: 'Erro ao buscar estatísticas da partida.' };
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

    const fetchConversations = useCallback(async () => {
    if (!login) {
        setConversations([]);
        return;
    }
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/matchmaking/conversations`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
            setConversations(response.data.conversations);
        }
    } catch (error) {
        console.error('Erro ao buscar conversas:', error);
        setConversations([]);
    }
}, [login]);


    const updateMediationStats = (newStats) => {
        setMediationStats(prev => ({
            ...prev,
            ...newStats
        }));
    };

    // --- pooling de notificações ---
    useEffect(() => {
    if (login) {
        const interval = setInterval(() => {
            fetchNotifications();
            fetchConversations();
        }, 10000);
        return () => clearInterval(interval);
    }
}, [login, fetchNotifications, fetchConversations]);

    // --- reação a notificações de partida ---
    useEffect(() => {
    // Só executa se houver notificações novas
    if (notifications.length === 0) return;

    const unreadMatchNotification = notifications.find(n => 
        !n.read && 
        n.matchId && // Garante que a notificação tem um matchId
        (n.type === 'match_found_player' || n.type === 'match_assigned_mediator')
    );

    if (unreadMatchNotification) {
        console.log('🔔 Notificação de partida não lida encontrada:', unreadMatchNotification);
        
        getMatchDetails(unreadMatchNotification.matchId).then(matchData => {
            // Se a busca foi bem sucedida E a partida ainda está ativa
            if (matchData?.success && ['PENDING_CONFIRMATION', 'IN_PROGRESS'].includes(matchData.match.status)) {
                console.log('✅ Partida ativa encontrada, definindo como partida atual:', matchData.match);
                setCurrentMatch(matchData.match);
                
                // Limpa o estado da fila correspondente
                if (unreadMatchNotification.type === 'match_found_player') {
                    setIsInBetQueue(false);
                } else if (unreadMatchNotification.type === 'match_assigned_mediator') {
                    setIsInMediationQueue(false);
                }
                
                // Marca a notificação como lida para não processar de novo
                markNotificationsAsRead([unreadMatchNotification.id]);
            } else {
                console.log('☑️ Notificação de partida encontrada, mas a partida não está mais ativa ou não foi encontrada. Ignorando.');
            }
        });
    }
}, [notifications, getMatchDetails, markNotificationsAsRead]);

   // Efeito principal para buscar dados essenciais após o login
useEffect(() => {
    const loadInitialData = async () => {
        if (login) {
            console.log("✅ [Context] Usuário logado. Buscando dados iniciais...");
            // Busca notificações e conversas em paralelo para mais performance
            await Promise.all([
                fetchNotifications(),
                fetchConversations()
            ]);
        } else {
            console.log("☑️ [Context] Usuário não logado. Limpando dados.");
            // Limpa os estados se o usuário deslogar
            setNotifications([]);
            setUnreadNotificationsCount(0);
            setConversations([]);
        }
    };

    loadInitialData();
}, [login, fetchNotifications, fetchConversations]); // Depende do login e das funções de fetch

// Efeito para o polling (atualização periódica)
useEffect(() => {
    if (login) {
        console.log("🔄 [Context] Iniciando polling a cada 15 segundos.");
        const interval = setInterval(() => {
            console.log("🔄 [Polling] Buscando notificações e conversas...");
            fetchNotifications();
            fetchConversations();
        }, 15000); // Aumentado para 15s para reduzir carga no servidor
        
        // Limpa o intervalo quando o componente desmonta ou o usuário desloga
        return () => {
            console.log("🛑 [Context] Parando polling.");
            clearInterval(interval);
        };
    }
}, [login, fetchNotifications, fetchConversations]);

// Efeito para buscar o usuário ao carregar o provedor (só roda uma vez)
useEffect(() => {
    console.log("🚀 [Context] UserProvider montado. Verificando token...");
    fetchUser();
}, [fetchUser]); // fetchUser é um useCallback, então não causa re-renderizações desnecessárias


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
            mediationPreferences,
            mediationStats,
            completeMediation,
            updateMediationStats,
            conversations,
            fetchConversations,
            // NOVAS FUNÇÕES ADICIONADAS
            confirmMatch,
            cancelMatch,
             getMyStatistics,
            getPlayerStatistics,
            getMyMatchHistory,
            getPlayerMatchHistory,
            getPlayersRanking,
            getMatchStatistics,
             getUserBetStatus,
            betStatus,
            canJoinNewBet,
            
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;

