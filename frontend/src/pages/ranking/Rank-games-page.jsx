import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import RankCard from '../../components/ranking/Rank-game-Card';
import { Crown, Target, BarChart, Percent } from 'lucide-react';

const RankingList = () => {
  const { slug } = useParams();
  const { getPlayersRanking } = useContext(UserContext);

  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('winRate');

  const sortOptions = [
    { key: 'winRate', label: 'Taxa de Vitória', icon: <Percent size={16} /> },
    { key: 'wins', label: 'Vitórias', icon: <Crown size={16} /> },
    { key: 'kills', label: 'Kills', icon: <Target size={16} /> },
    { key: 'totalMatches', label: 'Partidas', icon: <BarChart size={16} /> },
  ];

  const fetchRanking = useCallback(async () => {
    if (!getPlayersRanking) return;
    setLoading(true);
    setError('');
    try {
      const response = await getPlayersRanking(slug, sortBy);
      if (response.success) {
        setRanking(response.ranking);
      } else {
        setError(response.message || 'Não foi possível carregar o ranking.');
      }
    } catch (err) {
      console.error("Erro ao buscar ranking:", err);
      setError('Erro de conexão ao buscar o ranking.');
    } finally {
      setLoading(false);
    }
  }, [slug, sortBy, getPlayersRanking]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  const getSortLabel = () => sortOptions.find(opt => opt.key === sortBy)?.label || 'Ordenar por';

  return (
    <div className="bg-gray-900/50 p-4 md:p-6 rounded-xl border border-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-white">Ranking de Partidas Apostadas</h2>
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Ordenar por:</span>
            <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
                {sortOptions.map(opt => (
                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
            </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Carregando ranking...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-400">{error}</div>
      ) : ranking.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Nenhum jogador classificado para este jogo ainda.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-800/0 text-gray-400">
              <tr>
                <th className="px-4 py-3 text-center w-16">#</th>
                <th className="px-6 py-3">Jogador</th>
                <th className="px-6 py-3">Vitórias</th>
                <th className="px-6 py-3">Kills</th>
                <th className="px-6 py-3 text-purple-400">{getSortLabel()}</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((player, index) => (
                <RankCard
                  key={player.userId}
                  player={player}
                  rank={index + 1}
                  sortBy={sortBy}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RankingList;
