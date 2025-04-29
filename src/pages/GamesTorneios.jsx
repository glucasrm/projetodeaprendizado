// src/pages/GamesTorneios.jsx
import React from 'react';
import { futurosTorneios } from '../mockData'; // Caminho relativo para onde está seu mockData.js
import TorneioMiniCard from '../components/TorneioMiniCard'; // Importando o MiniCard

const GamesTorneios = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Futuros Torneios</h2>
      <div className="flex flex-col gap-6">
        {futurosTorneios.map((torneio) => (
          <TorneioMiniCard
            key={torneio.id}
            imagem={torneio.imagem}
            nome={torneio.nome}
            data={torneio.data}
            horario={torneio.horario}
            local={torneio.local}
            tipo={torneio.tipo}
            slots={torneio.slots}
            tags={torneio.tags}
          />
        ))}
      </div>
    </div>
  );
};

export default GamesTorneios;
