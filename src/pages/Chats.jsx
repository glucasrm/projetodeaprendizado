import React, { useState } from 'react';
import Foto from '../assets/logo.png'

const mockConversations = [
  {
    id: 1,
    name: 'João',
    isGroup: false,
    messages: ['E aí!', 'Vamos jogar mais tarde?'],
    foto:Foto
  },
  {
    id: 2,
    name: 'Equipe Alpha',
    isGroup: true,
    members: ['Maria', 'Lucas', 'Bruno'],
    messages: ['Boa sorte no torneio!', 'Reunião às 18h.'],
    foto:'equipe alpha png'
  },
  {
    id: 3,
    name: 'Carlos',
    isGroup: false,
    messages: ['Boa noite!', 'Me chama pra próxima.'],
    foto:'Carlos.png'
  },
];

const ChatLayout = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState(mockConversations);

  const handleSend = () => {
    if (!input.trim()) return;
    setConversations(prev =>
      prev.map(chat =>
        chat.id === selectedChat.id
          ? { ...chat, messages: [...chat.messages, input] }
          : chat
      )
    );
    setInput('');
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Lista de conversas */}
      <div className="w-1/4 border-r border-gray-700 p-4 overflow-y-auto">
        <h2 className="font-bold text-2xl border-b p-3 border-gray-500 mb-4">Chats</h2>
        {conversations.map(chat => (
          <div
            key={chat.id}
            onClick={() => setSelectedChat(chat)}
            className={`p-3 border border-gray-500 rounded-lg cursor-pointer hover:bg-gray-700 ${
              selectedChat?.id === chat.id ? 'bg-gray-700' : ''
            }`}
          >
            <p className="font-medium">{chat.name}</p>
            <p className="text-sm text-gray-400 truncate">
              {chat.messages[chat.messages.length - 1]}
            </p>
          </div>
        ))}
      </div>

      {/* Janela de conversa */}
      <div className="flex flex-col flex-1 border-r border-gray-700">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-gray-700 font-semibold">
              {selectedChat.name}
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-2">
              {selectedChat.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800 px-4 py-2 rounded-lg max-w-md"
                >
                  {msg}
                </div>
              ))}
            </div>

            {/* Campo de digitação */}
            <div className="p-4 border-t border-gray-700 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Digite sua mensagem..."
                className="flex-1 p-2 rounded-lg bg-gray-800 text-white outline-none"
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Enviar
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Selecione uma conversa para começar
          </div>
        )}
      </div>

      {/* Detalhes do chat */}
      {selectedChat && (<div className="w-1/4 p-4">
  <img
    src={selectedChat.foto}
    alt={selectedChat.name}
    className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
  />

  <h3 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-2">
    {selectedChat.isGroup ? 'Informações do Grupo' : 'Perfil'}
  </h3>

  {selectedChat.isGroup ? (
    <div>
      <p className="mb-2 text-gray-400">Nome do grupo:</p>
      <p className="mb-4">{selectedChat.name}</p>

      <p className="mb-2 font-bold text-gray-400">Membros:</p>
      <ul className="list-disc pl-5 space-y-1">
        {selectedChat.members.map((membro, idx) => (
          <li key={idx} className=" hover:bg-gray-500 rounded p-3 flex items-center gap-2">
            <img
              src={Foto} // Aqui você pode trocar para a foto real de cada membro depois
              alt={membro}
              className="w-8 h-8 rounded-full object-cover"
            />
            <a href={`/perfil/${membro}`}>
              {membro}
            </a>
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <div className="text-center">
      <p className="mb-2 text-gray-400">Nome:</p>
      <a href={`/perfil/${selectedChat.name}`} className="hover:underline text-lg">
        {selectedChat.name}
      </a>
      <p className="text-green-400 text-sm mt-2">🟢 Online agora</p>
    </div>
  )}
</div>
)}
    </div>
  );
};

export default ChatLayout;
