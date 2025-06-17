//página de torneios na game-profile-page
import React from 'react';
import { futurosTorneios } from '../../mockData'; // Caminho relativo para onde está seu mockData.js
import TorneioMiniCard from '../../components/tournaments/Tournaments-MiniCard'; // Importando o MiniCard

const GamesTorneios = () => {
  // Filtra apenas os torneios cujo jogo seja "freefire"
  const torneiosFreeFire = futurosTorneios.filter(
    (torneio) => torneio.jogo && torneio.jogo.toLowerCase() === "freefire"
  );
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Futuros Torneios de Free Fire</h2>
      <div className="flex flex-col gap-6">
        {torneiosFreeFire.map((torneio) => (
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
        {torneiosFreeFire.length === 0 && (
          <p className="text-white">Nenhum torneio de Free Fire encontrado.</p>
        )}
      </div>
    </div>
  );
};


export default GamesTorneios;
