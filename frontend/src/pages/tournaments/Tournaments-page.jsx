//página de tournaments

import React, { useState } from 'react';
import TorneioCard from '../../components/tournaments/Tournaments-Card';
import { useNavigate } from 'react-router-dom';
import { futurosTorneios, torneiosPassados } from '../../mockData';

const TorneiosFuturos = () => {
  const [filtroJogo, setFiltroJogo] = useState("todos");
  const navigate = useNavigate();

  const jogosDisponiveis = ["todos", ...new Set(futurosTorneios.map(t => t.jogo))];

  const torneiosFiltrados = filtroJogo === "todos"
    ? futurosTorneios
    : futurosTorneios.filter(t => t.jogo === filtroJogo);

  return (
    <div className="min-h-screen bg-[#0F172A] px-6 py-8">
      <div className="max-w-screen-xl mx-auto">

        {/* Filtros */}
        <div className="flex gap-4 mt-4 flex-wrap">
          {jogosDisponiveis.map((jogo) => (
            <button
              key={jogo}
              onClick={() => setFiltroJogo(jogo)}
              className={`px-4 py-2 rounded-full text-sm font-medium 
                ${filtroJogo === jogo ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"}`}
            >
              {jogo === "todos" ? "Todos os jogos" : jogo.charAt(0).toUpperCase() + jogo.slice(1)}
            </button>
          ))}
        </div>

        {/* Título e botão */}
        <div className="flex items-center justify-between mt-6">
          <h1 className="text-white text-2xl font-bold">Torneios Futuros</h1>
          <button onClick={() => navigate('/torneios-futuros')} className="text-sm text-blue-500 hover:underline">
            Ver mais
          </button>
        </div>

        {/* Torneios futuros filtrados */}
        <div className="grid gap-6 mt-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {torneiosFiltrados.map((torneio, index) => (
            <TorneioCard key={index} {...torneio} />
          ))}
        </div>

        {/* Título Torneios Passados */}
        <div className="flex mt-10 items-center justify-between">
          <h2 className="text-white text-2xl font-bold">Torneios Passados</h2>
          <button onClick={() => navigate('/torneios-passados')} className="text-sm text-blue-500 hover:underline">
            Ver mais
          </button>
        </div>

        {/* Cards dos torneios passados */}
        <div className="grid gap-6 mt-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {torneiosPassados.map((torneio, index) => (
            <TorneioCard key={index} {...torneio} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default TorneiosFuturos;
