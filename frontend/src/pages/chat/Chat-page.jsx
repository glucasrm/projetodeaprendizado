import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { Link } from 'react-router-dom';
import { Share2, User, UserPlus, UserX } from 'lucide-react';

const ChatLayout = () => {
    const { user, conversations, fetchConversations } = useContext(UserContext);
    const [selectedChat, setSelectedChat] = useState(null);
    const [input, setInput] = useState('');

    useEffect(() => {
        // Busca as conversas quando o componente é montado
        fetchConversations();
    }, [fetchConversations]);

    // Função para formatar o nome da conversa
    const getConversationName = (convo) => {
        if (!convo.match) return "Conversa de Partida";
        // Filtra para não mostrar o nome do usuário atual
        const otherParticipants = convo.participants.filter(p => p.id !== user.id);
        if (otherParticipants.length > 1) {
            return `${otherParticipants[0].profile.username} vs ${otherParticipants[1].profile.username}`;
        }
        return "Conversa de Partida";
    };

    // Função para pegar o avatar (do oponente, por exemplo)
    const getConversationAvatar = (convo) => {
        const otherParticipant = convo.participants.find(p => p.id !== user.id);
        return otherParticipant?.profile?.avatar 
            ? `${import.meta.env.VITE_API_URL}${otherParticipant.profile.avatar}`
            : 'https://via.placeholder.com/150';
    };

    return (
        <div className="flex h-screen bg-[#0F172A] text-white overflow-hidden">
            {/* Lista de conversas */}
            <div className="w-1/4 border-r border-gray-800 p-4 overflow-y-auto">
                <h2 className="font-bold text-xl border-b pb-3 mb-4 border-gray-600">Conversas de Partidas</h2>
                {conversations.map(convo => (
                    <Link
                        to={`/mediacao/chat/${convo.match.id}`} // Link para a sala de chat correta
                        key={convo.id}
                        onClick={( ) => setSelectedChat(convo)}
                        className={`flex items-start gap-3 p-3 mb-2 rounded-xl cursor-pointer transition hover:bg-gray-700 ${
                            selectedChat?.id === convo.id ? 'bg-gray-800' : 'bg-gray-900'
                        }`}
                    >
                        <img
                            src={getConversationAvatar(convo)}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-lg truncate">{getConversationName(convo)}</span>
                                <span className="text-xs text-gray-500">
                                    {convo.messages.length > 0 ? new Date(convo.messages[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                            </div>
                            <span className="text-sm text-gray-400 truncate block">
                                {convo.messages.length > 0 ? convo.messages[0].content : 'Nenhuma mensagem ainda.'}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Placeholder da Janela de conversa */}
            <div className="flex flex-col flex-1 relative">
                <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Bem-vindo ao seu Histórico de Chats</h2>
                        <p className="mt-2">Selecione uma partida à esquerda para ver a conversa.</p>
                        <p className="mt-1 text-sm text-gray-500">As conversas são abertas em uma nova página para uma melhor experiência.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatLayout;
