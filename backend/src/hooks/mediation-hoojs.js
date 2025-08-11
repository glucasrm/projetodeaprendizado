// src/hooks/useMediationHooks.js
// Hooks customizados para funcionalidades de mediação

import { useState, useEffect, useCallback, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { mediationAPI } from '../services/mediationService';

// Hook para gerenciar fila de mediação
export const useMediationQueue = () => {
    const { user, isInMediationQueue, setIsInMediationQueue } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [queuePosition, setQueuePosition] = useState(null);

    // Entrar na fila de mediação
    const joinQueue = useCallback(async (modalities, platforms) => {
        if (!user?.id) {
            setError('Usuário não autenticado');
            return { success: false, message: 'Usuário não autenticado' };
        }

        setLoading(true);
        setError(null);

        try {
            const result = await mediationAPI.joinQueue(user.id, modalities, platforms);
            
            if (result.success) {
                setIsInMediationQueue(true);
                return { success: true, message: 'Entrou na fila de mediação com sucesso!' };
            } else {
                setError(result.error);
                return { success: false, message: result.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    }, [user?.id, setIsInMediationQueue]);

    // Sair da fila de mediação
    const leaveQueue = useCallback(async () => {
        if (!user?.id) {
            setError('Usuário não autenticado');
            return { success: false, message: 'Usuário não autenticado' };
        }

        setLoading(true);
        setError(null);

        try {
            const result = await mediationAPI.leaveQueue(user.id);
            
            if (result.success) {
                setIsInMediationQueue(false);
                setQueuePosition(null);
                return { success: true, message: 'Saiu da fila de mediação' };
            } else {
                setError(result.error);
                return { success: false, message: result.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    }, [user?.id, setIsInMediationQueue]);

    // Verificar status da fila
    const checkQueueStatus = useCallback(async () => {
        if (!user?.id || !isInMediationQueue) return;

        try {
            const result = await mediationAPI.getQueueStatus(user.id);
            if (result.success) {
                setQueuePosition(result.data.position);
            }
        } catch (err) {
            console.error('Erro ao verificar status da fila:', err);
        }
    }, [user?.id, isInMediationQueue]);

    // Verificar status periodicamente quando na fila
    useEffect(() => {
        if (isInMediationQueue) {
            const interval = setInterval(checkQueueStatus, 5000); // Verifica a cada 5 segundos
            return () => clearInterval(interval);
        }
    }, [isInMediationQueue, checkQueueStatus]);

    return {
        joinQueue,
        leaveQueue,
        checkQueueStatus,
        loading,
        error,
        queuePosition,
        isInQueue: isInMediationQueue,
    };
};

// Hook para gerenciar chat de mediação
export const useMediationChat = (chatRoomId) => {
    const { user } = useContext(UserContext);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Carregar histórico de mensagens
    const loadChatHistory = useCallback(async (limit = 50, offset = 0) => {
        if (!chatRoomId) return;

        setLoading(true);
        setError(null);

        try {
            const result = await mediationAPI.getChatHistory(chatRoomId, limit, offset);
            
            if (result.success) {
                setMessages(result.data.messages || []);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [chatRoomId]);

    // Enviar mensagem
    const sendMessage = useCallback(async (message, messageType = 'mediator') => {
        if (!user?.id || !chatRoomId || !message.trim()) return;

        try {
            const result = await mediationAPI.sendMessage(
                chatRoomId,
                user.id,
                message.trim(),
                messageType
            );

            if (result.success) {
                // Adicionar mensagem localmente para feedback imediato
                const newMessage = {
                    id: Date.now(),
                    senderId: user.id,
                    senderName: user.username,
                    message: message.trim(),
                    messageType,
                    timestamp: new Date().toISOString(),
                };
                setMessages(prev => [...prev, newMessage]);
                return { success: true };
            } else {
                setError(result.error);
                return { success: false, message: result.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        }
    }, [user?.id, user?.username, chatRoomId]);

    // Carregar histórico quando o componente monta
    useEffect(() => {
        if (chatRoomId) {
            loadChatHistory();
        }
    }, [chatRoomId, loadChatHistory]);

    return {
        messages,
        sendMessage,
        loadChatHistory,
        loading,
        error,
    };
};

// Hook para gerenciar estatísticas do mediador
export const useMediatorStats = () => {
    const { user } = useContext(UserContext);
    const [stats, setStats] = useState({
        totalMediations: 0,
        successfulMediations: 0,
        rating: 0,
        totalEarnings: 0,
        averageTime: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Carregar estatísticas
    const loadStats = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            const result = await mediationAPI.getMediatorStats(user.id);
            
            if (result.success) {
                setStats(result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Carregar estatísticas quando o componente monta
    useEffect(() => {
        loadStats();
    }, [loadStats]);

    return {
        stats,
        loadStats,
        loading,
        error,
    };
};

// Hook para gerenciar partidas disponíveis para mediação
export const useAvailableMatches = () => {
    const { user } = useContext(UserContext);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Carregar partidas disponíveis
    const loadAvailableMatches = useCallback(async (modalities = [], platforms = []) => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            const result = await mediationAPI.getAvailableMatches(user.id, modalities, platforms);
            
            if (result.success) {
                setMatches(result.data.matches || []);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Aceitar mediação de uma partida
    const acceptMediation = useCallback(async (matchId) => {
        if (!user?.id) return { success: false, message: 'Usuário não autenticado' };

        try {
            const result = await mediationAPI.acceptMediation(user.id, matchId);
            
            if (result.success) {
                // Remover a partida da lista de disponíveis
                setMatches(prev => prev.filter(match => match.id !== matchId));
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, message: result.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        }
    }, [user?.id]);

    return {
        matches,
        loadAvailableMatches,
        acceptMediation,
        loading,
        error,
    };
};

// Hook para finalizar mediação
export const useCompleteMediation = () => {
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const completeMediation = useCallback(async (matchId, result, notes = '') => {
        if (!user?.id) return { success: false, message: 'Usuário não autenticado' };

        setLoading(true);
        setError(null);

        try {
            const response = await mediationAPI.completeMediation(user.id, matchId, result, notes);
            
            if (response.success) {
                return { 
                    success: true, 
                    message: 'Mediação finalizada com sucesso!',
                    data: response.data 
                };
            } else {
                setError(response.error);
                return { success: false, message: response.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    return {
        completeMediation,
        loading,
        error,
    };
};
