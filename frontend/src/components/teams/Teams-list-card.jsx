

import React from 'react';
import { Users } from 'lucide-react';

const EquipeCard = ({ nome, avatar, membros }) => {
  return (
    <div className="bg-gray-800 rounded-2xl p-4 flex items-center gap-4 shadow-md hover:bg-gray-700 transition">
      <img src={avatar} alt={nome} className="w-16 h-16 rounded-full object-cover border-2 border-gray-600" />
      <div>
        <h3 className="text-lg font-semibold">{nome}</h3>
        <div className="flex items-center text-sm text-gray-300">
          <Users className="w-4 h-4 mr-1" />
          {membros} membro{membros !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default EquipeCard;
