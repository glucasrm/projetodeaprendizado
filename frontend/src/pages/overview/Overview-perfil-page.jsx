import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserContext from '../../context/UserContext';
import VisaoGeralCard from '../../components/overview/Overwiew-user-Card';
import axios from 'axios';

const OverViewPerfil = () => {
  const { user } = useContext(UserContext);
  const { userId } = useParams();
  const [publicProfile, setPublicProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (userId) { // Se userId existe na URL, estamos em um perfil público
        setIsLoading(true);
        try {
          const res = await axios.get(`http://localhost:3000/api/profile/public/id/${userId}`);
          setPublicProfile(res.data);
        } catch (error) {
          console.error('Erro ao carregar perfil público:', error);
          setPublicProfile(null);
        } finally {
          setIsLoading(false);
        }
      } else if (user) { // Se não há userId na URL e o usuário está logado, é o próprio perfil
        setPublicProfile(null); // Garante que publicProfile seja nulo para usar os dados do 'user' do contexto
        setIsLoading(false);
      } else { // Se não há userId e o usuário não está logado
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, user]);

  const profileData = userId ? publicProfile : user;

  if (isLoading) {
    return <div className="text-white">Carregando informações do perfil...</div>;
  }

  if (userId && !publicProfile) {
    return <div className="text-white">Perfil não encontrado.</div>;
  }

  return (
    <section>
      <VisaoGeralCard
        texto={profileData?.bio}
        idioma="Português"
        gamesaccount="Conta de jogo"
        socialLinks={profileData?.socialLinks || []} // CORRIGIDO: Acessa socialLinks diretamente de profileData
      />
    </section>
  );
};

export default OverViewPerfil;
