//componente usado em Tournaments-next-page, Tournaments-past-page, Tournaments-games-page
import React from 'react';

const TorneioMiniCard = ({ imagem, nome, data, horario, local, tipo, slots, tags = [] }) => {
  return (
    <div className="flex gap-4 bg-[#1E293B] p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer">
      <img src={imagem} alt={nome} className="w-32 h-20 object-cover rounded-xl" />
      <div className="flex flex-col justify-between text-white w-full">
        <div>
          <p className="text-xs text-gray-400">{data} às {horario}</p>
          <h2 className="text-md font-bold">{nome}</h2>
          <p className="text-sm text-gray-300">
            {local} • {tipo} • {slots} slots
          </p>
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {tags.map((tag, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TorneioMiniCard;
