//página de de perfil do usuário

import React, { useContext } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { UserContext } from '../../components/navbar/MainLayout';
import PerfilCard from '../../components/profile/Perfil-user-Card';

const PerfilPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);

  const getActiveTab = () => {
    if (location.pathname.includes('/estatisticas')) return 'estatisticas';
    if (location.pathname.includes('/amigos')) return 'amigos';
    if (location.pathname.includes('/equipes')) return 'equipes';
    if (location.pathname.includes('/ranking')) return 'ranking';
    if (location.pathname === '/perfil') return 'overview';
    return null;
  };

  const activeTab = getActiveTab();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0F172A]">
        <p>Usuário não logado.</p>
      </div>
    );
  }

  return (
    <nav>
      <div className="min-h-screen bg-[#0F172A] text-white">
        
        {/* Banner com Gradient */}
        <div
          className="relative h-96 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${user.banner})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F172A]" />
        </div>

        {/* Avatar + Nome + Bio */}
        <div className="max-w-7xl mx-auto px-6">
          <PerfilCard
            avatar={user.avatar}
            nome={user.name}
            bio={user.bio}
          />

          {/* Menu Tabs */}
          <div className="mt-10 border-b border-gray-700 flex gap-6 justify-center text-base font-medium">
            <button
              onClick={() => navigate(`/perfil`)}
              className={`pb-2 transition ${
                activeTab === 'overview' ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-800'
              }`}
            >
              Visão Geral
            </button>
            <button
            onClick={() => navigate(`/perfil/amigos`)}
            className={`pb-2 transition ${
              activeTab === 'amigos' ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-800'
            }`}
          >
            Amigos
          </button>
          <button
            onClick={() => navigate(`/perfil/equipes`)}
            className={`pb-2 transition ${
              activeTab === 'equipes' ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-800'
            }`}
          >
            Equipes
          </button>
          
          <button
            onClick={() => navigate(`/perfil/torneios-usuario`)}
            className={`pb-2 transition ${
              activeTab === 'torneios-usario' ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-800'
            }`}
          >
            Torneios
          </button>
          </div>

                 

          {/* Conteúdo (Outlet) */}
          <div className="mt-10">
            <Outlet />
          </div>

        </div>
      </div>
    </nav>
  );
};

export default PerfilPage;
