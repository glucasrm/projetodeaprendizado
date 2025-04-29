import React, { useEffect } from 'react';
import { useLocation, useParams, useNavigate, Outlet } from 'react-router-dom';
import { UserPlus, BarChart3 } from 'lucide-react';
import freefirebanner from '../assets/bannerfreefire.png';

const gamesData = {
  freefire: {
    name: 'Garena Free Fire',
    banner: freefirebanner,
    avatar: '/path/to/avatar.jpg',
  },
  valorant: {
    name: 'Valorant',
    banner: '/path/to/banner-valorant.jpg',
    avatar: '/path/to/avatar-valorant.jpg',
  },
};

const GamePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const game = gamesData[slug] || {
    name: 'Jogo não encontrado',
    banner: '/default/banner.jpg',
    avatar: '/default/avatar.jpg',
  };

  const getActiveTab = () => {
    if (location.pathname.includes('/ranking')) return 'ranking';
    if (location.pathname.includes('/apostado')) return 'apostado';
    if (location.pathname.includes('/torneios')) return 'torneios';
    if (location.pathname === `/games/${slug}`) return 'overview';
    return null;
  };
  

  const activeTab = getActiveTab();

  useEffect(() => {
    if (location.pathname === `/games/${slug}` && location.state?.redirectTo === 'ranking') {
      navigate(`/games/${slug}/ranking`, { replace: true });
    }
  }, [location, navigate, slug]);

  return (
    <nav>
      <div className="min-h-screen bg-gray-900 text-white">
            <div
          className="relative h-96 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${game.banner})` }}
        >
          {/* Degradê sobre o banner */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900" />
         
  </div>

        <div className="max-w-7xl mx-auto px-6 -mt-15">
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center gap-6">
              <img
                src={game.avatar}
                alt={`Avatar do jogo ${game.name}`}
                className="w-44 h-44 rounded-lg border-4 border-gray-800 object-cover"
              />
              <h1 className="text-4xl font-bold">{game.name}</h1>
            </div>

            <div className="flex gap-4 mt-6 sm:mt-0">
              <button className="bg-[#1F2937] px-4 py-2 rounded-lg hover:bg-blue-800 transition">Criar</button>
              <button className="bg-gray-600 px-4 py-2 rounded-lg hover:bg-blue-800 transition">Adicionar conta</button>
            </div>
          </div>

          {/* MENU TABS */}
          <div className="mt-10 border-b border-gray-700 flex gap-6 text-base font-medium">
          {/* Visão Geral */}
          <button
            onClick={() => navigate(`/games/${slug}`)}
            className={`pb-2 transition ${
              activeTab === 'overview' ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-800'
            }`}
          >
            Visão Geral
          </button>

          {/* Torneios */}
          <button
            onClick={() => navigate(`/games/${slug}/torneios`)}
            className={`pb-2 transition ${
              activeTab === 'torneios' ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-800'
            }`}
          >
            Torneios
          </button>


            {slug === 'freefire' && (
              <button
                onClick={() => navigate(`/games/${slug}/apostado`)}
                className={`flex items-center gap-2 pb-2 transition ${
                  activeTab === 'apostado' ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-800'
                }`}
              >
                <UserPlus size={18} />
                Apostado
              </button>
            )}

            <button
              onClick={() => navigate(`/games/${slug}/ranking`)}
              className={`flex items-center gap-2 pb-2 transition ${
                activeTab === 'ranking' ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-800'
              }`}
            >
              <BarChart3 size={18} />
              Ranking
            </button>
          </div>

          <div className="mt-10">
            <Outlet /> {/* Conteúdo das rotas internas */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GamePage;
