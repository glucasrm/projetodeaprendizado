import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';
import { Swords, ShieldCheck, Trophy, Target, BarChart2 } from 'lucide-react';

// Componente para cada card de estatística
const StatCard = ({ icon, label, value, suffix = '', color = 'text-purple-400' }) => (
    <div className="bg-gray-800 p-6 rounded-xl flex flex-col items-center justify-center text-center">
        <div className={`mb-3 ${color}`}>{icon}</div>
        <p className="text-3xl font-bold text-white">{value}{suffix}</p>
        <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
);

// Componente principal da página de estatísticas
const ProfileStats = () => {
    const { userId: paramsUserId } = useParams();
    const { user } = useContext(UserContext);
    
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filtros dinâmicos
    const [period, setPeriod] = useState('all_time'); // 'all_time' ou 'monthly'
    const [gameSlug, setGameSlug] = useState(''); // '' para todos os jogos

    const targetUserId = paramsUserId || user?.id;

    const fetchStats = useCallback(async () => {
        if (!targetUserId) return;

        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({ period });
            if (gameSlug) {
                params.append('gameSlug', gameSlug);
            }

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/matchmaking/statistics/player/${targetUserId}/summary?${params.toString()}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setStats(response.data.summary);
            } else {
                setError('Não foi possível carregar as estatísticas.');
            }
        } catch (err) {
            console.error("Erro ao buscar estatísticas:", err);
            setError('Erro de conexão ao buscar estatísticas.');
        } finally {
            setLoading(false);
        }
    }, [targetUserId, period, gameSlug]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return (
        <div className="max-w-5xl mx-auto py-8">
            {/* Cabeçalho com Filtros */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold text-white">Resumo de Desempenho</h2>
                <div className="flex items-center gap-4">
                    {/* Filtro de Jogo (Exemplo) */}
                    <select 
                        value={gameSlug} 
                        onChange={(e) => setGameSlug(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">Todos os Jogos</option>
                        <option value="freefire">Free Fire</option>
                        <option value="cod-mobile">COD Mobile</option>
                        {/* Adicione outros jogos aqui */}
                    </select>

                    {/* Filtro de Período */}
                    <div className="flex bg-gray-800 rounded-md p-1 border border-gray-700">
                        <button 
                            onClick={() => setPeriod('monthly')}
                            className={`px-4 py-1 text-sm font-medium rounded ${period === 'monthly' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        >
                            Mensal
                        </button>
                        <button 
                            onClick={() => setPeriod('all_time')}
                            className={`px-4 py-1 text-sm font-medium rounded ${period === 'all_time' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        >
                            Total
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid de Estatísticas */}
            {loading ? (
                <div className="text-center text-gray-400">Carregando estatísticas...</div>
            ) : error ? (
                <div className="text-center text-red-400">{error}</div>
            ) : stats ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <StatCard icon={<BarChart2 size={32} />} label="Partidas Jogadas" value={stats.totalMatches} />
                    <StatCard icon={<Trophy size={32} />} label="Vitórias" value={stats.wins} />
                    <StatCard icon={<Target size={32} />} label="Total de Kills" value={stats.kills} />
                    <StatCard icon={<ShieldCheck size={32} />} label="Taxa de Vitória" value={stats.winRate} suffix="%" />
                    
                    {/* Card especial para Capas com barra de progresso */}
                    <div className="bg-gray-800 p-6 rounded-xl col-span-2 md:col-span-3 lg:col-span-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-purple-400" size={24} />
                                <p className="font-medium text-white">Média de "Capas"</p>
                            </div>
                            <p className="text-2xl font-bold text-white">{stats.capsPercentage}<span className="text-lg">%</span></p>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-3">
                            <div 
                                className="bg-purple-600 h-2.5 rounded-full" 
                                style={{ width: `${stats.capsPercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Média calculada com base em {stats.caps} capas em partidas onde o dado foi registrado.
                        </p>
                    </div>
                </div>
            ) : (
                 <div className="text-center text-gray-400">Nenhuma estatística encontrada para os filtros selecionados.</div>
            )}
        </div>
    );
};

export default ProfileStats;
