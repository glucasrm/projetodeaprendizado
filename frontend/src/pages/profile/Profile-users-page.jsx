import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const PerfilPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname.includes('/estatisticas')) return 'estatisticas';
    if (location.pathname.includes('/amigos')) return 'amigos';
    if (location.pathname.includes('/equipes')) return 'equipes';
    if (location.pathname.includes('/ranking')) return 'ranking';
    if (location.pathname.includes('/torneios-usuario')) return 'torneios-usuario';
    if (location.pathname === '/perfil') return 'overview';
    return null;
  };

  const activeTab = getActiveTab();

  return (
    <nav>
      <div className="min-h-screen bg-[#0F172A] text-white">

        {/* Banner fake temporário */}
        <div
          className="relative h-96 w-full bg-cover bg-center"
          style={{
            backgroundColor: '#1E293B', // Apenas uma cor fixa por enquanto
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F172A]" />
        </div>

        {/* Avatar + Nome + Bio Fake */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center space-x-4 mt-6">
            <div className="w-24 h-24 bg-gray-500 rounded-full"></div>
            <div>
              <h2 className="text-xl font-bold">Nome do Usuário</h2>
              <p className="text-gray-400">Bio do usuário vai aqui...</p>
            </div>
          </div>

          {/* Menu Tabs */}
          <div className="mt-10 border-b border-gray-700 flex gap-6 justify-center text-base font-medium">
            <button
              onClick={() => navigate('/perfil')}
              className={`pb-2 transition ${
                activeTab === 'overview' ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-800'
              }`}
            >
              Visão Geral
            </button>

            <button
              onClick={() => navigate('/perfil/amigos')}
              className={`pb-2 transition ${
                activeTab === 'amigos' ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-800'
              }`}
            >
              Amigos
            </button>

            <button
              onClick={() => navigate('/perfil/equipes')}
              className={`pb-2 transition ${
                activeTab === 'equipes' ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-800'
              }`}
            >
              Equipes
            </button>

            <button
              onClick={() => navigate('/perfil/torneios-usuario')}
              className={`pb-2 transition ${
                activeTab === 'torneios-usuario' ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-800'
              }`}
            >
              Torneios
            </button>
          </div>

          {/* Outlet (Conteúdo das subrotas) */}
          <div className="mt-10">
            <Outlet />
          </div>

        </div>
      </div>
    </nav>
  );
};

export default PerfilPage;
