{/*componente usado na página home */}

import TorneiosCarousel from '../tournaments/Tournaments-home-Card'
import { Trophy, Calendar, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Main() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gray-900 text-white px-6 py-20 flex items-center justify-center">
      <div className="w-full max-w-5xl text-center md:text-left">
        {/* Hero Section */}
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Ganhe dinheiro <br className="hidden md:block" />
          <span className="text-blue-500">competindo em torneios</span>
        </h1>
      

        <p className="text-gray-300 text-lg md:text-xl mt-6 max-w-2xl">
          Junte-se à comunidade de gamers competitivos. Mostre suas habilidades, desafie jogadores de todo o Brasil e ganhe prêmios reais!
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/torneios")}
            className="bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            Ver Torneios
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/cadastro")}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-medium"
          >
            Criar Conta
          </button>
        
        </div>

        <TorneiosCarousel />

        {/* Benefícios */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Card 1 */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
            <Trophy size={40} className="text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ganhe troféus e destaque</h3>
            <p className="text-gray-400">
              Vença torneios e suba no ranking para se tornar uma lenda do jogo.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
            <Calendar size={40} className="text-green-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Competições diárias</h3>
            <p className="text-gray-400">
              Todos os dias, uma nova chance de mostrar seu talento e ganhar prêmios.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
            <TrendingUp size={40} className="text-pink-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Crie seus próprios torneios</h3>
            <p className="text-gray-400">
              Convide amigos, organize competições e domine sua própria arena!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
