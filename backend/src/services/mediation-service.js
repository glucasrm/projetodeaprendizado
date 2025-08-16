// src/services/mediationService.js
// Serviço para integração com API de mediação

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class MediationService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Método auxiliar para fazer requisições
    async makeRequest(endpoint, options = {}) {
        const token = localStorage.getItem('authToken');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, finalOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro na requisição');
            }

            return {
                success: true,
                data,
                status: response.status,
            };
        } catch (error) {
            console.error('Erro na requisição:', error);
            return {
                success: false,
                error: error.message,
                status: error.status || 500,
            };
        }
    }

    // Entrar na fila de mediação
    async joinMediationQueue(userId, modalities, platforms) {
        return await this.makeRequest('/mediation/join-queue', {
            method: 'POST',
            body: JSON.stringify({
                userId,
                modalities,
                platforms,
                timestamp: new Date().toISOString(),
            }),
        });
    }

    // Sair da fila de mediação
    async leaveMediationQueue(userId) {
        return await this.makeRequest('/mediation/leave-queue', {
            method: 'POST',
            body: JSON.stringify({
                userId,
                timestamp: new Date().toISOString(),
            }),
        });
    }

    // Obter status da fila de mediação
    async getMediationQueueStatus(userId) {
        return await this.makeRequest(`/mediation/queue-status/${userId}`, {
            method: 'GET',
        });
    }

    // Aceitar mediação de uma partida
    async acceptMediation(mediatorId, matchId) {
        return await this.makeRequest('/mediation/accept', {
            method: 'POST',
            body: JSON.stringify({
                mediatorId,
                matchId,
                timestamp: new Date().toISOString(),
            }),
        });
    }

    // Finalizar mediação
    async completeMediation(mediatorId, matchId, result, notes = '') {
        return await this.makeRequest('/mediation/complete', {
            method: 'POST',
            body: JSON.stringify({
                mediatorId,
                matchId,
                result, // 'player1', 'player2', 'draw', 'cancelled'
                notes,
                timestamp: new Date().toISOString(),
            }),
        });
    }

    // Enviar mensagem no chat de mediação
    async sendMediationMessage(chatRoomId, senderId, message, messageType = 'mediator') {
        return await this.makeRequest('/mediation/send-message', {
            method: 'POST',
            body: JSON.stringify({
                chatRoomId,
                senderId,
                message,
                messageType,
                timestamp: new Date().toISOString(),
            }),
        });
    }

    // Obter histórico de mensagens do chat
    async getChatHistory(chatRoomId, limit = 50, offset = 0) {
        return await this.makeRequest(
            `/mediation/chat-history/${chatRoomId}?limit=${limit}&offset=${offset}`,
            {
                method: 'GET',
            }
        );
    }

    // Obter estatísticas do mediador
    async getMediatorStats(mediatorId) {
        return await this.makeRequest(`/mediation/stats/${mediatorId}`, {
            method: 'GET',
        });
    }

    // Reportar problema durante mediação
    async reportIssue(mediatorId, matchId, issueType, description) {
        return await this.makeRequest('/mediation/report-issue', {
            method: 'POST',
            body: JSON.stringify({
                mediatorId,
                matchId,
                issueType, // 'player_disconnect', 'cheating', 'dispute', 'technical'
                description,
                timestamp: new Date().toISOString(),
            }),
        });
    }

    // Obter lista de partidas disponíveis para mediação
    async getAvailableMatches(mediatorId, modalities = [], platforms = []) {
        const queryParams = new URLSearchParams();
        if (modalities.length > 0) {
            queryParams.append('modalities', modalities.join(','));
        }
        if (platforms.length > 0) {
            queryParams.append('platforms', platforms.join(','));
        }

        return await this.makeRequest(
            `/mediation/available-matches/${mediatorId}?${queryParams.toString()}`,
            {
                method: 'GET',
            }
        );
    }

    // Atualizar preferências de mediação
    async updateMediationPreferences(mediatorId, preferences) {
        return await this.makeRequest('/mediation/update-preferences', {
            method: 'PUT',
            body: JSON.stringify({
                mediatorId,
                preferences, // { modalities: [], platforms: [], availability: {} }
                timestamp: new Date().toISOString(),
            }),
        });
    }
}

// Instância singleton do serviço
const mediationService = new MediationService();

export default mediationService;

// Funções auxiliares para uso direto
export const mediationAPI = {
    joinQueue: (userId, modalities, platforms) => 
        mediationService.joinMediationQueue(userId, modalities, platforms),
    
    leaveQueue: (userId) => 
        mediationService.leaveMediationQueue(userId),
    
    getQueueStatus: (userId) => 
        mediationService.getMediationQueueStatus(userId),
    
    acceptMediation: (mediatorId, matchId) => 
        mediationService.acceptMediation(mediatorId, matchId),
    
    completeMediation: (mediatorId, matchId, result, notes) => 
        mediationService.completeMediation(mediatorId, matchId, result, notes),
    
    sendMessage: (chatRoomId, senderId, message, messageType) => 
        mediationService.sendMediationMessage(chatRoomId, senderId, message, messageType),
    
    getChatHistory: (chatRoomId, limit, offset) => 
        mediationService.getChatHistory(chatRoomId, limit, offset),
    
    getMediatorStats: (mediatorId) => 
        mediationService.getMediatorStats(mediatorId),
    
    reportIssue: (mediatorId, matchId, issueType, description) => 
        mediationService.reportIssue(mediatorId, matchId, issueType, description),
    
    getAvailableMatches: (mediatorId, modalities, platforms) => 
        mediationService.getAvailableMatches(mediatorId, modalities, platforms),
    
    updatePreferences: (mediatorId, preferences) => 
        mediationService.updateMediationPreferences(mediatorId, preferences),
};
