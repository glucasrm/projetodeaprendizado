// src/components/BettingForm.jsx (Exemplo)
import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom'; // Para redirecionar

const BettingForm = () => {
 const { user, login, loading, isInBetQueue, joinBetQueue, leaveQueue, currentMatch, setCurrentMatch } = useContext(UserContext);
  const navigate = useNavigate();

  const [betAmount, setBetAmount] = useState('');
  const [modality, setModality] = useState('1v1'); // Default
  const [platform, setPlatform] = useState('Mobile'); // Default
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Efeito para redirecionar quando um confronto é encontrado
  useEffect(() => {
    if (currentMatch && currentMatch.chatRoomId) {
      // Limpa o currentMatch do contexto para evitar redirecionamentos múltiplos
      // e permite que o componente de chat busque os detalhes da partida
      setCurrentMatch(null);
      navigate(`/confronto/${currentMatch.chatRoomId}`); // Redireciona para a tela do confronto/chat
    }
  }, [currentMatch, navigate, setCurrentMatch]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!user || !login) {
      setError('Você precisa estar logado para fazer uma aposta.');
      return;
    }

    const parsedBetAmount = parseFloat(betAmount);
    if (isNaN(parsedBetAmount) || parsedBetAmount <= 0) {
      setError('O valor da aposta deve ser um número positivo.');
      return;
    }
    if (user.balance < parsedBetAmount) {
        setError('Saldo insuficiente para esta aposta.');
        return;
    }


    const result = await joinBetQueue(parsedBetAmount, modality, platform);
    if (result.success) {
      setMessage(result.message);
      if (result.match) {
        // Já foi redirecionado pelo useEffect acima
      }
    } else {
      setError(result.message);
    }
  };

  const handleLeaveQueue = async () => {
    setMessage('');
    setError('');
    const result = await leaveQueue('player');
    if (result.success) {
      setMessage(result.message);
    } else {
      setError(result.message);
    }
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!login) {
    return <p>Por favor, faça login para acessar as apostas.</p>;
  }

  return (
    <div>
      <h2>Fazer uma Aposta Direta</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {user && <p>Seu Saldo: R$ {user.balance ? parseFloat(user.balance).toFixed(2) : '0.00'}</p>}

      {isInBetQueue ? (
        <div>
          <p>Você está na fila de espera para uma aposta. Aguardando oponente...</p>
          <button onClick={handleLeaveQueue}>Sair da Fila</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="betAmount">Valor da Aposta:</label>
            <input
              type="number"
              id="betAmount"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div>
            <label htmlFor="modality">Modalidade:</label>
            <select
              id="modality"
              value={modality}
              onChange={(e) => setModality(e.target.value)}
            >
              <option value="1v1">1x1</option>
              <option value="2v2">2x2</option>
              <option value="3v3">3x3</option>
              <option value="4v4">4x4</option>
            </select>
          </div>
          <div>
            <label htmlFor="platform">Plataforma:</label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="Mobile">Mobile</option>
              <option value="Emulador">Emulador</option>
            </select>
          </div>
          <button type="submit">Entrar na Fila</button>
        </form>
      )}
    </div>
  );
};

export default BettingForm;