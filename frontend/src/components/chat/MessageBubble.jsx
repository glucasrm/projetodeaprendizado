import React from 'react';
import { Link } from 'react-router-dom';

// Componente para a bolha de mensagem individual
const MessageBubble = ({ msg, currentUser, match }) => {
    // Determina se a mensagem é do usuário logado (o mediador)
    const isCurrentUser = msg.senderId === currentUser.id;
    // Determina se o remetente é um administrador (neste caso, o mediador da partida)
    const isSenderAdmin = msg.senderId === match.mediatorId;

    // Define o estilo com base em quem enviou
    const getBubbleStyle = () => {
        if (isCurrentUser) {
            // Estilo para o mediador (usuário atual)
            return 'bg-purple-600 text-white self-end';
        }
        // Estilo para os jogadores
        return 'bg-blue-600 text-white self-start';
    };

    // Define o alinhamento do container da mensagem
    const getContainerStyle = () => {
        return isCurrentUser ? 'flex justify-end' : 'flex justify-start';
    };

    const avatarUrl = msg.sender?.profile?.avatar 
        ? `${import.meta.env.VITE_API_URL}${msg.sender.profile.avatar}`
        : 'https://via.placeholder.com/150'; // Um avatar padrão

    return (
        <div className={`flex items-end gap-2 ${getContainerStyle( )}`}>
            {/* Avatar (não mostra para o usuário atual para economizar espaço) */}
            {!isCurrentUser && (
                <Link to={`/perfil/${msg.senderId}`}>
                    <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full cursor-pointer" />
                </Link>
            )}

            {/* Bolha da Mensagem */}
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getBubbleStyle()}`}>
                <div className="flex items-center gap-2 mb-1">
                    <Link to={`/perfil/${msg.senderId}`} className="text-xs font-bold hover:underline">
                        {msg.sender?.profile?.username || 'Usuário'}
                    </Link>
                    {/* Tag especial para o mediador */}
                    {isSenderAdmin && (
                        <span className="text-xs font-semibold bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full">
                            Mediador
                        </span>
                    )}
                </div>
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};

export default MessageBubble;
