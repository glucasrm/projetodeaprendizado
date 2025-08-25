import React, { useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from '../../context/UserContext';
import ChatWindow from '../../components/chat/ChatWindow'; // Nosso novo componente
import WelcomeScreen from '../../components/chat/WelcomeScreen'; // Nossa tela de boas-vindas

// Componente para cada item da lista de conversas
const ConversationItem = ({ convo, onClick, isSelected }) => {
    const { user } = useContext(UserContext);

    const getConversationName = () => {
        const otherParticipants = (convo.participants || []).filter(p => p.id !== user?.id);
        if (otherParticipants.length > 1) return `${otherParticipants[0]?.username || 'P1'} vs ${otherParticipants[1]?.username || 'P2'}`;
        if (otherParticipants.length === 1) return otherParticipants[0]?.username || "Oponente";
        return "Conversa de Partida";
    };

    const getConversationAvatar = () => {
        const otherParticipant = (convo.participants || []).find(p => p.id !== user?.id);
        return otherParticipant?.avatar 
            ? `${import.meta.env.VITE_API_URL}${otherParticipant.avatar}`
            : 'https://via.placeholder.com/150';
    };

    const lastMessage = convo.lastMessage;

    return (
        <div
            onClick={onClick}
            className={`flex items-start gap-3 p-3 mb-2 rounded-xl cursor-pointer transition-colors duration-200 ${
                isSelected ? 'bg-purple-900/50' : 'hover:bg-gray-700/50'
            }`}
        >
            <img
                src={getConversationAvatar( )}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
            />
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-md truncate text-gray-200">{getConversationName()}</span>
                    {lastMessage && (
                        <span className="text-xs text-gray-500">
                            {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-400 truncate mt-1">
                    {lastMessage ? lastMessage.content : 'Nenhuma mensagem ainda.'}
                </p>
            </div>
        </div>
    );
};

// Layout principal do Chat
const ChatLayout = () => {
    const { conversations, loading: contextLoading } = useContext(UserContext);
    const [selectedChatId, setSelectedChatId] = useState(null);

    const handleSelectChat = (chatId) => {
        setSelectedChatId(chatId);
    };

    return (
        <div className="flex h-screen bg-[#0F172A] text-white overflow-hidden">
            {/* Lista de conversas (Mestre) */}
            <aside className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-800 flex flex-col">
                <header className="p-4 border-b border-gray-800">
                    <h2 className="font-bold text-xl text-gray-200">Conversas</h2>
                </header>
                <div className="flex-1 overflow-y-auto p-2">
                    {contextLoading ? (
                        <p className="text-center text-gray-400 mt-4">Carregando conversas...</p>
                    ) : (
                        conversations.map(convo => (
                            <ConversationItem
                                key={convo.id}
                                convo={convo}
                                isSelected={selectedChatId === convo.id}
                                onClick={() => handleSelectChat(convo.id)}
                            />
                        ))
                    )}
                </div>
            </aside>

            {/* Janela de conversa (Detalhe) */}
            <main className="flex-1 flex flex-col">
                {selectedChatId ? (
                    <ChatWindow selectedChatId={selectedChatId} />
                ) : (
                    <WelcomeScreen />
                )}
            </main>
        </div>
    );
};

export default ChatLayout;
