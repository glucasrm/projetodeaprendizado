import React from 'react';
import { futurosTorneios } from '../mockData'; // puxando do mockData
import TorneioMiniCard from '../components/TorneioMiniCard';

const TorneiosFuturosPage = () => {
  return (
    <div className="bg-[#0F172A] min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {futurosTorneios.map((torneio, index) => (
          <TorneioMiniCard
            key={index}
            {...torneio}
          />
        ))}
      </div>
    </div>
  );
};

export default TorneiosFuturosPage;
