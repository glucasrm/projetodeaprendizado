import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import GamesCard from '../../components/games/Games-list-minicard';
import { useParams } from "react-router-dom";


const games = [
  {
    nome: 'Free Fire',
    slug: 'free-fire',
    image: 'https://static.wikia.nocookie.net/freefire/images/2/2a/Wallpaperfreefire.jpg',
  },
  {
    nome: 'Valorant',
    slug: 'valorant',
    image: 'https://wallpapers.com/images/hd/valorant-pc-poster-xzycb13go8n6q2h8.jpg',
  },
];

const CreateOptionsGrid = () => {
  const navigate = useNavigate();
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [showGameSelector, setShowGameSelector] = useState(false);
  const [showTournamentDetails, setShowTournamentDetails] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [tournamentName, setTournamentName] = useState('');
  const [mode, setMode] = useState('');
  const [platform, setPlatform] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [step, setStep] = useState(1);

  const handleCreateTeam = () => {
    if (!teamName.trim()) return;
    const fakeId = Math.floor(Math.random() * 10000);
    navigate(`/equipes/${fakeId}`, { state: { teamName } });
  };

  const handleGameSelect = (game) => {
    setShowGameSelector(false);
    setSelectedGame(game);
    setShowTournamentDetails(true);
  };

  const options = [
    {
      title: 'Criar Equipe',
      image: 'https://static.vecteezy.com/ti/vetor-gratis/p1/29301007-icone-de-controle-de-jogo-com-design-plano-vetor.jpg',
      description: 'Monte sua equipe para competir em torneios.',
      onClick: () => setShowTeamForm(true),
    },
    {
      title: 'Criar Torneio',
      image: 'https://static.vecteezy.com/ti/vetor-gratis/p3/11896353-trofeu-de-jogo-competicao-de-jogo-torneio-de-jogo-vetor.jpg',
      description: 'Organize seu próprio torneio competitivo.',
      onClick: () => setShowGameSelector(true),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">O que deseja criar?</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {options.map((option, index) => (
            <div
              key={index}
              onClick={option.onClick}
              className="bg-gray-900 hover:bg-gray-800 transition cursor-pointer rounded-2xl overflow-hidden shadow-lg group"
            >
              <div
                className="relative h-56 bg-cover bg-center"
                style={{ backgroundImage: `url(${option.image})` }}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition"></div>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-semibold mb-2">{option.title}</h2>
                <p className="text-gray-400 text-sm">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showTeamForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
            <button
              onClick={() => setShowTeamForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X />
            </button>
            <h2 className="text-2xl font-semibold mb-4">Nome da Equipe</h2>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Digite o nome da equipe"
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCreateTeam}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition"
            >
              Criar Equipe
            </button>
          </div>
        </div>
      )}

      {showGameSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white rounded-2xl p-6 w-full max-w-2xl relative shadow-2xl">
            <button
              onClick={() => setShowGameSelector(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X />
            </button>
            <h2 className="text-2xl font-semibold mb-6 text-center">Escolha o Jogo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {games.map((game) => (
                <div key={game.slug} onClick={() => handleGameSelect(game)}>
                  <GamesCard {...game} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showTournamentDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
            <button
              onClick={() => setShowTournamentDetails(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X />
            </button>

            {step === 1 && (
              <>
                <h2 className="text-2xl font-semibold mb-4 text-center">Nome do Torneio</h2>
                <input
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  placeholder="Nome do Torneio"
                  className="w-full p-3 mb-4 rounded-xl bg-gray-800 border border-gray-700"
                />
                <p className="font-semibold mb-2">Modalidade:</p>
                <div className="flex gap-3 mb-4">
                  {['1v1', '2v2', '4v4'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`px-4 py-2 rounded-xl border ${mode === m ? 'bg-blue-600' : 'bg-gray-800'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <p className="font-semibold mb-2">Plataforma:</p>
                <div className="flex gap-3">
                  {['Misto', 'Mobile', 'Emulador'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`px-4 py-2 rounded-xl border ${platform === p ? 'bg-blue-600' : 'bg-gray-800'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  disabled={!tournamentName || !mode || !platform}
                  onClick={() => setStep(2)}
                  className="mt-6 w-full bg-green-600 hover:bg-green-700 py-2 rounded-xl transition"
                >
                  Próximo
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-2xl font-semibold mb-4 text-center">Data e Hora</h2>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 mb-4 rounded-xl bg-gray-800 border border-gray-700"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-3 mb-4 rounded-xl bg-gray-800 border border-gray-700"
                />
                <button
                  disabled={!date || !time}
                  onClick={() => {
                    const fakeId = Math.floor(Math.random() * 10000);
                    navigate(`/torneios/${selectedGame.slug}/${fakeId}/painel`, {
                      state: {
                        game: selectedGame,
                        tournamentName,
                        mode,
                        platform,
                        date,
                        time,
                      },
                    });
                    
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl transition"
                >
                  Criar Torneio
                </button>

              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOptionsGrid;
