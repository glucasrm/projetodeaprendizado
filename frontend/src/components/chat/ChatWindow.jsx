import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';
import MessageBubble from './MessageBubble'; // O seu MessageBubble.jsx existente

// Este componente recebe o ID do chat a ser exibido como uma prop
const ChatWindow = ({ selectedChatId }) => {
    const navigate = useNavigate();
    const { user, getMatchDetails, completeMediation, confirmMatch, cancelMatch } = useContext(UserContext);
   // VERSÃO NOVA E CORRIGIDA
const [match, setMatch] = useState(null);
const [messages, setMessages] = useState([]);
const [loading, setLoading] = useState(true);
const [newMessage, setNewMessage] = useState('');
const messagesEndRef = useRef(null);

// ESTADOS QUE FALTAVAM (copiados do MediationChat original)
const [matchResult, setMatchResult] = useState('');
const [showResultForm, setShowResultForm] = useState(false);
const [isConfirming, setIsConfirming] = useState(false);
const [isCanceling, setIsCanceling] = useState(false);
const [statistics, setStatistics] = useState({
    player1Kills: '',
    player1Assists: '',
    player1Caps: '',
    player2Kills: '',
    player2Assists: '',
    player2Caps: '',
});

    // Recarrega os dados sempre que o ID do chat selecionado mudar
    useEffect(() => {
        const fetchMatchData = async () => {
            if (!selectedChatId) return;
            
            setLoading(true);
            const matchData = await getMatchDetails(selectedChatId);
            
            if (matchData?.success && matchData.match) {
                setMatch(matchData.match);
                setMessages(matchData.match.conversation?.messages || []);
            } else {
                alert("Não foi possível carregar os dados da partida.");
                // Em vez de redirecionar, podemos apenas mostrar uma mensagem de erro
                setMatch(null); 
            }
            setLoading(false);
        };
        
        fetchMatchData();
    }, [selectedChatId, getMatchDetails]); // A mágica acontece aqui!

    // Scroll automático para a última mensagem
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

    // FUNÇÃO MODIFICADA: Finalizar mediação com estatísticas
    const handleCompleteMediation = async () => {
        if (!matchResult || !match) { 
            alert('Por favor, selecione o resultado da partida.'); 
            return; 
        }

        // Preparar dados de estatísticas (apenas valores não vazios)
        const statsData = {};
        Object.keys(statistics).forEach(key => {
            const value = statistics[key];
            if (value !== '' && value !== null && value !== undefined) {
                const numValue = parseInt(value);
                if (!isNaN(numValue) && numValue >= 0) {
                    statsData[key] = numValue;
                }
            }
        });

        try {
            const result = await completeMediation(match.id, matchResult, statsData);
            if (result.success) { 
                alert(`Mediação finalizada com sucesso!`); 
                navigate('/games'); 
            } else { 
                alert(result.message); 
            }
        } catch (error) {
            console.error('Erro ao finalizar mediação:', error);
            alert('Erro ao finalizar mediação.');
        }
    };

    // Função para atualizar estatísticas
    const handleStatisticChange = (field, value) => {
        setStatistics(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Função para confirmar participação
    const handleConfirmMatch = async () => {
        if (!match || isConfirming) return;
        
        setIsConfirming(true);
        try {
            const result = await confirmMatch(match.id);
            if (result.success) {
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

    // Função para cancelar partida
    const handleCancelMatch = async () => {
        if (!match || isCanceling) return;
        
        const confirmCancel = window.confirm('Tem certeza que deseja cancelar esta partida? Você será retornado à fila.');
        if (!confirmCancel) return;
        
        setIsCanceling(true);
        try {
            const result = await cancelMatch(match.id);
            if (result.success) {
                alert(result.message);
                
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

    if (loading) {
        return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div></div>;
    }

    if (!match) {
        return <div className="flex-1 flex items-center justify-center text-gray-400">Erro ao carregar a conversa. Por favor, selecione outra.</div>;
    }

    // O JSX do return será o mesmo do seu MediationChat.jsx,
    // desde o Header Aprimorado até a Área de Input.
    // Cole o return inteiro do seu MediationChat aqui.
   
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

            {/* Área de Confirmação Compacta */}
            {match.status === 'PENDING_CONFIRMATION' && (
                <div className="bg-yellow-900/30 border-b border-yellow-600 p-2 text-center">
                    <h3 className="text-md font-bold text-yellow-400">⚠️ Confirmação Necessária</h3>
                    <p className="text-xs text-gray-300 mt-1">Discutam as regras no chat e confirmem quando estiverem de acordo</p>
                    
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

            {/* FORMULÁRIO DE RESULTADO COM ESTATÍSTICAS */}
            {showResultForm && match.status === 'IN_PROGRESS' && user?.isAdmin && match.mediatorId === user.id && (
                <div className="bg-gray-800 p-4 border-b border-gray-700 max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-bold text-purple-400 mb-3">Finalizar Mediação</h3>
                    
                    {/* Seleção do Resultado */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Resultado da Partida *</label>
                        <select
                            value={matchResult}
                            onChange={(e) => setMatchResult(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        >
                            <option value="">Selecione o resultado</option>
                            <option value="player1_win">Vitória do {match.player1.profile.username}</option>
                            <option value="player2_win">Vitória do {match.player2.profile.username}</option>
                            <option value="draw">Empate</option>
                            <option value="player1_wo">Vitória do {match.player1.profile.username} por W.O</option>
                            <option value="player2_wo">Vitória do {match.player2.profile.username} por W.O</option>
                            <option value="cancelled">Cancelada</option>
                        </select>
                    </div>

                    {/* Estatísticas Opcionais */}
                    <div className="mb-4">
                        <h4 className="text-md font-semibold text-gray-300 mb-3">Estatísticas (Opcionais)</h4>
                        <p className="text-xs text-gray-400 mb-3">
                            Preencha apenas as estatísticas que foram informadas pelos jogadores. 
                            Campos vazios não serão contabilizados nas médias.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {/* Estatísticas do Jogador 1 */}
                            <div>
                                <h5 className="text-sm font-medium text-purple-400 mb-2">{match.player1.profile.username}</h5>
                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-xs text-gray-400">Kills</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={statistics.player1Kills}
                                            onChange={(e) => handleStatisticChange('player1Kills', e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                            placeholder="Ex: 15"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400">Assistências</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={statistics.player1Assists}
                                            onChange={(e) => handleStatisticChange('player1Assists', e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                            placeholder="Ex: 8"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400">Capas</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={statistics.player1Caps}
                                            onChange={(e) => handleStatisticChange('player1Caps', e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                            placeholder="Ex: 3"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Estatísticas do Jogador 2 */}
                            <div>
                                <h5 className="text-sm font-medium text-purple-400 mb-2">{match.player2.profile.username}</h5>
                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-xs text-gray-400">Kills</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={statistics.player2Kills}
                                            onChange={(e) => handleStatisticChange('player2Kills', e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                            placeholder="Ex: 12"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400">Assistências</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={statistics.player2Assists}
                                            onChange={(e) => handleStatisticChange('player2Assists', e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                            placeholder="Ex: 5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400">Capas</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={statistics.player2Caps}
                                            onChange={(e) => handleStatisticChange('player2Caps', e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                            placeholder="Ex: 1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex space-x-3">
                        <button
                            onClick={handleCompleteMediation}
                            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium text-sm"
                        >
                            Finalizar Mediação
                        </button>
                        <button
                            onClick={() => setShowResultForm(false)}
                            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-medium text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

            {/* Área de Input */}
            <div className="bg-gray-800 p-4 border-t border-gray-700">
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


export default ChatWindow;
