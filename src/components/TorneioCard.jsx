import { useNavigate } from 'react-router-dom';

const TorneioCard = ({
  imagem,
  nome,
  data,
  horario,
  local,
  tipo,
  slots,
  tags = [],
  organizador,       // Novo!
  premiacao,         // Novo!
  onClick            // Novo!
}) => {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-[#111827] rounded-lg shadow-md overflow-hidden w-full max-w-sm hover:shadow-lg cursor-pointer transition-all"
      onClick={onClick}
    >
      {imagem && (
        <img src={imagem} alt="Banner do torneio" className="w-full h-36 object-cover" />
      )}
      
      <div className="p-4">
        <div className="text-sm text-gray-400">{data} às {horario}</div>

        <h3 className="text-lg font-bold text-white mt-1">{nome}</h3>

        {organizador && (
          <p className="text-xs text-gray-400 mt-1">Organizador: {organizador}</p>
        )}

        <p className="text-sm text-gray-300 mt-1">{local} • {tipo} • {slots} slots</p>

        {premiacao && (
          <p className="text-sm text-yellow-400 font-semibold mt-1">🏆 {premiacao}</p>
        )}

        {/* Tags */}
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="bg-blue-700 text-xs text-white px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Botão Ver Mais (opcional) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate('/torneio/detalhes');
          }}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm"
        >
          Ver mais detalhes
        </button>
      </div>
    </div>
  );
};

export default TorneioCard;
