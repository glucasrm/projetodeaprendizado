// src/components/friends/Friend-teams-Card.jsx (ou onde quer que seu AmigoCard esteja)
import React from 'react';
import { Link } from 'react-router-dom';


const AmigoCard = ({ amigo }) => {
  // Certifique-se de que 'amigo' tem 'id', 'name' e 'avatar'
  const { id, name, avatar } = amigo;

  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col items-center p-4">
      <Link to={`/perfil/${id}`} className="flex flex-col items-center"> {/* AQUI É A MUDANÇA! */}
        <img
          src={avatar}
          alt={`Avatar de ${name}`}
          className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-blue-500"
        />
        <h3 className="text-lg font-semibold text-white text-center">{name}</h3>
      </Link>
      {/* Adicione botões ou outras interações aqui, se necessário */}
    </div>
  );
};

export default AmigoCard;