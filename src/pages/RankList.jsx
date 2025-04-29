import React from 'react';
import { useParams } from 'react-router-dom';
import RankCard from '../components/RankingCard';

const RankingList = () => {
  const { slug } = useParams();

  const rankingsData = {
    freefire: [
      { place: 1, nome: 'Jogador FF 1', kills: 30, wins: 5, foto: '/caminho.jpg', profile: '/profile1' },
      { place: 2, nome: 'Jogador FF 2', kills: 25, wins: 4, foto: '/caminho.jpg', profile: '/profile2' },
    ],
    valorant: [
      { place: 1, nome: 'Jogador Valorant 1', kills: 40, wins: 6, foto: '/caminho.jpg', profile: '/profile1' },
      { place: 2, nome: 'Jogador Valorant 2', kills: 35, wins: 5, foto: '/caminho.jpg', profile: '/profile2' },
    ],
  };

  const players = rankingsData[slug] || [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-700 text-white">
          <tr>
            <th className="px-6 py-3">#</th>
            <th className="px-6 py-3">Jogador</th>
            <th className="px-6 py-3">Kills</th>
            <th className="px-6 py-3">Wins</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <RankCard
              key={index}
              place={player.place}
              foto={player.foto}
              nome={player.nome}
              profile={player.profile}
              kills={player.kills}
              wins={player.wins}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingList;
