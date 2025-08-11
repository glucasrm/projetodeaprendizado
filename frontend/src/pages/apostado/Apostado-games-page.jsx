// src/pages/apostado/Apostado-games-page.jsx (ATUALIZADO)
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ApostadoPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const handleApostar = () => {
    navigate(`/games/${slug}/fila`);
  };

  const handleMediar = () => {
    // Navega para a página de mediação
    navigate(`/games/${slug}/mediacao`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Página de Apostas</h1>
      
      <div className="text-center mb-8">
        <p className="text-gray-300 text-lg mb-2">Escolha como você quer participar:</p>
        <p className="text-gray-400 text-sm">Aposte em partidas ou medie confrontos entre jogadores</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button
          onClick={handleApostar}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          <div className="text-center">
            <div className="text-2xl mb-1">🎯</div>
            <div className="font-bold text-lg">Apostar</div>
            <div className="text-sm text-blue-200">Faça suas apostas</div>
          </div>
        </button>

        <button
          onClick={handleMediar}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          <div className="text-center">
            <div className="text-2xl mb-1">⚖️</div>
            <div className="font-bold text-lg">Mediar</div>
            <div className="text-sm text-purple-200">Arbitre partidas</div>
          </div>
        </button>
      </div>

      <div className="mt-8 text-center max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-blue-400 font-bold mb-2">Como Apostador</h3>
            <p>Entre na fila, escolha seu valor de aposta e modalidade. Seja conectado com outros jogadores para partidas emocionantes.</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-purple-400 font-bold mb-2">Como Mediador</h3>
            <p>Ajude a garantir partidas justas, resolva disputas e confirme resultados. Ganhe recompensas por sua mediação.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
