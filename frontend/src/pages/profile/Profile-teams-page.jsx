//página de profile dos teams
import React from 'react';
import { useNavigate, useLocation, Outlet, useParams } from 'react-router-dom';

const mockEquipe = {
  id: 'equipe123',
  nome: 'Team Phoenix',
  bio: 'Lutamos com honra e espírito de fogo.🔥',
  avatar: 'https://i.pravatar.cc/150?img=50',
  banner: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e',
};

const EquipePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const activeTab = (() => {
    if (location.pathname.includes('/membros')) return 'membros';
    if (location.pathname.includes('/estatisticas')) return 'estatisticas';
    return 'overview';
  })();

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Banner com gradiente */}
      <div
        className="relative h-96 w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${mockEquipe.banner})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F172A]" />
      </div>

      {/* Avatar + Nome + Bio */}
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
          <img
            src={mockEquipe.avatar}
            alt="Avatar da equipe"
            className="w-36 h-36 rounded-full object-cover shadow-lg border-4 border-[#0F172A]"
          />
        </div>

        <div className="pt-20 text-center">
          <h1 className="text-3xl font-bold">{mockEquipe.nome}</h1>
          <p className="text-gray-400 mt-2">{mockEquipe.bio}</p>
        </div>

        {/* Tabs */}
        <div className="mt-10 border-b border-gray-700 flex gap-6 justify-center text-base font-medium">
          <button
            onClick={() => navigate(`/equipes/${id}`)}
            className={`pb-2 transition ${
              activeTab === 'overview' ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-800'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => navigate(`/equipes/${id}/membros`)}
            className={`pb-2 transition ${
              activeTab === 'membros' ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-800'
            }`}
          >
            Membros
          </button>
          <button
            onClick={() => navigate(`/equipes/${id}/estatisticas`)}
            className={`pb-2 transition ${
              activeTab === 'estatisticas' ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-800'
            }`}
          >
            Estatísticas
          </button>
        </div>

        {/* Conteúdo por rota */}
        <div className="mt-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EquipePage;
