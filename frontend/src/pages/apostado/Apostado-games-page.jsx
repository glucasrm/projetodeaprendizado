// src/components/BettingForm.jsx (Exemplo)
import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom'; // Para redirecionar

const BettingForm = () => {
    const { user, login, loading, isInBetQueue, joinBetQueue, leaveQueue, currentMatch, setCurrentMatch } = useContext(UserContext);
    const navigate = useNavigate();

    const [betAmount, setBetAmount] = useState('');
    const [modality, setModality] = useState('1v1'); // Default
    const [platform, setPlatform] = useState('Mobile'); // Default
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Efeito para redirecionar quando um confronto é encontrado
    useEffect(() => {
        if (currentMatch && currentMatch.chatRoomId) {
            // Limpa o currentMatch do contexto para evitar redirecionamentos múltiplos
            // e permite que o componente de chat busque os detalhes da partida
            setCurrentMatch(null);
            navigate(`/confronto/${currentMatch.chatRoomId}`); // Redireciona para a tela do confronto/chat
        }
    }, [currentMatch, navigate, setCurrentMatch]);


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
            setError('O valor da aposta deve ser um número positivo.');
            return;
        }
        if (user.balance < parsedBetAmount) {
            setError('Saldo insuficiente para esta aposta.');
            return;
        }


        const result = await joinBetQueue(parsedBetAmount, modality, platform);
        if (result.success) {
            setMessage(result.message);
            // Redirecionamento já acontece no useEffect
        } else {
            setError(result.message);
        }
    };

    const handleLeaveQueue = async () => {
        setMessage('');
        setError('');
        const result = await leaveQueue('player');
        if (result.success) {
            setMessage(result.message);
        } else {
            setError(result.message);
        }
    };

    if (loading) {
        return <p className="text-center text-lg text-gray-400 mt-10">Carregando...</p>;
    }

    if (!login) {
        return <p className="text-center text-lg text-red-500 mt-10">Por favor, faça login para acessar as apostas.</p>;
    }

    return (
        <div className="bg-gray-800 text-gray-100 p-8 rounded-xl max-w-2xl mx-auto my-10 shadow-2xl font-sans">
            <h2 className="text-sky-400 text-4xl font-extrabold text-center mb-6 tracking-wide">Faça uma Aposta Direta</h2>

            {message && <p className="bg-green-600 text-white p-3 rounded-lg mb-5 text-center font-semibold">{message}</p>}
            {error && <p className="bg-red-600 text-white p-3 rounded-lg mb-5 text-center font-semibold">{error}</p>}

            {user && (
                <p className="text-center text-lg bg-gray-700 p-4 rounded-lg mb-6 border border-gray-600">
                    Seu Saldo: <span className="font-bold text-green-400">R$ {user.balance ? parseFloat(user.balance).toFixed(2) : '0.00'}</span>
                </p>
            )}

            {isInBetQueue ? (
                <div className="bg-gray-700 p-8 rounded-xl text-center border-2 border-sky-500 flex flex-col items-center justify-center space-y-5">
                    <p className="text-xl font-bold text-sky-400">Você está na fila de espera para uma aposta.</p>
                    <p className="text-lg text-gray-300 animate-pulse">Aguardando oponente...</p>
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
                        <label htmlFor="betAmount" className="mb-2 text-lg font-medium text-gray-300">Valor da Aposta:</label>
                        <input
                            type="number"
                            id="betAmount"
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            min="0.01"
                            step="0.01"
                            required
                            className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="modality" className="mb-2 text-lg font-medium text-gray-300">Modalidade:</label>
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
                        <label htmlFor="platform" className="mb-2 text-lg font-medium text-gray-300">Plataforma:</label>
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
                    <button
                        type="submit"
                        className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                    >
                        Entrar na Fila
                    </button>
                </form>
            )}
        </div>
    );
};

export default BettingForm;