// src/context/UserContext.js
import React, { createContext, useEffect, useState, useContext } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  // --- Novos estados para Matchmaking ---
  const [isInBetQueue, setIsInBetQueue] = useState(false);
  const [currentBetId, setCurrentBetId] = useState(null);
  const [isInMediationQueue, setIsInMediationQueue] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null); // Armazena dados do confronto ativo
  // ---

  const fetchUser = async () => {
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
          // --- Adicionado o saldo e o status de admin do usuário ---
          balance: res.data.balance, // Certifique-se que seu endpoint /api/profile retorna o balance
          isAdmin: res.data.isAdmin, // Certifique-se que seu endpoint /api/profile retorna o isAdmin
          // ---
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
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setLogin(false);
    // Limpar estados de matchmaking ao deslogar
    setIsInBetQueue(false);
    setCurrentBetId(null);
    setIsInMediationQueue(false);
    setCurrentMatch(null);
  };

  // --- Novas funções para Matchmaking ---

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

      // Atualiza o saldo do usuário após debitar a aposta (se bem-sucedido)
      if (res.data.status !== 'WAITING_OPPONENT') { // Se um oponente foi encontrado ou já foi matched
         // Assumindo que o backend já debitou o saldo
         // Se o backend não retornar o saldo atualizado, você pode re-chamar fetchUser()
         fetchUser();
      } else { // Se ainda está esperando oponente, o saldo já foi debitado
         fetchUser();
      }


      if (res.status === 200 || res.status === 202) {
        setIsInBetQueue(true);
        setCurrentBetId(res.data.betId || null); // Pode vir null se for um match direto
        // Se um confronto foi encontrado, salve-o e prepare para redirecionar
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
        return { success: true, message: res.data.message, betId: res.data.betId, status: res.data.status };
      }
    } catch (error) {
      console.error('Erro ao entrar na fila de apostas:', error.response?.data || error.message);
      // Caso haja erro, re-chamar fetchUser para garantir o saldo correto (estorno)
      fetchUser();
      setIsInBetQueue(false);
      setCurrentBetId(null);
      return { success: false, message: error.response?.data?.message || 'Erro ao entrar na fila.' };
    }
  };

  const joinMediationQueue = async () => {
    if (!user || !login || !user.isAdmin) {
      console.error("Usuário não autorizado a entrar na fila de mediação.");
      return { success: false, message: "Usuário não autorizado." };
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/matchmaking/mediation/join-queue`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        setIsInMediationQueue(true);
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      console.error('Erro ao entrar na fila de mediação:', error.response?.data || error.message);
      setIsInMediationQueue(false);
      return { success: false, message: error.response?.data?.message || 'Erro ao entrar na fila de mediação.' };
    }
  };

  const leaveQueue = async (role) => {
    if (!user || !login) {
      console.error("Usuário não logado para sair da fila.");
      return { success: false, message: "Usuário não logado." };
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/matchmaking/queue/leave`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        if (role === 'player') {
          setIsInBetQueue(false);
          setCurrentBetId(null);
          fetchUser(); // Recarrega o usuário para ver o saldo estornado
        } else if (role === 'mediator') {
          setIsInMediationQueue(false);
        }
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      console.error('Erro ao sair da fila:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Erro ao sair da fila.' };
    }
  };

  const getMatchDetails = async (matchId) => {
    if (!user || !login) {
      console.error("Usuário não logado para ver detalhes do confronto.");
      return null;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/matchmaking/matches/${matchId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        return res.data;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do confronto:', error.response?.data || error.message);
      return null;
    }
  };


  // ---

  return (
    <UserContext.Provider value={{
      user,
      login,
      loading,
      logout,
      fetchUser,
      // --- Novos valores no contexto ---
      isInBetQueue,
      currentBetId,
      isInMediationQueue,
      currentMatch,
      joinBetQueue,
      joinMediationQueue,
      leaveQueue,
      getMatchDetails,
      setCurrentMatch, // Permite que um componente externo defina o currentMatch se necessário
      // ---
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;