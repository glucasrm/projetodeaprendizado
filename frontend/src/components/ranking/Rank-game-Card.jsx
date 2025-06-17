{/*componente usado no ranking na página de visualização do game */}

import React from 'react';
import { useParams } from 'react-router-dom';

const RankCard = ({ place, foto, nome, profile, kills, wins }) => {
  return (
    <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 text-gray-900 dark:text-white">
      <td className="px-6 py-4 font-bold">{place}</td>

      <td className="px-8 py-4 font-bold">
        <a href={profile} className="flex items-center gap-7 hover:underline">
          <img
            src={foto}
            alt={nome}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-white">{nome}</span>
        </a>
      </td>

      <td className="px-7 py-4">{kills}</td>
      <td className="px-7 py-4">{wins}</td>

      {/* Remove coluna "Edit" se não for usar */}
      <td className="px-6 py-4"></td>
    </tr>
  );
};

export default RankCard;
