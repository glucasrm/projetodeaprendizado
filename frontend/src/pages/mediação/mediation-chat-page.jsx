// src/pages/mediation/MediationChat.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const MediationChat = () => {
    const { chatRoomId } = useParams();
    const navigate = useNavigate();
    const { user, currentMatch, completeMediation } = useContext(UserContext);
    
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [matchResult, setMatchResult] = useState('');
    const [showResultForm, setShowResultForm] = useState(false);
    const messagesEndRef = useRef(null);

    // Simular mensagens iniciais
    useEffect(() => {
        const initialMessages = [
            {
                id: 1,
                sender: 'system',
                message: 'Mediação iniciada. Bem-vindo ao chat da partida!',
                timestamp: new Date().toISOString(),
                type: 'system'
            },
            {
                id: 2,
                sender: 'system',
                message: `Modalidade: ${currentMatch?.modality || '1v1'} | Plataforma: ${currentMatch?.platform || 'Mobile'}`,
                timestamp: new Date().toISOString(),
                type: 'system'
            },
            {
                id: 3,
                sender: 'Jogador1',
                message: 'Olá! Pronto para a partida.',
                timestamp: new Date().toISOString(),
                type: 'player'
            },
            {
                id: 4,
                sender: 'Jogador2',
                message: 'Vamos começar!',
                timestamp: new Date().toISOString(),
                type: 'player'
            }
        ];
        setMessages(initialMessages);
    }, [currentMatch]);

    // Auto-scroll para a última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (newMessage.trim() === '') return;

        const message = {
            id: messages.length + 1,
            sender: user.username,
            message: newMessage,
            timestamp: new Date().toISOString(),
            type: 'mediator'
        };

        setMessages(prev => [...prev, message]);
        setNewMessage('');

        // Aqui você enviaria a mensagem via WebSocket ou API
        // socket.emit('send_message', message);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleCompleteMediation = async () => {
        if (!matchResult) {
            alert('Por favor, selecione o resultado da partida.');
            return;
        }

        const result = await completeMediation(currentMatch?.id, matchResult);
        if (result.success) {
            alert(`Mediação finalizada! Você recebeu R$ ${result.reward.toFixed(2)} pela mediação.`);
            navigate('/games'); // Redirecionar para página principal
        } else {
            alert(result.message);
        }
    };

    const getMessageStyle = (type) => {
        switch (type) {
            case 'system':
                return 'bg-gray-600 text-gray-200 text-center italic';
            case 'mediator':
                return 'bg-purple-600 text-white ml-auto';
            case 'player':
                return 'bg-blue-600 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    if (!currentMatch) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <p className="text-xl mb-4">Nenhuma partida encontrada para mediação.</p>
                    <button
                        onClick={() => navigate('/games')}
                        className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800 p-4 border-b border-gray-700">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-purple-400">Mediação de Partida</h1>
                        <p className="text-sm text-gray-300">
                            Sala: {chatRoomId} | {currentMatch.modality} - {currentMatch.platform}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowResultForm(!showResultForm)}
                            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm"
                        >
                            Finalizar Partida
                        </button>
                        <button
                            onClick={() => navigate('/games')}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </div>

            {/* Formulário de Resultado */}
            {showResultForm && (
                <div className="bg-gray-800 p-4 border-b border-gray-700">
                    <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium">Resultado da partida:</label>
                        <select
                            value={matchResult}
                            onChange={(e) => setMatchResult(e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
                        >
                            <option value="">Selecione o vencedor</option>
                            <option value="player1">Jogador 1 venceu</option>
                            <option value="player2">Jogador 2 venceu</option>
                            <option value="draw">Empate</option>
                            <option value="cancelled">Partida cancelada</option>
                        </select>
                        <button
                            onClick={handleCompleteMediation}
                            className="bg-purple-600 hover:bg-purple-700 px-4 py-1 rounded text-sm"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            )}

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getMessageStyle(msg.type)}`}
                    >
                        {msg.type !== 'system' && (
                            <p className="text-xs opacity-75 mb-1">{msg.sender}</p>
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-50 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Área de Input */}
            <div className="bg-gray-800 p-4 border-t border-gray-700">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Digite sua mensagem como mediador..."
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-medium transition duration-200"
                    >
                        Enviar
                    </button>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                    Como mediador, você pode orientar os jogadores e resolver disputas.
                </div>
            </div>
        </div>
    );
};

export default MediationChat;
