import React from 'react';

const GameMiniCard = ({ image, nome, slug, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-[#1E293B] rounded-lg p-2 cursor-pointer 
                 transform transition duration-300 hover:scale-105 w-full"
    >
      {/* Imagem menor com proporção mantida */}
      <div className="w-full h-36 overflow-hidden rounded">
        <img
          src={image}
          alt={nome}
          className="w-full h-full object-cover"
        />
      </div>
      <h2 className="text-white mt-2 text-sm text-center font-medium">
        {nome}
      </h2>
    </div>
  );
};

export default GameMiniCard;
