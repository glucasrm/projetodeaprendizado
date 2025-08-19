// src/components/BetLimitNotification.jsx (NOVO COMPONENTE)

import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

const BetLimitNotification = ({ 
  isVisible, 
  onClose, 
  userType, 
  currentActive, 
  maxAllowed, 
  activeBets = [], 
  activeMatches = [],
  customMessage 
}) => {
  if (!isVisible) return null;

  const isAdmin = userType === 'admin';
  const displayMaxAllowed = isAdmin ? 'Ilimitado' : maxAllowed;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Limite de Apostas Atingido
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Mensagem principal */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-orange-800 text-sm">
              {customMessage || 'Você está no máximo de apostas no momento. Finalize sua aposta atual antes de entrar em uma nova fila.'}
            </p>
          </div>

          {/* Status do usuário */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 mb-2">Status da Conta</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo de usuário:</span>
                <span className={`font-medium ${isAdmin ? 'text-blue-600' : 'text-gray-900'}`}>
                  {isAdmin ? 'Administrador' : 'Jogador'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Apostas ativas:</span>
                <span className="font-medium text-gray-900">{currentActive}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Limite máximo:</span>
                <span className="font-medium text-gray-900">{displayMaxAllowed}</span>
              </div>
            </div>
          </div>

          {/* Lista de apostas ativas */}
          {(activeBets.length > 0 || activeMatches.length > 0) && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Suas Apostas Ativas</h4>
              
              {/* Apostas na fila */}
              {activeBets.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Na Fila de Espera</h5>
                  {activeBets.map((bet, index) => (
                    <div key={bet.id || index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-yellow-800">
                            {bet.gameSlug?.toUpperCase() || 'Jogo'}
                          </p>
                          <p className="text-xs text-yellow-600">
                            Valor: R$ {bet.betAmount?.toFixed(2) || '0.00'}
                          </p>
                          <p className="text-xs text-yellow-600">
                            Status: {bet.status === 'WAITING_OPPONENT' ? 'Aguardando oponente' : bet.status}
                          </p>
                        </div>
                        <div className="text-xs text-yellow-600">
                          {bet.createdAt && new Date(bet.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Partidas em andamento */}
              {activeMatches.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Partidas em Andamento</h5>
                  {activeMatches.map((match, index) => (
                    <div key={match.id || index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-blue-800">
                            {match.gameSlug?.toUpperCase() || 'Jogo'}
                          </p>
                          <p className="text-xs text-blue-600">
                            Valor: R$ {match.betAmount?.toFixed(2) || '0.00'}
                          </p>
                          <p className="text-xs text-blue-600">
                            Status: {
                              match.status === 'PENDING_CONFIRMATION' ? 'Aguardando confirmação' :
                              match.status === 'IN_PROGRESS' ? 'Em andamento' : match.status
                            }
                          </p>
                        </div>
                        <div className="text-xs text-blue-600">
                          {match.createdAt && new Date(match.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Informação adicional para administradores */}
          {isAdmin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-blue-800 text-xs">
                  Como administrador, você normalmente pode ter apostas ilimitadas. 
                  Se está vendo esta mensagem, pode haver um problema técnico.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetLimitNotification;

