// src/pages/TorneiosPassadosPage.jsx
import React from 'react';
import { torneiosPassados } from '../mockData'; // agora puxando direto do mockData!
import TorneioMiniCard from '../components/TorneioMiniCard'; // reaproveitando o componente MiniCard!

const TorneiosPassadosPage = () => {
  return (
    <div className="bg-[#0F172A] min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {torneiosPassados.map((t) => (
          <TorneioMiniCard
            key={t.id}
            imagem={t.imagem}
            nome={t.nome}
            data={t.data}
            horario={t.horario}
            local={t.local}
            tipo={t.tipo}
            slots={t.slots}
            tags={t.tags}
          />
        ))}
      </div>
    </div>
  );
};

export default TorneiosPassadosPage;
