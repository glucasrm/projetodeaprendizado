//página de lista de escolha dos games
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GamesCard from '../../components/games/Games-list-card';
import freefireImg from '../../assets/freefire.png';
import lolImg from '../../assets/leagueoflegends.png';
import cs2Img from '../../assets/cs2.png';
import valorantImg from '../../assets/valorant.png';
import fortiniteImg from '../../assets/fortinite.png';

const gamesList = [
  {
    image: freefireImg,
    nome: 'Garena Free Fire',
    slug: 'freefire',
  },
  {
    image: cs2Img,
    nome: 'Counter-Strike 2',
    slug: 'counter-strike-2',
  },
  {
    image: fortiniteImg,
    nome: 'Fortnite',
    slug: 'fortnite',
  },
  {
    image: lolImg,
    nome: 'League of Legends',
    slug: 'league-of-legends',
  },
  {
    image: valorantImg,
    nome: 'Valorant',
    slug: 'valorant',
  },
];

const GameList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo; // <- pega se veio para o "ranking"

  const handleGameClick = (slug) => {
    if (redirectTo === 'ranking') {
      navigate(`/games/${slug}/ranking`);
    } else {
      navigate(`/games/${slug}`);
    }
  };

  const isRanking = location.pathname.includes('/ranking');

<h1 className="text-white text-4xl font-bold">
  {isRanking ? 'Escolha o Jogo para ver o Ranking' : 'Jogos'}
</h1>


  return (
    <div className="min-h-screen bg-[#0F172A] px-6 py-8">
      <div className="max-w-screen-xl mx-auto flex flex-col items-start">
        {/* Título */}
        <div className="flex flex-col items-start w-full mb-4">
          <h1 className="text-white text-4xl font-bold">
            {redirectTo === 'ranking' ? 'Escolha o Jogo para ver o Ranking' : 'Jogos'}
          </h1>
        </div>

        {/* Barra de busca (ainda não funcional) */}
        <form className="w-full mb-8">
          {/* (mantido igual) */}
          {/* ... */}
        </form>

        {/* Lista de jogos */}
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 w-full">
          {gamesList.map((game, index) => (
            <div key={index} onClick={() => handleGameClick(game.slug)} className="cursor-pointer">
              <GamesCard {...game} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameList;
