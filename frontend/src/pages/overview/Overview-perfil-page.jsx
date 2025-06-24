import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserContext from '../../context/UserContext';
import VisaoGeralCard from '../../components/overview/Overwiew-user-Card';
import axios from 'axios';

const OverViewPerfil = () => {
  const { user } = useContext(UserContext);
  const { username } = useParams();
  const [publicProfile, setPublicProfile] = useState(null);

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

  if (username && !publicProfile) {
    return <div className="text-white">Carregando informações do perfil...</div>;
  }

  return (
    <section>
      <VisaoGeralCard
        texto={profileData?.bio}
        idioma="Português"
        gamesaccount="Conta de jogo"
        socialLinks={username ? publicProfile?.user?.socialLinks : null}
      />
    </section>
  );
};

export default OverViewPerfil;
