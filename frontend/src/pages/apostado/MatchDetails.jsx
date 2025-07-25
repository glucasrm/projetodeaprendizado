// src/pages/MatchDetails.jsx (Exemplo de nova página)
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const MatchDetails = () => {
  const { matchId } = useParams(); // Obtém o matchId da URL
  const { user, login, loading, getMatchDetails } = useContext(UserContext);
  const [matchData, setMatchData] = useState(null);
  const [matchLoading, setMatchLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatch = async () => {
      setMatchLoading(true);
      setError('');
      if (user && login && matchId) {
        const data = await getMatchDetails(matchId);
        if (data) {
          setMatchData(data);
        } else {
          setError('Não foi possível carregar os detalhes do confronto.');
        }
      }
      setMatchLoading(false);
    };

    if (!loading) { // Apenas tenta buscar se o UserContext já carregou
      fetchMatch();
    }
  }, [matchId, user, login, loading, getMatchDetails]);


  if (loading || matchLoading) {
    return <p>Carregando detalhes do confronto...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!matchData) {
    return <p>Nenhum confronto encontrado ou acesso não autorizado.</p>;
  }

  return (
    <div>
      <h2>Confronto #{matchData.id.substring(0, 8)}...</h2>
      <p>Status: <strong>{matchData.status}</strong></p>
      <p>Modalidade: {matchData.modality}</p>
      <p>Plataforma: {matchData.platform}</p>
      <p>Valor da Aposta: R$ {parseFloat(matchData.betAmount).toFixed(2)}</p>

      <h3>Jogadores:</h3>
      <p>Jogador 1: {matchData.player1.username} (ID: {matchData.player1.id.substring(0, 8)}...)</p>
      <p>Jogador 2: {matchData.player2.username} (ID: {matchData.player2.id.substring(0, 8)}...)</p>

     {matchData.mediator && (
  <> {/* <-- Adicione um Fragmento React aqui */}
    <h3>Mediador:</h3>
    {/* Verifique se mediator e mediator.username existem antes de acessá-los */}
    <p>Mediador: {matchData.mediator.username} (ID: {matchData.mediator.id.substring(0, 8)}...)</p>
  </> 
)}

      {/* Seção do Chat (Implementação futura com WebSockets) */}
      <h3>Chat do Confronto:</h3>
      <div style={{ border: '1px solid gray', padding: '10px', height: '300px', overflowY: 'scroll' }}>
        <p>Chat será implementado aqui. Conecte-se ao Socket.IO usando o chatRoomId: <strong>{matchData.chatRoomId}</strong></p>
        {/* Exemplo: <ChatRoom matchId={matchData.chatRoomId} /> */}
      </div>
      {/* Formulário para enviar mensagens */}
      {/* <form>...</form> */}
    </div>
  );
};

export default MatchDetails;