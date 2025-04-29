import React from 'react';
import TorneioCard from '../components/TorneioCard';
import { useNavigate } from 'react-router-dom';
import { futurosTorneios, torneiosPassados } from '../mockData';

const TorneiosFuturos = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[#0F172A] px-6 py-8">
      <div className="max-w-screen-xl mx-auto">
        {/* Título e botão */}
        <div className="flex items-center justify-between">
          <h1 className="relative text-white text-2xl font-bold">Torneios Futuros</h1>
          <button onClick={() => navigate('/torneios-futuros')} className="text-sm text-blue-500 hover:underline">
            Ver mais
          </button>
        </div>

        {/* Torneios futuros */}
        <div className="grid gap-6 mt-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {futurosTorneios.map((torneio, index) => (
            <TorneioCard key={index} {...torneio} />
          ))}
        </div>

        {/* Título Torneios Passados */}
        <div className="flex mt-5 items-center justify-between">
          <h2 className="relative text-white text-2xl font-bold">Torneios Passados</h2>
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
