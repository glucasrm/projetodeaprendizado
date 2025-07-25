// src/components/MediationDashboard.jsx (Exemplo)
import React, { useContext, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const MediationDashboard = () => {
  const { user, login, loading, isInMediationQueue, joinMediationQueue, leaveQueue } = useContext(UserContext);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!login || !user || !user.isAdmin) {
    return <p>Acesso negado. Você não tem permissão para acessar o painel de mediação.</p>;
  }

  const handleJoinMediation = async () => {
    setMessage('');
    setError('');
    const result = await joinMediationQueue();
    if (result.success) {
      setMessage(result.message);
    } else {
      setError(result.message);
    }
  };

  const handleLeaveMediation = async () => {
    setMessage('');
    setError('');
    const result = await leaveQueue('mediator');
    if (result.success) {
      setMessage(result.message);
    } else {
      setError(result.message);
    }
  };

  return (
    <div>
      <h2>Painel de Mediação</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {isInMediationQueue ? (
        <div>
          <p>Você está disponível para mediação. Aguardando um confronto...</p>
          <button onClick={handleLeaveMediation}>Sair da Fila de Mediação</button>
        </div>
      ) : (
        <button onClick={handleJoinMediation}>Entrar na Fila de Mediação</button>
      )}

      {/* Aqui você listaria os confrontos que o mediador precisa agir */}
      {/* Ex: Poderia ter uma rota para buscar confrontos pendentes para o mediador */}
      <h3>Confrontos Atribuídos a Você:</h3>
      <p>(Funcionalidade a ser implementada)</p>
    </div>
  );
};

export default MediationDashboard;