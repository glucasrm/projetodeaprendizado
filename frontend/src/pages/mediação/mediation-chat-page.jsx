import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';
import MessageBubble from '../../components/chat/MessageBubble'; // Importe o novo componente

const MediationChat = () => {
    const { chatRoomId } = useParams();
    const navigate = useNavigate();
    const { user, getMatchDetails, completeMediation } = useContext(UserContext);
    
    const [match, setMatch] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [matchResult, setMatchResult] = useState('');
    const [showResultForm, setShowResultForm] = useState(false);
    const messagesEndRef = useRef(null);

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
                // A API agora retorna o objeto completo da mensagem com o sender e profile
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

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            {/* Header Aprimorado */}
            <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
                <ParticipantHeader player={match.player1} />
                <div className="text-center">
                    <h1 className="text-xl font-bold text-purple-400">VS</h1>
                    <p className="text-sm text-gray-300">Aposta: R$ {parseFloat(match.betAmount).toFixed(2)}</p>
                </div>
                <ParticipantHeader player={match.player2} />
            </div>

            {/* Formulário de Resultado (sem alterações) */}
            {showResultForm && (
                <div className="bg-gray-800 p-4 border-b border-gray-700">
                    {/* ... seu JSX do formulário ... */}
                </div>
            )}

            {/* Área de Mensagens com o novo componente */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} currentUser={user} match={match} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Área de Input (sem alterações) */}
            <div className="bg-gray-800 p-4 border-t border-gray-700">
                {/* ... seu JSX da área de input ... */}
            </div>
        </div>
    );
};

export default MediationChat;
