import React from 'react';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';

const RankCard = ({ player, rank, sortBy }) => {
  const avatarUrl = player.avatar
    ? `${import.meta.env.VITE_API_URL}${player.avatar}`
    : 'https://via.placeholder.com/150';

  const getRankColor = (rank ) => {
    if (rank === 1) return 'border-yellow-400 shadow-lg shadow-yellow-400/20';
    if (rank === 2) return 'border-gray-400';
    if (rank === 3) return 'border-yellow-600';
    return 'border-gray-700';
  };

  const formatStatValue = (value, key) => {
    if (key === 'winRate') return `${(value * 100).toFixed(1)}%`;
    if (key.includes('avg')) return value.toFixed(2);
    return value;
  };

  return (
    <tr className="bg-gray-800/50 border-b border-gray-700/50 hover:bg-gray-700/50 transition-colors">
      <td className="px-4 py-3 font-bold text-xl text-center text-gray-300">
        {rank === 1 ? <Crown className="w-7 h-7 text-yellow-400 mx-auto" /> : rank}
      </td>
      <td className="px-6 py-3">
        <Link to={`/perfil/${player.userId}`} className="flex items-center gap-4 group">
          <img
            className={`w-14 h-14 rounded-full object-cover border-2 ${getRankColor(rank)}`}
            src={avatarUrl}
            alt={player.username}
          />
          <span className="font-bold text-lg text-white group-hover:text-purple-400 transition">
            {player.username}
          </span>
        </Link>
      </td>
      <td className="px-6 py-3 text-gray-300 text-base">{player.wins}</td>
      <td className="px-6 py-3 text-gray-300 text-base">{player.kills}</td>
      <td className="px-6 py-3 text-lg font-bold text-purple-400">
        {formatStatValue(player[sortBy], sortBy)}
      </td>
    </tr>
  );
};

export default RankCard;
