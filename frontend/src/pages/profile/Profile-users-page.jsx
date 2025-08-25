import {React, useContext, useState, useEffect} from 'react';
import { useNavigate, useLocation, Outlet, useParams } from 'react-router-dom'; // Adicionado useParams
import UserContext from '../../context/UserContext';
import axios from 'axios';


const PerfilPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams(); // Agora pegamos userId em vez de username
  const [publicProfile, setPublicProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Adicionado estado de carregamento
  const { user, login } = useContext(UserContext);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (userId) { // Se userId existe na URL, estamos em um perfil público
        setIsLoading(true); // Começa a carregar
        try {
          // Chamamos a nova rota do backend para buscar por ID
          const res = await axios.get(`http://localhost:3000/api/profile/public/id/${userId}`);
          setPublicProfile(res.data);
        } catch (error) {
          console.error('Erro ao carregar perfil público:', error);
          setPublicProfile(null); // Limpa o perfil público em caso de erro
        } finally {
          setIsLoading(false); // Termina o carregamento
        }
      } else if (user) { // Se não há userId na URL e o usuário está logado, é o próprio perfil
        setPublicProfile(null); // Garante que publicProfile seja nulo para usar os dados do 'user' do contexto
        setIsLoading(false); // Não há carregamento de API para o próprio perfil
      } else { // Se não há userId e o usuário não está logado
        setIsLoading(false); // Não há carregamento, apenas a mensagem de não logado
      }
    };

    fetchProfileData();
  }, [userId, user]); // Depende de userId e user do contexto

  // Se userId está presente, usamos os dados do publicProfile. Caso contrário, usamos os dados do usuário logado.
  const profileData = userId ? publicProfile : user;

  // Mostra mensagem de carregamento se for um perfil público e ainda não carregou
  if (isLoading) { // Simplificado para apenas isLoading, pois o estado inicial já cobre o caso
    return <div className="text-white">Carregando perfil...</div>;
  }

  // Se for um perfil público e não foi encontrado após o carregamento
  if (userId && !publicProfile && !isLoading) {
    return <div className="text-white">Perfil não encontrado.</div>;
  }

  // Se o usuário não está logado e não é um perfil público, ou o perfil público não existe
  if (!login && !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white text-2xl">
        Usuário não logado.
      </div>
    );
  }

  const getActiveTab = () => {
    // As abas internas ainda são relativas ao /perfil ou /perfil/:userId
    if (location.pathname.includes('/amigos')) return 'amigos';
    if (location.pathname.includes('/equipes')) return 'equipes';
    if (location.pathname.includes('/torneios-usuario')) return 'torneios-usuario';
    if (location.pathname.includes('/estatisticas')) return 'estatisticas';
    // Se não houver sub-rota ou for a rota base do perfil, é a visão geral
    if (location.pathname === `/perfil` || location.pathname === `/perfil/${userId}`) return 'overview';
    return null;
  };

  const activeTab = getActiveTab();

  const avatarUrl = profileData?.avatar
    ? `${import.meta.env.VITE_API_URL}${profileData.avatar}`
    : '/default-avatar.png';

  const bannerUrl = profileData?.banner
    ? `${import.meta.env.VITE_API_URL}${profileData.banner}`
    : '/default-banner.png';

  return (
    <nav>
      <div className="min-h-screen bg-[#0F172A] text-white">

        {/* Banner */}
        <div className="relative h-96 w-full">
          <img
            src={bannerUrl}
            className="h-96 w-full object-cover border border-gray-900"
            style={{
              backgroundColor: '#1E293B'
            }}
            alt="Banner do perfil"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F172A]" />
        </div>

        {/* Avatar + Nome + Bio */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center space-x-4 mt-6">
            <img
              src={avatarUrl}
              className="w-24 h-24 bg-gray-500 rounded-full"
              alt="Avatar do perfil"
            ></img>
            <div>
              <span className="text-xl font-bold">{profileData?.username || 'Usuário'}</span>
              <p className="text-gray-400">{profileData?.bio || 'Bio'}</p>
            </div>
          </div>

          {/* Menu Tabs */}
          <div className="mt-10 border-b border-gray-700 flex gap-6 justify-center text-base font-medium">
            {/* Se for o próprio perfil, mostra todas as abas. Se for perfil público, apenas Visão Geral. */}
            {!userId && ( // Se não há userId na URL, é o perfil do usuário logado
              <>
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
                        <button
                  onClick={() => navigate(userId ? `/perfil/${userId}/estatisticas` : '/perfil/estatisticas')}
                  className={`pb-2 transition ${
                    activeTab === 'estatisticas' ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-800'
                  }`}
                >
                  Estatísticas
                </button>

              </>
            )}
            {userId && ( // Se há userId na URL, é um perfil público, mostra apenas Visão Geral
              <button
                onClick={() => navigate(`/perfil/${userId}`)}
                className={`pb-2 transition ${
                  activeTab === 'overview' ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-800'
                }`}
              >
                Visão Geral
              </button>
            )}
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
