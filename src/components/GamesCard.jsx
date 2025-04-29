import React from 'react';
import { Link } from 'react-router-dom';

const GamesCard = ({ image, nome, slug }) => {
  return (
    <Link to={`/games/${slug}`}>
      <div
        className="bg-[#1E293B] rounded-lg p-2 cursor-pointer 
                   transform transition duration-300 hover:scale-105"
      >
        {/* Contêiner da imagem com altura fixa */}
        <div className="w-full h-64 overflow-hidden rounded">
          <img
            src={image}
            alt={nome}
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-white mt-2 text-center font-semibold">{nome}</h2>
      </div>
    </Link>
  );
};

export default GamesCard;
