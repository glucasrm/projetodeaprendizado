import React from 'react';
import { MessageSquare } from 'lucide-react';

const WelcomeScreen = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
        <MessageSquare size={64} className="mb-4" />
        <h2 className="text-2xl font-bold text-gray-400">Seu Histórico de Chats</h2>
        <p className="mt-2">Selecione uma partida à esquerda para ver a conversa.</p>
    </div>
);

export default WelcomeScreen;
