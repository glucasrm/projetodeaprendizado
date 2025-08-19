// src/pages/BetQueuePage.jsx (EXEMPLO COM LIMITAÇÃO DE APOSTAS)

import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import BetLimitNotification from '../../components/notificações/BetLimitNotification';
import { AlertTriangle, Users, Clock, DollarSign } from 'lucide-react';

const BetQueuePage = ({ gameSlug }) => {
  const { 
    user, 
    betStatus, 
    joinBetQueue, 
    leaveQueue, 
    getUserBetStatus,
    canJoinNewBet 
  } = useContext(UserContext);

  const [betAmount, setBetAmount] = useState('');
  const [modality, setModality] = useState('1v1');
  const [platform, setPlatform] = useState('PC');
  const [loading, setLoading] = useState(false);
  const [inQueue, setInQueue] = useState(false);
  const [message, setMessage] = useState('');
  const [showLimitNotification, setShowLimitNotification] = useState(false);
  const [limitNotificationData, setLimitNotificationData] = useState({});

  // Verificar status de apostas ao carregar a página
  useEffect(() => {
    if (user) {
      getUserBetStatus();
    }
  }, [user]);

  // Função para entrar na fila com verificação de limite
  const handleJoinQueue = async () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      setMessage('Por favor, insira um valor válido para a aposta.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await joinBetQueue(
        parseFloat(betAmount), 
        modality, 
        platform, 
        gameSlug
      );

      if (result.success) {
        setInQueue(true);
        setMessage('Você entrou na fila de apostas! Aguardando oponente...');
      } else {
        // Verificar se é erro de limite de apostas
        if (result.isLimitReached) {
          setLimitNotificationData({
            userType: result.userType,
            currentActive: result.currentActive,
            maxAllowed: result.maxAllowed,
            activeBets: result.details?.activeBets || [],
            activeMatches: result.details?.activeMatches || [],
            customMessage: result.message
          });
          setShowLimitNotification(true);
        } else {
          setMessage(result.message || 'Erro ao entrar na fila.');
        }
      }
    } catch (error) {
      console.error('Erro ao entrar na fila:', error);
      setMessage('Erro inesperado ao entrar na fila.');
    } finally {
      setLoading(false);
    }
  };

  // Função para sair da fila
  const handleLeaveQueue = async () => {
    setLoading(true);
    
    try {
      const result = await leaveQueue('player');
      
      if (result.success) {
        setInQueue(false);
        setMessage('Você saiu da fila de apostas.');
      } else {
        setMessage(result.message || 'Erro ao sair da fila.');
      }
    } catch (error) {
      console.error('Erro ao sair da fila:', error);
      setMessage('Erro inesperado ao sair da fila.');
    } finally {
      setLoading(false);
    }
  };

  // Verificar se pode entrar em nova aposta antes de mostrar o formulário
  const canShowJoinForm = () => {
    if (!betStatus) return true; // Se não carregou ainda, mostrar
    
    const isAdmin = betStatus.userType === 'admin';
    return isAdmin || betStatus.canJoinNewBet;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Fila de Apostas - {gameSlug?.toUpperCase()}
        </h1>
        <p className="text-gray-600">
          Entre na fila e aguarde um oponente para sua partida
        </p>
      </div>

      {/* Status do usuário */}
      {betStatus && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Status da Sua Conta</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Tipo:</span>
              <span className={`ml-2 font-medium ${betStatus.userType === 'admin' ? 'text-blue-600' : 'text-gray-900'}`}>
                {betStatus.userType === 'admin' ? 'Administrador' : 'Jogador'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Apostas ativas:</span>
              <span className="ml-2 font-medium text-gray-900">
                {betStatus.currentActive} / {betStatus.maxAllowed === 'unlimited' ? '∞' : betStatus.maxAllowed}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Aviso se não pode entrar em nova aposta */}
      {betStatus && !betStatus.canJoinNewBet && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-orange-800">Limite de Apostas Atingido</h4>
              <p className="text-orange-700 text-sm mt-1">
                Você já possui {betStatus.currentActive} aposta(s) ativa(s). 
                Finalize suas apostas atuais antes de entrar em uma nova fila.
              </p>
              <button
                onClick={() => {
                  setLimitNotificationData({
                    userType: betStatus.userType,
                    currentActive: betStatus.currentActive,
                    maxAllowed: betStatus.maxAllowed,
                    activeBets: betStatus.activeBets || [],
                    activeMatches: betStatus.activeMatches || []
                  });
                  setShowLimitNotification(true);
                }}
                className="text-orange-600 hover:text-orange-800 text-sm font-medium mt-2 underline"
              >
                Ver detalhes das apostas ativas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulário para entrar na fila */}
      {canShowJoinForm() && !inQueue && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Configurar Aposta</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor da Aposta (R$)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modalidade
              </label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1v1">1v1</option>
                <option value="2v2">2v2</option>
                <option value="5v5">5v5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plataforma
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PC">PC</option>
                <option value="PlayStation">PlayStation</option>
                <option value="Xbox">Xbox</option>
                <option value="Mobile">Mobile</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleJoinQueue}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Entrando na fila...</span>
              </>
            ) : (
              <>
                <Users className="h-4 w-4" />
                <span>Entrar na Fila</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Status na fila */}
      {inQueue && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Clock className="h-5 w-5 text-green-600 animate-pulse" />
            <h3 className="text-lg font-semibold text-green-800">Na Fila de Espera</h3>
          </div>
          <p className="text-green-700 mb-4">
            Aguardando um oponente para sua partida...
          </p>
          <button
            onClick={handleLeaveQueue}
            disabled={loading}
            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saindo...' : 'Sair da Fila'}
          </button>
        </div>
      )}

      {/* Mensagens */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('Erro') || message.includes('erro') 
            ? 'bg-red-50 border border-red-200 text-red-800' 
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          {message}
        </div>
      )}

      {/* Modal de limite de apostas */}
      <BetLimitNotification
        isVisible={showLimitNotification}
        onClose={() => setShowLimitNotification(false)}
        userType={limitNotificationData.userType}
        currentActive={limitNotificationData.currentActive}
        maxAllowed={limitNotificationData.maxAllowed}
        activeBets={limitNotificationData.activeBets}
        activeMatches={limitNotificationData.activeMatches}
        customMessage={limitNotificationData.customMessage}
      />
    </div>
  );
};

export default BetQueuePage;

