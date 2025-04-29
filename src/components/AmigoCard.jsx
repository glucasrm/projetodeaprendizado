import { useNavigate } from 'react-router-dom';

const AmigoCard = ({ amigo }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/perfil/${amigo.id}`); // Redireciona para o perfil do amigo
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-gray-800 p-4 rounded-2xl shadow-md flex flex-col items-center cursor-pointer hover:shadow-lg hover:bg-gray-700 transition duration-300"
    >
      <img
        src={amigo.avatar}
        alt={amigo.name}
        className="w-20 h-20 rounded-full mb-2 hover:scale-105 transition-transform duration-300"
      />
      <h3 className="text-white font-semibold hover:text-blue-400 transition-colors duration-300">
        {amigo.name}
      </h3>
    </div>
  );
};

export default AmigoCard;
