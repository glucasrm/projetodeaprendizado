import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Importa useParams
import UserContext from '../../context/UserContext';
import VisaoGeralCard from '../../components/overview/Overwiew-user-Card'; // Verifique o nome correto do componente
import axios from 'axios';

const OverViewPerfil = () => {
  const { user } = useContext(UserContext);
  const { userId } = useParams(); // Agora pegamos userId em vez de username
  const [publicProfile, setPublicProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Adicionado estado de carregamento

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (userId) { // Se userId existe na URL, estamos em um perfil público
        setIsLoading(true);
        try {
          // Chamamos a nova rota do backend para buscar por ID
          const res = await axios.get(`http://localhost:3000/api/profile/public/id/${userId}`);
          setPublicProfile(res.data);
        } catch (error) {
          console.error('Erro ao carregar perfil público:', error);
          setPublicProfile(null); // Limpa o perfil público em caso de erro
        } finally {
          setIsLoading(false);
        }
      } else { // Se não há userId na URL, é o perfil do usuário logado
        setPublicProfile(null); // Garante que publicProfile seja nulo para usar os dados do 'user' do contexto
        setIsLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId, user]); // Depende de userId e user do contexto

  // Se userId está presente, usamos os dados do publicProfile. Caso contrário, usamos os dados do usuário logado.
  const profileData = userId ? publicProfile : user;

  if (isLoading) {
    return <div className="text-white">Carregando informações do perfil...</div>;
  }

  // Se for um perfil público e não foi encontrado
  if (userId && !publicProfile) {
    return <div className="text-white">Perfil não encontrado.</div>;
  }

  return (
    <section>
      <VisaoGeralCard
        texto={profileData?.bio}
        idioma="Português" // Este valor é fixo ou deve vir do profileData?
        gamesaccount="Conta de jogo" // Este valor é fixo ou deve vir do profileData?
        socialLinks={profileData?.user?.socialLinks || []} // Use profileData para links sociais
      />
    </section>
  );
};

export default OverViewPerfil;
