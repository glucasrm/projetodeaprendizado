// src/pages/apostado/Fila-games-page.jsx (VERSÃO MELHORADA)
import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { useNavigate, useParams } from 'react-router-dom';
import MatchRedirect from '../../components/apostado/MatchRedirect';

const BettingForm = () => {
    const { user, login, isInBetQueue, joinBetQueue, leaveQueue, currentMatch, loading } = useContext(UserContext);
    const navigate = useNavigate();
    const { slug } = useParams(); 

    const BET_OPTIONS = [2, 3, 5, 7, 10, 15, 20, 50, 100];
    const [betAmount, setBetAmount] = useState(BET_OPTIONS[0].toString());
    const [modality, setModality] = useState('1v1');
    const [platform, setPlatform] = useState('Mobile');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Função para lidar com redirecionamento customizado
    const handleRedirect = (path, match, userType) => {
        console.log(`[BettingForm] Redirecionando jogador para: ${path}`);
        setMessage('Oponente encontrado! Redirecionando para o chat...');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!user || !login) {
            setError('Você precisa estar logado para fazer uma aposta.');
            return;
        }

        const parsedBetAmount = parseFloat(betAmount);
        if (isNaN(parsedBetAmount) || parsedBetAmount <= 0) {
            setError('Por favor, selecione um valor de aposta válido.');
            return;
        }
        
        if (user.balance < parsedBetAmount) {
            setError('Saldo insuficiente para esta aposta.');
            return;
        }

        try {
            // Passando o 'slug' do jogo para a função do contexto
            const result = await joinBetQueue(parsedBetAmount, modality, platform, slug);
            if (result.success) {
                setMessage(result.message);
                
                // Se já encontrou uma partida imediatamente
                if (result.matchId) {
                    setMessage('Oponente encontrado! Redirecionando...');
                }
            } else {
                setError(result.message || 'Erro ao entrar na fila.');
            }
        } catch (err) {
            setError('Erro na comunicação com o servidor.');
            console.error('[BettingForm] Erro ao entrar na fila:', err);
        }
    };

    const handleLeaveQueue = async () => {
        setMessage('');
        setError('');
        
        try {
            const result = await leaveQueue('player');
            if (result.success) {
                setMessage(result.message);
            } else {
                setError(result.message || 'Erro ao sair da fila.');
            }
        } catch (err) {
            setError('Erro na comunicação com o servidor.');
            console.error('[BettingForm] Erro ao sair da fila:', err);
        }
    };

    // Verificação de loading
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto mb-4"></div>
                    <p className="text-lg">Carregando...</p>
                </div>
            </div>
        );
    }

    // Verificação de login
    if (!login) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <p className="text-xl mb-4">Você precisa estar logado para fazer apostas.</p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="bg-sky-600 hover:bg-sky-700 px-6 py-2 rounded-lg"
                    >
                        Fazer Login
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <MatchRedirect 
            userType="player" 
            allowedPaths={['/partida/chat/', '/mediacao/chat/']}
            onRedirect={handleRedirect}
            showLoadingOnRedirect={true}
        >
            <div className="bg-gray-800 text-gray-100 p-8 rounded-xl max-w-2xl mx-auto my-10 shadow-2xl font-sans">
                <h2 className="text-sky-400 text-4xl font-extrabold text-center mb-6 tracking-wide">
                    Faça uma Aposta Direta
                </h2>

                {message && (
                    <p className="bg-green-600 text-white p-3 rounded-lg mb-5 text-center font-semibold">
                        {message}
                    </p>
                )}
                {error && (
                    <p className="bg-red-600 text-white p-3 rounded-lg mb-5 text-center font-semibold">
                        {error}
                    </p>
                )}

                {user && (
                    <p className="text-center text-lg bg-gray-700 p-4 rounded-lg mb-6 border border-gray-600">
                        Seu Saldo: <span className="font-bold text-green-400">
                            R$ {user.balance ? parseFloat(user.balance).toFixed(2) : '0.00'}
                        </span>
                    </p>
                )}

                {isInBetQueue ? (
                    <div className="bg-gray-700 p-8 rounded-xl text-center border-2 border-sky-500 flex flex-col items-center justify-center space-y-5">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
                            <p className="text-xl font-bold text-sky-400">Você está na fila de espera</p>
                        </div>
                        <p className="text-lg text-gray-300">Aguardando oponente...</p>
                        
                        {/* Mostrar detalhes da aposta atual */}
                        <div className="bg-gray-600 p-4 rounded-lg">
                            <p className="text-sm text-gray-300 mb-2">Detalhes da sua aposta:</p>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-semibold">Valor:</span> R$ {parseFloat(betAmount).toFixed(2)}</p>
                                <p><span className="font-semibold">Modalidade:</span> {modality}</p>
                                <p><span className="font-semibold">Plataforma:</span> {platform}</p>
                                {slug && <p><span className="font-semibold">Jogo:</span> {slug}</p>}
                            </div>
                        </div>
                        
                        <button
                            onClick={handleLeaveQueue}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                        >
                            Sair da Fila
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
                        <div className="flex flex-col">
                            <label htmlFor="betAmount" className="mb-2 text-lg font-medium text-gray-300">
                                Valor da Aposta:
                            </label>
                            <select
                                id="betAmount"
                                value={betAmount}
                                onChange={(e) => setBetAmount(e.target.value)}
                                required
                                className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 appearance-none"
                            >
                                {BET_OPTIONS.map((amount) => (
                                    <option key={amount} value={amount.toString()}>
                                        R$ {amount.toFixed(2)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex flex-col">
                            <label htmlFor="modality" className="mb-2 text-lg font-medium text-gray-300">
                                Modalidade:
                            </label>
                            <select
                                id="modality"
                                value={modality}
                                onChange={(e) => setModality(e.target.value)}
                                className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 appearance-none"
                            >
                                <option value="1v1">1x1</option>
                                <option value="2v2">2x2</option>
                                <option value="3v3">3x3</option>
                                <option value="4v4">4x4</option>
                            </select>
                        </div>
                        
                        <div className="flex flex-col">
                            <label htmlFor="platform" className="mb-2 text-lg font-medium text-gray-300">
                                Plataforma:
                            </label>
                            <select
                                id="platform"
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value)}
                                className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 appearance-none"
                            >
                                <option value="Mobile">Mobile</option>
                                <option value="Emulador">Emulador</option>
                            </select>
                        </div>

                        {/* Informações sobre a aposta */}
                        <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                            <h3 className="text-sky-400 font-bold mb-2">Como funciona:</h3>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li>• Você será pareado com um oponente de nível similar</li>
                                <li>• O vencedor leva o valor total da aposta (menos taxas)</li>
                                <li>• Um mediador supervisionará a partida</li>
                                <li>• Siga as regras para evitar penalizações</li>
                            </ul>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={!user || user.balance < parseFloat(betAmount)}
                            className="bg-sky-500 hover:bg-sky-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                        >
                            {user && user.balance < parseFloat(betAmount) ? 'Saldo Insuficiente' : 'Entrar na Fila'}
                        </button>
                    </form>
                )}
            </div>
        </MatchRedirect>
    );
};

export default BettingForm;
