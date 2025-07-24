{/*Card usado na aba de friends e teams na página de perfil */}

import { useNavigate } from 'react-router-dom';

const AmigoCard = ({ amigo, type = "amigo" }) => {
  const navigate = useNavigate();

  // Garante que o avatar seja sempre uma string válida, com fallback para placeholder
  const avatarSrc = amigo.avatar && typeof amigo.avatar === 'string' 
    ? amigo.avatar 
    : `https://placehold.co/100x100/aabbcc/ffffff?text=${amigo.name?.charAt(0) || '?'}`;

  const handleClick = () => {
    const path = type === "equipe" ? `/equipe/${amigo.id}` : `/profile/${amigo.id}`; // Ajuste para /profile
    navigate(path);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-gray-800 p-4 rounded-2xl shadow-md flex flex-col items-center cursor-pointer hover:shadow-lg hover:bg-gray-700 transition duration-300"
    >
      <img
        src={avatarSrc} // Usa a URL do avatar formatada
        alt={amigo.name}
        className="w-20 h-20 rounded-full mb-2 hover:scale-105 transition-transform duration-300 object-cover" // Adicionado object-cover
      />
      <h3 className="text-white font-semibold hover:text-blue-400 transition-colors duration-300 text-center">
        {amigo.name} {/* Usa o nome formatado */}
      </h3>
    </div>
  );
};

export default AmigoCard;
