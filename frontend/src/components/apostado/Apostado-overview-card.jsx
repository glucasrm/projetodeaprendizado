//componente usado na págiina de overview de games, Overview-games-page
import { useNavigate } from 'react-router-dom';

const ApostadoCard = ({
  imagemA,
  imagemB,
  jogadorA,
  jogadorB,
  valor,
  data,
  horario,
  resultado,
  onClick
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-[#111827] rounded-lg shadow-md overflow-hidden w-full max-w-sm hover:shadow-lg cursor-pointer transition-all"
      onClick={onClick}
    >
      {/* Imagens dos jogadores/times */}
      <div className="flex justify-center items-center gap-4 p-4">
        {imagemA && (
          <img src={imagemA} alt={jogadorA} className="w-16 h-16 rounded-full object-cover" />
        )}
        <span className="text-white font-bold text-lg">VS</span>
        {imagemB && (
          <img src={imagemB} alt={jogadorB} className="w-16 h-16 rounded-full object-cover" />
        )}
      </div>

      {/* Informações da aposta */}
      <div className="p-4">
        <div className="text-sm text-gray-400">{data} às {horario}</div>

        <h3 className="text-lg font-bold text-white mt-1">{jogadorA} vs {jogadorB}</h3>

        <p className="text-sm text-green-400 font-semibold mt-1">Valor Apostado: {valor}</p>

        {resultado && (
          <p className="text-sm text-yellow-400 mt-1">🏆 Resultado: {resultado}</p>
        )}

        {/* Botão Ver Mais (opcional) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate('/apostas/detalhes');
          }}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm"
        >
          Ver detalhes
        </button>
      </div>
    </div>
  );
};

export default ApostadoCard;
