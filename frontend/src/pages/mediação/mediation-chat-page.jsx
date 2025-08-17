// src/pages/mediação/mediation-chat-page.jsx (VERSÃO OTIMIZADA - CHAT LIBERADO + CARD COMPACTO)

import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';
import MessageBubble from '../../components/chat/MessageBubble';

const MediationChat = () => {
    const { chatRoomId } = useParams();
    const navigate = useNavigate();
    const { user, getMatchDetails, completeMediation, confirmMatch, cancelMatch } = useContext(UserContext);
    
    const [match, setMatch] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [matchResult, setMatchResult] = useState('');
    const [showResultForm, setShowResultForm] = useState(false);
    const messagesEndRef = useRef(null);

    // Estados para confirmação
    const [isConfirming, setIsConfirming] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);

    useEffect(() => {
        const fetchMatchData = async () => {
            if (!chatRoomId) { navigate('/games'); return; }
            setLoading(true);
            const matchData = await getMatchDetails(chatRoomId);
            if (matchData?.success && matchData.match) {
                setMatch(matchData.match);
                setMessages(matchData.match.conversation?.messages || []);
            } else {
                alert("Não foi possível carregar os dados da partida. Redirecionando...");
                navigate('/games');
            }
            setLoading(false);
        };
        fetchMatchData();
    }, [chatRoomId, getMatchDetails, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (newMessage.trim() === '' || !match) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/matchmaking/chat/send-message`, 
                { chatRoomId: match.id, content: newMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setMessages(prev => [...prev, response.data.message]);
                setNewMessage('');
            }
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            alert("Não foi possível enviar a mensagem.");
        }
    };

    const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

    const handleCompleteMediation = async () => {
        if (!matchResult || !match) { alert('Por favor, selecione o resultado da partida.'); return; }
        const result = await completeMediation(match.id, matchResult);
        if (result.success) { alert(`Mediação finalizada!`); navigate('/games'); } 
        else { alert(result.message); }
    };

    // FUNÇÃO: Confirmar participação
    const handleConfirmMatch = async () => {
        if (!match || isConfirming) return;
        
        setIsConfirming(true);
        try {
            const result = await confirmMatch(match.id);
            if (result.success) {
                // Atualizar os dados da partida
                const updatedMatchData = await getMatchDetails(match.id);
                if (updatedMatchData?.success && updatedMatchData.match) {
                    setMatch(updatedMatchData.match);
                }
                
                if (result.matchStarted) {
                    alert('Partida confirmada e iniciada! Boa sorte! 🎮');
                } else {
                    alert('Confirmação registrada! Aguardando outros participantes...');
                }
            } else {
                alert(result.message || 'Erro ao confirmar partida.');
            }
        } catch (error) {
            console.error('Erro ao confirmar partida:', error);
            alert('Erro ao confirmar partida.');
        } finally {
            setIsConfirming(false);
        }
    };

    // FUNÇÃO: Cancelar partida
    const handleCancelMatch = async () => {
        if (!match || isCanceling) return;
        
        const confirmCancel = window.confirm('Tem certeza que deseja cancelar esta partida? Você será retornado à fila.');
        if (!confirmCancel) return;
        
        setIsCanceling(true);
        try {
            const result = await cancelMatch(match.id);
            if (result.success) {
                alert(result.message);
                
                // Redirecionar baseado no tipo de usuário
                if (result.userType === 'mediator') {
                    navigate('/mediacao');
                } else if (result.gameSlug) {
                    navigate(`/games/${result.gameSlug}/fila`);
                } else {
                    navigate('/games');
                }
            } else {
                alert(result.message || 'Erro ao cancelar partida.');
            }
        } catch (error) {
            console.error('Erro ao cancelar partida:', error);
            alert('Erro ao cancelar partida.');
        } finally {
            setIsCanceling(false);
        }
    };

    // Função para verificar se o usuário já confirmou
    const hasUserConfirmed = () => {
        if (!match || !user) return false;
        
        if (match.player1Id === user.id) return match.player1Confirmed;
        if (match.player2Id === user.id) return match.player2Confirmed;
        if (match.mediatorId === user.id) return match.mediatorConfirmed;
        
        return false;
    };

    // Função para contar quantos confirmaram
    const getConfirmationCount = () => {
        if (!match) return { confirmed: 0, total: 3 };
        
        const confirmed = [
            match.player1Confirmed,
            match.player2Confirmed,
            match.mediatorConfirmed
        ].filter(Boolean).length;
        
        return { confirmed, total: 3 };
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-gray-900 text-white text-xl">Carregando sala da partida...</div>;
    }

    if (!match || !match.player1?.profile || !match.player2?.profile) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <p className="text-xl mb-4">Dados da partida estão incompletos. Redirecionando...</p>
                    <button onClick={() => navigate('/games')} className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg">Voltar</button>
                </div>
            </div>
        );
    }

    // Componente para exibir um participante no cabeçalho
    const ParticipantHeader = ({ player }) => (
        <Link to={`/perfil/${player.id}`} className="flex flex-col items-center group">
            <img 
                src={player.profile.avatar ? `${import.meta.env.VITE_API_URL}${player.profile.avatar}` : 'https://via.placeholder.com/150'} 
                alt={player.profile.username} 
                className="w-12 h-12 rounded-full border-2 border-gray-600 group-hover:border-purple-400 transition"
            />
            <span className="mt-1 text-sm font-bold group-hover:text-purple-400 transition">{player.profile.username}</span>
        </Link>
     );

    const confirmationCount = getConfirmationCount();
    const userConfirmed = hasUserConfirmed();

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            {/* Header Aprimorado */}
            <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
                <ParticipantHeader player={match.player1} />
                <div className="text-center">
                    <h1 className="text-xl font-bold text-purple-400">VS</h1>
                    <p className="text-sm text-gray-300">Aposta: R$ {parseFloat(match.betAmount).toFixed(2)}</p>
                    {match.status === 'PENDING_CONFIRMATION' && (
                        <p className="text-xs text-yellow-400 mt-1">
                            Confirmações: {confirmationCount.confirmed}/{confirmationCount.total}
                        </p>
                    )}
                </div>
                <ParticipantHeader player={match.player2} />
            </div>

            {/* ÁREA DE CONFIRMAÇÃO COMPACTA - Chat liberado para discussão das regras */}
            {match.status === 'PENDING_CONFIRMATION' && (
                <div className="bg-yellow-900/30 border-b border-yellow-600 p-2 text-center">
                    <h3 className="text-md font-bold text-yellow-400">⚠️ Confirmação Necessária</h3>
                    <p className="text-xs text-gray-300 mt-1">Discutam as regras no chat e confirmem quando estiverem de acordo</p>
                    
                    {/* Status de confirmação individual */}
                    <div className="flex justify-center space-x-4 mt-2 text-sm">
                        <div className={`flex items-center space-x-1 ${match.player1Confirmed ? 'text-green-400' : 'text-gray-400'}`}>
                            <span>{match.player1Confirmed ? '✅' : '⏳'}</span>
                            <span>{match.player1.profile.username}</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${match.player2Confirmed ? 'text-green-400' : 'text-gray-400'}`}>
                            <span>{match.player2Confirmed ? '✅' : '⏳'}</span>
                            <span>{match.player2.profile.username}</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${match.mediatorConfirmed ? 'text-green-400' : 'text-gray-400'}`}>
                            <span>{match.mediatorConfirmed ? '✅' : '⏳'}</span>
                            <span>{match.mediator.profile.username} (Mediador)</span>
                        </div>
                    </div>

                    {/* Botões de ação compactos */}
                    <div className="flex justify-center space-x-2 mt-3">
                        <button
                            onClick={handleConfirmMatch}
                            disabled={userConfirmed || isConfirming}
                            className={`px-4 py-1 rounded-lg font-medium text-sm transition duration-200 ${
                                userConfirmed 
                                    ? 'bg-green-600 text-white cursor-not-allowed' 
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                            } ${isConfirming ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isConfirming ? 'Confirmando...' : userConfirmed ? 'Confirmado ✅' : 'Confirmar'}
                        </button>
                        
                        <button
                            onClick={handleCancelMatch}
                            disabled={isCanceling}
                            className={`px-4 py-1 rounded-lg font-medium text-sm transition duration-200 bg-red-600 hover:bg-red-700 text-white ${
                                isCanceling ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isCanceling ? 'Cancelando...' : 'Cancelar'}
                        </button>
                    </div>
                </div>
            )}

            {/* Formulário de Resultado (apenas para mediadores e quando a partida estiver em progresso) */}
            {showResultForm && match.status === 'IN_PROGRESS' && user?.isAdmin && match.mediatorId === user.id && (
                <div className="bg-gray-800 p-4 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-purple-400 mb-3">Finalizar Mediação</h3>
                    <div className="flex items-center space-x-4">
                        <select
                            value={matchResult}
                            onChange={(e) => setMatchResult(e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        >
                            <option value="">Selecione o resultado</option>
                            <option value="player1_win">Vitória do {match.player1.profile.username}</option>
                            <option value="player2_win">Vitória do {match.player2.profile.username}</option>
                            <option value="draw">Empate</option>
                            <option value="cancelled">Cancelada</option>
                        </select>
                        <button
                            onClick={handleCompleteMediation}
                            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium"
                        >
                            Finalizar
                        </button>
                        <button
                            onClick={() => setShowResultForm(false)}
                            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-medium"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Área de Mensagens - SEMPRE DISPONÍVEL */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Mensagem automática para orientar sobre a confirmação */}
                {match.status === 'PENDING_CONFIRMATION' && messages.length === 0 && (
                    <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-3 text-center">
                        <p className="text-blue-300 text-sm">
                            💬 <strong>Chat liberado para discussão!</strong><br/>
                            Conversem sobre as regras da partida e confirmem quando estiverem de acordo.
                        </p>
                    </div>
                )}
                
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} currentUser={user} match={match} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Área de Input - SEMPRE HABILITADA */}
            <div className="bg-gray-800 p-4 border-t border-gray-700">
                {/* Botão para mostrar formulário de resultado (apenas para mediadores) */}
                {user?.isAdmin && match.mediatorId === user.id && match.status === 'IN_PROGRESS' && !showResultForm && (
                    <div className="mb-3">
                        <button
                            onClick={() => setShowResultForm(true)}
                            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium text-sm"
                        >
                            Finalizar Mediação
                        </button>
                    </div>
                )}
                
                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        onKeyPress={handleKeyPress} 
                        placeholder={match.status === 'PENDING_CONFIRMATION' ? 'Discutam as regras da partida...' : 'Digite sua mensagem...'}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button 
                        onClick={sendMessage} 
                        className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-medium transition duration-200"
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MediationChat;

