// src/pages/mediation/Mediation-page.jsx
import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const MediationPage = () => {
    const { user, login, isInMediationQueue, joinMediationQueue, leaveQueue, currentMatch, loading } = useContext(UserContext);
    const navigate = useNavigate();

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [selectedModalities, setSelectedModalities] = useState(['1v1']);
    const [selectedPlatforms, setSelectedPlatforms] = useState(['Mobile']);

    const MODALITIES = [
        { value: '1v1', label: '1x1' },
        { value: '2v2', label: '2x2' },
        { value: '3v3', label: '3x3' },
        { value: '4v4', label: '4x4' }
    ];

    const PLATFORMS = [
        { value: 'Mobile', label: 'Mobile' },
        { value: 'Emulador', label: 'Emulador' }
    ];

    useEffect(() => {
        // Redireciona se um confronto for encontrado e houver um chatRoomId
        if (currentMatch && currentMatch.chatRoomId) {
            navigate(`/mediacao/chat/${currentMatch.chatRoomId}`);
        }
    }, [currentMatch, navigate]);

    const handleModalityChange = (modality) => {
        setSelectedModalities(prev => {
            if (prev.includes(modality)) {
                return prev.filter(m => m !== modality);
            } else {
                return [...prev, modality];
            }
        });
    };

    const handlePlatformChange = (platform) => {
        setSelectedPlatforms(prev => {
            if (prev.includes(platform)) {
                return prev.filter(p => p !== platform);
            } else {
                return [...prev, platform];
            }
        });
    };

    const handleJoinQueue = async () => {
        setMessage('');
        setError('');

        if (!user || !login) {
            setError('Você precisa estar logado para mediar partidas.');
            return;
        }

        if (selectedModalities.length === 0) {
            setError('Selecione pelo menos uma modalidade.');
            return;
        }

        if (selectedPlatforms.length === 0) {
            setError('Selecione pelo menos uma plataforma.');
            return;
        }

        // Aqui você chamaria a função do contexto para entrar na fila de mediação
        // const result = await joinMediationQueue(selectedModalities, selectedPlatforms);
        
        // Por enquanto, simulamos a entrada na fila
        const result = { success: true, message: 'Você entrou na fila de mediação!' };
        
        if (result.success) {
            setMessage(result.message);
        } else {
            setError(result.message);
        }
    };

    const handleLeaveQueue = async () => {
        setMessage('');
        setError('');
        
        // Aqui você chamaria a função do contexto para sair da fila
        // const result = await leaveQueue('mediator');
        
        // Por enquanto, simulamos a saída da fila
        const result = { success: true, message: 'Você saiu da fila de mediação.' };
        
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
        return <p className="text-center text-lg text-red-500 mt-10">Por favor, faça login para acessar a mediação.</p>;
    }

    return (
        <div className="bg-gray-800 text-gray-100 p-8 rounded-xl max-w-2xl mx-auto my-10 shadow-2xl font-sans">
            <h2 className="text-purple-400 text-4xl font-extrabold text-center mb-6 tracking-wide">
                Mediação de Partidas
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
                <div className="text-center bg-gray-700 p-4 rounded-lg mb-6 border border-gray-600">
                    <p className="text-lg">
                        Bem-vindo, <span className="font-bold text-purple-400">{user.username}</span>
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                        Como mediador, você ajudará a garantir partidas justas e organizadas.
                    </p>
                </div>
            )}

            {isInMediationQueue ? (
                <div className="bg-gray-700 p-8 rounded-xl text-center border-2 border-purple-500 flex flex-col items-center justify-center space-y-5">
                    <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                        <p className="text-xl font-bold text-purple-400">Você está na fila de mediação</p>
                    </div>
                    <p className="text-lg text-gray-300">Aguardando partida para mediar...</p>
                    <div className="bg-gray-600 p-4 rounded-lg">
                        <p className="text-sm text-gray-300 mb-2">Modalidades selecionadas:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {selectedModalities.map(mod => (
                                <span key={mod} className="bg-purple-600 px-3 py-1 rounded-full text-sm">
                                    {MODALITIES.find(m => m.value === mod)?.label}
                                </span>
                            ))}
                        </div>
                        <p className="text-sm text-gray-300 mb-2 mt-3">Plataformas selecionadas:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {selectedPlatforms.map(plat => (
                                <span key={plat} className="bg-purple-600 px-3 py-1 rounded-full text-sm">
                                    {plat}
                                </span>
                            ))}
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
                <div className="space-y-6">
                    {/* Seleção de Modalidades */}
                    <div className="flex flex-col">
                        <label className="mb-3 text-lg font-medium text-gray-300">
                            Modalidades que você pode mediar:
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {MODALITIES.map((modality) => (
                                <label
                                    key={modality.value}
                                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition duration-200 ${
                                        selectedModalities.includes(modality.value)
                                            ? 'border-purple-500 bg-purple-900/30'
                                            : 'border-gray-600 bg-gray-700 hover:border-purple-400'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedModalities.includes(modality.value)}
                                        onChange={() => handleModalityChange(modality.value)}
                                        className="mr-3 w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-gray-100">{modality.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Seleção de Plataformas */}
                    <div className="flex flex-col">
                        <label className="mb-3 text-lg font-medium text-gray-300">
                            Plataformas que você pode mediar:
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {PLATFORMS.map((platform) => (
                                <label
                                    key={platform.value}
                                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition duration-200 ${
                                        selectedPlatforms.includes(platform.value)
                                            ? 'border-purple-500 bg-purple-900/30'
                                            : 'border-gray-600 bg-gray-700 hover:border-purple-400'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPlatforms.includes(platform.value)}
                                        onChange={() => handlePlatformChange(platform.value)}
                                        className="mr-3 w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-gray-100">{platform.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Informações sobre mediação */}
                    <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                        <h3 className="text-purple-400 font-bold mb-2">Como funciona a mediação:</h3>
                        <ul className="text-sm text-gray-300 space-y-1">
                            <li>• Você será conectado a partidas que precisam de mediação</li>
                            <li>• Garanta que as regras sejam seguidas</li>
                            <li>• Resolva disputas entre os jogadores</li>
                            <li>• Confirme os resultados das partidas</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleJoinQueue}
                        disabled={selectedModalities.length === 0 || selectedPlatforms.length === 0}
                        className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                    >
                        Entrar na Fila de Mediação
                    </button>
                </div>
            )}
        </div>
    );
};

export default MediationPage;
