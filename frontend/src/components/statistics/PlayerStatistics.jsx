// src/components/statistics/PlayerStatistics.jsx

import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { useParams } from 'react-router-dom';

const PlayerStatistics = () => {
    const { userId } = useParams(); // Se for página de perfil específico
    const { user, getMyStatistics, getPlayerStatistics } = useContext(UserContext);
    
    const [statistics, setStatistics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGame, setSelectedGame] = useState('all');
    const [error, setError] = useState(null);

    // Determinar se é o próprio usuário ou outro jogador
    const isOwnProfile = !userId || userId === user?.id;
    const targetUserId = userId || user?.id;

    useEffect(() => {
        const fetchStatistics = async () => {
            if (!targetUserId) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const gameSlug = selectedGame === 'all' ? null : selectedGame;
                const result = isOwnProfile 
                    ? await getMyStatistics(gameSlug)
                    : await getPlayerStatistics(targetUserId, gameSlug);
                
                if (result.success) {
                    setStatistics(result.statistics);
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setError('Erro ao carregar estatísticas.');
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [targetUserId, selectedGame, isOwnProfile, getMyStatistics, getPlayerStatistics]);

    // Obter lista de jogos únicos
    const availableGames = [...new Set(statistics.map(stat => stat.gameSlug))];

    if (loading) {
        return (
            <div className="bg-gray-800 rounded-lg p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-700 rounded mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-800 rounded-lg p-6">
                <div className="text-center text-red-400">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (statistics.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">📊 Estatísticas</h3>
                <div className="text-center text-gray-400">
                    <p>Nenhuma estatística encontrada.</p>
                    <p className="text-sm mt-2">Jogue algumas partidas para ver suas estatísticas aqui!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">📊 Estatísticas</h3>
                
                {/* Filtro por jogo */}
                {availableGames.length > 1 && (
                    <select
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                    >
                        <option value="all">Todos os jogos</option>
                        {availableGames.map(game => (
                            <option key={game} value={game}>
                                {game.charAt(0).toUpperCase() + game.slice(1)}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="space-y-6">
                {statistics.map((stat) => (
                    <div key={stat.gameSlug} className="border border-gray-700 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-purple-400 mb-4">
                            🎮 {stat.gameSlug.charAt(0).toUpperCase() + stat.gameSlug.slice(1)}
                        </h4>
                        
                        {/* Estatísticas Principais */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{stat.totalMatches}</div>
                                <div className="text-sm text-gray-400">Partidas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">{stat.wins + stat.winsWO}</div>
                                <div className="text-sm text-gray-400">Vitórias</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-400">{stat.losses + stat.lossesWO}</div>
                                <div className="text-sm text-gray-400">Derrotas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-400">{stat.derived.winRate}%</div>
                                <div className="text-sm text-gray-400">Taxa de Vitória</div>
                            </div>
                        </div>

                        {/* Detalhamento de Vitórias/Derrotas */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                            <div className="text-center">
                                <div className="text-lg font-semibold text-green-300">{stat.wins}</div>
                                <div className="text-xs text-gray-500">Vitórias Normais</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold text-green-500">{stat.winsWO}</div>
                                <div className="text-xs text-gray-500">Vitórias W.O</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold text-red-300">{stat.losses}</div>
                                <div className="text-xs text-gray-500">Derrotas Normais</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold text-red-500">{stat.lossesWO}</div>
                                <div className="text-xs text-gray-500">Derrotas W.O</div>
                            </div>
                        </div>

                        {/* Estatísticas Opcionais */}
                        <div className="border-t border-gray-700 pt-4">
                            <h5 className="text-md font-medium text-gray-300 mb-3">Estatísticas de Desempenho</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Kills */}
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-orange-400">
                                        {stat.derived.avgKills !== null ? stat.derived.avgKills : 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-400">Kills Médios</div>
                                    <div className="text-xs text-gray-500">
                                        {stat.matchesWithKills > 0 
                                            ? `${stat.kills} total em ${stat.matchesWithKills} partidas`
                                            : 'Nenhum dado disponível'
                                        }
                                    </div>
                                </div>

                                {/* Assistências */}
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-blue-400">
                                        {stat.derived.avgAssists !== null ? stat.derived.avgAssists : 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-400">Assists Médios</div>
                                    <div className="text-xs text-gray-500">
                                        {stat.matchesWithAssists > 0 
                                            ? `${stat.assists} total em ${stat.matchesWithAssists} partidas`
                                            : 'Nenhum dado disponível'
                                        }
                                    </div>
                                </div>

                                {/* Capas */}
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-cyan-400">
                                        {stat.derived.avgCaps !== null ? stat.derived.avgCaps : 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-400">Capas Médios</div>
                                    <div className="text-xs text-gray-500">
                                        {stat.matchesWithCaps > 0 
                                            ? `${stat.caps} total em ${stat.matchesWithCaps} partidas`
                                            : 'Nenhum dado disponível'
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Barra de Progresso da Taxa de Vitória */}
                        <div className="mt-4">
                            <div className="flex justify-between text-sm text-gray-400 mb-1">
                                <span>Taxa de Vitória</span>
                                <span>{stat.derived.winRate}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(stat.derived.winRate, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Nota sobre Precisão */}
            <div className="mt-6 p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
                <p className="text-blue-300 text-sm">
                    <strong>ℹ️ Sobre a Precisão:</strong> As médias de kills, assistências e capas são calculadas 
                    apenas com base nas partidas onde essas informações foram fornecidas pelo mediador, 
                    garantindo maior precisão dos dados.
                </p>
            </div>
        </div>
    );
};

export default PlayerStatistics;

