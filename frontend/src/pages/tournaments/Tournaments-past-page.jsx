//página de tournaments-past
import React, { useState } from 'react';
import { torneiosPassados } from '../../mockData';
import TorneioMiniCard from '../../components/tournaments/Tournaments-MiniCard';

const TorneiosPassadosPage = () => {
  const [filtroJogo, setFiltroJogo] = useState("todos");
  const jogos = ["todos", ...new Set(torneiosPassados.map(t => t.jogo))];

  const filtrados = filtroJogo === "todos"
    ? torneiosPassados
    : torneiosPassados.filter(t => t.jogo === filtroJogo);

  return (
    <div className="bg-[#0F172A] min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap mb-6">
          {jogos.map(jogo => (
            <button
              key={jogo}
              onClick={() => setFiltroJogo(jogo)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium 
                ${filtroJogo === jogo ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}
            >
              {jogo === "todos" ? "Todos os jogos" : jogo.charAt(0).toUpperCase() + jogo.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          {filtrados.map((t) => (
            <TorneioMiniCard key={t.id} {...t} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TorneiosPassadosPage;
