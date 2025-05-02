//página de chat
import React, { useState } from 'react';
import { Share2, User, UserPlus, UserX } from 'lucide-react';
import Foto from '../../assets/logo.png';

const mockConversations = [
  {
    id: 1,
    name: 'João',
    isGroup: false,
    messages: ['E aí!', 'Vamos jogar mais tarde?'],
    foto: Foto,
  },
  {
    id: 2,
    name: 'Equipe Alpha',
    isGroup: true,
    members: [
      { name: 'Maria', online: true },
      { name: 'Lucas', online: false },
      { name: 'Bruno', online: true },
    ],
    messages: ['Boa sorte no torneio!', 'Reunião às 18h.'],
    foto: Foto,
  },
  {
    id: 3,
    name: 'Carlos',
    isGroup: false,
    messages: ['Boa noite!', 'Me chama pra próxima.'],
    foto: Foto,
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
    <div className="flex h-screen bg-[#0F172A] text-white overflow-hidden">
      {/* Lista de conversas */}
      <div className="w-1/4 border-r border-gray-800 p-4 overflow-y-auto">
        <h2 className="font-bold text-xl border-b pb-3 mb-4 border-gray-600">Conversas</h2>
        {conversations.map(chat => (
          <div
            key={chat.id}
            onClick={() => setSelectedChat(chat)}
            className={`flex items-start gap-3 p-3 mb-2 rounded-xl cursor-pointer transition hover:bg-gray-700 ${
              selectedChat?.id === chat.id ? 'bg-gray-800' : 'bg-gray-900'
            }`}
          >
            <img
              src={chat.foto}
              alt={chat.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-medium text-lg">{chat.name}</span>
                <span className="text-xs text-gray-500">12:34</span>
              </div>
              <span className="text-sm text-gray-400 truncate block">
                {chat.messages[chat.messages.length - 1]}
              </span>
            
            </div>
          </div>
        ))}
      </div>

      {/* Janela de conversa */}
      <div className="flex flex-col flex-1 relative">
        {selectedChat ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-gray-800 bg-gray-900">
              <img
                src={selectedChat.foto}
                alt={selectedChat.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold">{selectedChat.name}</h3>
                {!selectedChat.isGroup && (
                  <span className="text-green-400 text-sm">🟢 Online</span>
                )}
              </div>
            </div>


            <div className="flex-1 p-6 overflow-y-auto flex flex-col space-y-3 bg-[#1E293B]">
              {selectedChat.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    idx % 2 === 0
                      ? 'bg-blue-600 self-start'
                      : 'bg-gray-700 self-end'
                  }`}
                >
                  {msg}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-900 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Digite uma mensagem..."
                className="flex-1 p-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none"
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition"
              >
                Enviar
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Selecione uma conversa para começar
          </div>
        )}
      </div>

      {/* Detalhes do chat */}
      {selectedChat && (
        <div className="w-1/4 border-l border-gray-800 p-6 bg-gray-900 overflow-y-auto">
          <img
            src={selectedChat.foto}
            alt={selectedChat.name}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
          />
          <h3 className="text-xl font-bold text-center mb-2">
            {selectedChat.isGroup ? 'Grupo' : 'Perfil'}
          </h3>

          {selectedChat.isGroup ? (
            <>
              <p className="text-gray-400 mb-1 text-sm text-center">Membros</p>
              <div className="grid grid-cols-1 gap-3 mt-4">
                {selectedChat.members.map((membro, idx) => {
                  const nome = membro.name ?? membro;
                  const online = membro.online ?? true;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 p-4 rounded-2xl shadow-lg transition-all duration-300 ${
                        online
                          ? 'bg-gradient-to-br from-gray-800 to-gray-700 hover:shadow-xl hover:scale-[1.02]'
                          : 'bg-gray-800 opacity-70'
                      }`}
                    >
                      <img
                        src={Foto}
                        alt={nome}
                        className={`w-12 h-12 rounded-full object-cover ${
                          online ? 'ring-2 ring-green-500' : 'grayscale'
                        }`}
                      />
                      <div>
                        <a
                          href={`/perfil/${nome}`}
                          className="font-semibold text-white hover:text-blue-400 transition-colors">
                          {nome}
                        </a>

                        <p
                          className={`text-sm mt-1 flex items-center gap-1 ${
                            online ? 'text-green-400' : 'text-gray-400'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full inline-block ${
                              online ? 'bg-green-400' : 'bg-gray-500'
                            }`}
                          ></span>
                          {online ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div>
                <p className="mb-2 text-gray-400">Nome:</p>
                <p className="text-lg font-semibold text-white">{selectedChat.name}</p>
                <p className="text-green-400 text-sm mt-1">🟢 Online agora</p>
              </div>
              <div className="flex flex-col items-center gap-3 mt-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition">
                  <Share2 size={18} /> Compartilhar
                </button>
                <a
                  href={`/perfil/${selectedChat.name}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition"
                >
                  <User size={18} /> Ver perfil
                </a>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition">
                  <UserPlus size={18} /> Convidar para a equipe
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-800 hover:bg-red-700 transition">
                  <UserX size={18} /> Desfazer amizade
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatLayout;