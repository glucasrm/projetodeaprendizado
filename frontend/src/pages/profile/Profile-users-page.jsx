import {React, useContext, useState, useEffect} from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import UserContext from '../../context/UserContext';
import axios from  'axios';
import { useParams } from 'react-router-dom';


const PerfilPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useParams();
  const [publicProfile, setPublicProfile] = useState(null);
  const { user, login } = useContext(UserContext);

  //teste busca de perfil do usuario
useEffect(() => {
  const fetchPublicProfile = async () => {
    if (username) {
      try {
        const res = await axios.get(`http://localhost:3000/api/profile/public/${username}`);
        setPublicProfile(res.data);
      } catch (error) {
        console.error('Erro ao carregar perfil público:', error);
      }
    }
  };

  fetchPublicProfile();
}, [username]);

const profileData = username ? publicProfile : user;

  
  const handleNavigate = (path, redirectTo = null) => {
    if (redirectTo) {
      navigate(path, { state: { redirectTo } });
    } else {
      navigate(path);
    }
  };

  

 
  
  

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
  

    const avatarUrl = profileData?.avatar
  ? `${import.meta.env.VITE_API_URL}${profileData.avatar}`
  : '/default-avatar.png';

   const bannerUrl = profileData?.banner
  ? `${import.meta.env.VITE_API_URL}${profileData.banner}`
  : '/default-banner.png';

  if (username && !publicProfile) {
  return <div className="text-white">Carregando perfil público...</div>;
}

  return (
    
    login?( <nav>
      <div className="min-h-screen bg-[#0F172A] text-white">

        {/* Banner fake temporário */}
        <div className="relative h-96 w-full">
        <img
          src={bannerUrl}
          className="h-96 w-full object-cover border border-gray-900"
          style={{
            backgroundColor: '#1E293B'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F172A]" />
      </div>

        {/* Avatar + Nome + Bio Fake */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center space-x-4 mt-6">
            <img
            src={avatarUrl}
            className="w-24 h-24 bg-gray-500 rounded-full"></img>
            <div>
              <span  className="text-xl font-bold">{profileData?.username || 'Usuário'}</span>
              <p className="text-gray-400">{profileData?.bio || 'Bio'}</p>
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
):(<div className="flex items-center justify-center min-h-screen bg-gray-900 text-white text-2xl">
    Usuário não logado.
  </div>)
     );
};

export default PerfilPage;