//página de details dos tournaments, ele vai ser usado em todos os cards de tournaments
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { futurosTorneios, topJogadores } from "../../mockData";
import { Users, Calendar, MapPin, UserPlus, Trophy } from "lucide-react";

const logosJogos = {
  freefire: {
    nome: "Free Fire",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Garena_Free_Fire_logo.svg",
  },
  valorant: {
    nome: "Valorant",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Valorant_logo_-_pink_color_version.svg",
  },
};

const TorneioDetalhesPage = () => {
  const { id, jogo } = useParams();
  const [inscrito, setInscrito] = useState(false);
  const [torneio, setTorneio] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("visao");

  const userId = "123"; // Simulação de ID do usuário logado (substituir com ID real do contexto de auth)

  useEffect(() => {
    const encontrado = futurosTorneios.find(t => String(t.id) === id);
    if (encontrado) {
      const jogoInfo = logosJogos[encontrado.jogo] || { nome: 'Outro', logo: '/logo-generico.svg' };
      const isOwner = userId === encontrado.organizadorId; // Verifica se é o organizador
      setTorneio({ ...encontrado, participantes: [], jogoNome: jogoInfo.nome, jogoLogo: jogoInfo.logo, isOwner });
    }
  }, [id]);

  const handleInscricao = () => setInscrito(true);

  const trophyColors = ["text-yellow-400", "text-gray-300", "text-orange-500"];

  if (!torneio) return <div className="text-white p-6">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Banner */}
      <div className="h-52 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${torneio.imagem})` }}>
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center px-6">
          <div className="flex items-center gap-4">
            <img src={torneio.jogoLogo} alt="logo" className="w-10 h-10 object-contain" />
            <h1 className="text-3xl font-bold">{torneio.nome}</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            {[
              { chave: "visao", nome: "Visão Geral" },
              { chave: "jogadores", nome: "Jogadores" },
              { chave: "resultados", nome: "Resultados" },
            ].map(tab => (
              <button
                key={tab.chave}
                onClick={() => setAbaAtiva(tab.chave)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  abaAtiva === tab.chave ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
                }`}
              >
                {tab.nome}
              </button>
            ))}
          </div>

          {torneio.isOwner ? (
            <Link
              to={`/torneio/${id}/editar`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium shadow-lg"
            >
              Configurar Torneio
            </Link>
          ) : !inscrito ? (
            <button
              onClick={handleInscricao}
              className="flex items-center gap-2 bg-blue-950 hover:bg-blue-900 px-4 py-2 rounded-full text-white font-medium shadow-lg"
            >
              <UserPlus size={20} />
              Inscrever-se
            </button>
          ) : (
            <p className="text-green-400 font-semibold">Você está inscrito neste torneio!</p>
          )}
        </div>

        {abaAtiva === "visao" && (
          <>
            <p className="text-gray-300 mb-4">
              {torneio.descricao || "Torneio competitivo entre jogadores."}
            </p>

            {/* Informações do torneio */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-6">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                <Calendar className="mx-auto mb-2 text-blue-400" size={24} />
                <p className="text-sm text-gray-400">Data e Horário</p>
                <p className="text-white font-semibold">{torneio.data} às {torneio.horario}</p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                <Trophy className="mx-auto mb-2 text-yellow-400" size={24} />
                <p className="text-sm text-gray-400">Premiação</p>
                <p className="text-white font-semibold">{torneio.premiacao || "A definir"}</p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                <Users className="mx-auto mb-2 text-purple-400" size={24} />
                <p className="text-sm text-gray-400">Formato</p>
                <p className="text-white font-semibold">{torneio.formato || "Formato não especificado"}</p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                <Users className="mx-auto mb-2 text-green-400" size={24} />
                <p className="text-sm text-gray-400">Vagas</p>
                <p className="text-white font-semibold">
                  {(() => {
                    const formato = torneio.formato || "";
                    const participantes = torneio.participantes?.length || 0;
                    let totalSlots = 0;

                    if (formato === "1v1") totalSlots = 48;
                    else if (formato === "2v2") totalSlots = 24;
                    else if (formato === "4v4") totalSlots = 12;
                    else totalSlots = 0;

                    const tipo = formato === "1v1" ? "jogadores" : "times";
                    return totalSlots > 0
                      ? `${participantes}/${totalSlots} ${tipo}`
                      : `${participantes} inscritos`;
                  })()}
                </p>
              </div>
            </div>

            {/* Cards Secundários */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Top 3 Jogadores */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-4">Top 3 Jogadores</h3>
                <ul className="divide-y divide-gray-700">
                  {topJogadores.slice(0, 3).map((jogador, index) => (
                    <li key={jogador.id} className="py-3 first:pt-0 last:pb-0">
                      <Link
                        to={`/perfil/${jogador.id}`}
                        className="flex items-center gap-4 hover:bg-gray-700 p-2 rounded transition"
                      >
                        <div className="relative w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                          <Trophy
                            size={16}
                            className={`absolute -top-2 -right-2 ${trophyColors[index]}`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{jogador.nome}</p>
                          <p className="text-sm text-gray-400">Pontos: {jogador.pontos}</p>
                        </div>
                        <div className="text-green-400 font-semibold text-sm">
                          R${(torneio.premiacao ? parseInt(torneio.premiacao.replace(/\D/g, "")) : 0) / (index + 2)}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Configurações da Sala */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-4">Configurações da Sala</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><strong>Formato:</strong> {torneio.formato || "Não definido"}</li>
                  <li><strong>Pontuação:</strong> 10 pontos por vitória</li>
                  <li><strong>Partidas:</strong> Melhor de 3</li>
                  <li><strong>Servidor:</strong> BR</li>
                </ul>
              </div>
            </div>
          </>
        )}

        {abaAtiva === "jogadores" && (
          <>
            <h2 className="text-xl font-semibold mb-3">Participantes</h2>
            {torneio.participantes.length > 0 ? (
              <ul className="space-y-2">
                {torneio.participantes.map((p) => (
                  <li key={p.id} className="bg-gray-700 p-3 rounded-md">{p.nome}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">Nenhum participante ainda.</p>
            )}
          </>
        )}

        {abaAtiva === "resultados" && (
          <p className="text-gray-400">Resultados ainda não disponíveis.</p>
        )}
      </div>
    </div>
  );
};

export default TorneioDetalhesPage;
