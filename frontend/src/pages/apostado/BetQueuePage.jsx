import React, { useState, useContext, useEffect } from 'react'; // 1. Importar useEffect
import { UserContext } from '../../context/UserContext';
import { useNavigate, useParams } from 'react-router-dom';
import MatchRedirect from '../../components/apostado/MatchRedirect';
import BetLimitNotification from '../../components/notificações/BetLimitNotification'; // 2. Importar o componente de notificação de limite

const BetQueuePage = () => {
    // 3. Obter as novas funções e estados do context
    const { 
        user, 
        login, 
        joinBetQueue, 
        leaveQueue, 
        loading: contextLoading, // Renomear para evitar conflito
        getUserBetStatus,
        betStatus 
    } = useContext(UserContext);
    
    const navigate = useNavigate();
    const { slug } = useParams(); 

    const BET_OPTIONS = [2, 3, 5, 7, 10, 15, 20, 50, 100];
    const [betAmount, setBetAmount] = useState(BET_OPTIONS[0].toString());
    const [modality, setModality] = useState('1v1');
    const [platform, setPlatform] = useState('Mobile');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // 4. Novos estados para gerenciar o status da fila e o carregamento local
     const [isCheckingStatus, setIsCheckingStatus] = useState(true);
    const [queueState, setQueueState] = useState({
        inThisQueue: false, // O usuário está na fila para ESTE jogo?
        hasActiveBetElsewhere: false, // O usuário tem outra aposta/partida ativa?
        details: null // Detalhes da aposta na fila atual
    });

    const [showLimitNotification, setShowLimitNotification] = useState(false);
    const [limitNotificationData, setLimitNotificationData] = useState({});

    // 5. useEffect para verificar o status do usuário ao carregar o componente
   
     // useEffect continua sendo o ponto de partida
    useEffect(() => {
        if (login) {
            checkCurrentQueueStatus();
        } else if (!contextLoading) {
            setIsCheckingStatus(false);
        }
    }, [login, contextLoading, slug]);

   const checkCurrentQueueStatus = async () => {
    setIsCheckingStatus(true);
    setError('');
    setMessage('');
    try {
        const status = await getUserBetStatus();
        if (status?.success) {
 // --- DEBUG LOGS ---
            console.log("[DEBUG] Slug da URL:", slug);
            console.log("[DEBUG] Status recebido do backend:", status);
            if (status.activeBets && status.activeBets.length > 0) {
                console.log("[DEBUG] Game slug da aposta ativa:", status.activeBets[0].gameSlug);
                console.log("[DEBUG] Comparação de slugs:", status.activeBets[0].gameSlug === slug);
            }
            // --- FIM DEBUG LOGS ---

            // Verifica se existe QUALQUER aposta na fila de espera
            const anyWaitingBet = status.activeBets?.find(bet => bet.status === 'WAITING_OPPONENT');

            if (anyWaitingBet) {
                // O usuário está em uma fila. É esta?
                if (anyWaitingBet.gameSlug === slug) {
                    // SIM, é a fila correta. Mostra a tela de "Aguardando".
                    setQueueState({
                        inThisQueue: true,
                        hasActiveBetElsewhere: false,
                        details: anyWaitingBet
                    });
                    setBetAmount(anyWaitingBet.betAmount.toString());
                    setModality(anyWaitingBet.modality);
                    setPlatform(anyWaitingBet.platform);
                } else {
                    // NÃO, é outra fila. Redireciona para a fila correta.
                    setMessage(`Você já está na fila do jogo ${anyWaitingBet.gameSlug.toUpperCase()}. Redirecionando...`);
                    setTimeout(() => {
                        navigate(`/games/${anyWaitingBet.gameSlug}/fila`);
                    }, 2000); // Espera 2 segundos para o usuário ler a mensagem
                }
            } else {
                // O usuário não está em nenhuma fila, mas pode ter uma partida ativa.
                const hasActiveMatch = status.currentActive > 0;
                setQueueState({
                    inThisQueue: false,
                    hasActiveBetElsewhere: hasActiveMatch,
                    details: null
                });
            }
        } else {
            setQueueState({ inThisQueue: false, hasActiveBetElsewhere: false, details: null });
        }
    } catch (err) {
        setError('Erro ao verificar seu status na fila. Tente recarregar a página.');
        console.error('[BetQueuePage] Erro ao verificar status:', err);
    } finally {
        setIsCheckingStatus(false);
    }
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
            const result = await joinBetQueue(parsedBetAmount, modality, platform, slug);
            if (result.success) {
                setMessage(result.message || 'Você entrou na fila! Aguardando oponente...');
                // Força a re-sincronização para mostrar a tela de "em fila"
                await checkCurrentQueueStatus(); 
            } else {
                // 7. Tratar o caso de limite de apostas atingido
                if (result.isLimitReached) {
                    setLimitNotificationData({
                        userType: result.userType,
                        currentActive: result.currentActive,
                        maxAllowed: result.maxAllowed,
                        activeBets: result.details?.activeBets || [],
                        activeMatches: result.details?.activeMatches || [],
                        customMessage: result.message
                    });
                    setShowLimitNotification(true);
                }
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
                // Força a re-sincronização para mostrar o formulário novamente
                await checkCurrentQueueStatus();
            } else {
                setError(result.message || 'Erro ao sair da fila.');
            }
        } catch (err) {
            setError('Erro na comunicação com o servidor.');
            console.error('[BettingForm] Erro ao sair da fila:', err);
        }
    };

    // 8. Loading unificado (loading do contexto ou da verificação de status)
    if (contextLoading || isCheckingStatus) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto mb-4"></div>
                    <p className="text-lg">Carregando...</p>
                </div>
            </div>
        );
    }

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
    
    // 9. Lógica para mostrar aviso de limite de apostas
    const cannotJoin = betStatus && !betStatus.canJoinNewBet;
    
    return (
        <>
            <MatchRedirect 
                userType="player" 
                allowedPaths={['/partida/chat/', '/mediacao/chat/']}
                onRedirect={() => setMessage('Oponente encontrado! Redirecionando para o chat...')}
                showLoadingOnRedirect={true}
            >
                <div className="bg-gray-800 text-gray-100 p-8 rounded-xl max-w-2xl mx-auto my-10 shadow-2xl font-sans">
                    <h2 className="text-sky-400 text-4xl font-extrabold text-center mb-6 tracking-wide">
                        Faça uma Aposta Direta
                    </h2>

                    {message && <p className="bg-green-600 text-white p-3 rounded-lg mb-5 text-center font-semibold">{message}</p>}
                    {error && <p className="bg-red-600 text-white p-3 rounded-lg mb-5 text-center font-semibold">{error}</p>}

                    {user && (
                        <p className="text-center text-lg bg-gray-700 p-4 rounded-lg mb-6 border border-gray-600">
                            Seu Saldo: <span className="font-bold text-green-400">
                                R$ {user.balance ? parseFloat(user.balance).toFixed(2) : '0.00'}
                            </span>
                        </p>
                    )}i
{/* CASO 1: Usuário está na fila para ESTE jogo */}
                    {queueState.inThisQueue ? (
                        <div className="bg-gray-700 p-8 rounded-xl text-center border-2 border-sky-500 flex flex-col items-center justify-center space-y-5">
                            <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
                                <p className="text-xl font-bold text-sky-400">Você está na fila de espera</p>
                            </div>
                            <p className="text-lg text-gray-300">Aguardando oponente para {slug?.toUpperCase()}...</p>
                            
                            <div className="bg-gray-600 p-4 rounded-lg">
                                <p className="text-sm text-gray-300 mb-2">Detalhes da sua aposta:</p>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-semibold">Valor:</span> R$ {parseFloat(queueState.details.betAmount).toFixed(2)}</p>
                                    <p><span className="font-semibold">Modalidade:</span> {queueState.details.modality}</p>
                                    <p><span className="font-semibold">Plataforma:</span> {queueState.details.platform}</p>
                                </div>
                            </div>
                            
                            <button onClick={handleLeaveQueue} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg ...">
                                Sair da Fila
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* CASO 2: Usuário tem outra aposta/partida ativa */}
                            {queueState.hasActiveBetElsewhere && (
                                <div className="bg-orange-900 border border-orange-700 text-white p-4 rounded-lg mb-6">
                                    <h4 className="font-bold text-orange-400">Limite de Apostas Atingido</h4>
                                    <p className="text-sm mt-1">
                                        Você já possui uma aposta ou partida ativa. 
                                        Finalize-a antes de entrar em uma nova fila.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setLimitNotificationData({
                                                userType: betStatus?.userType,
                                                currentActive: betStatus?.currentActive,
                                                maxAllowed: betStatus?.maxAllowed,
                                                activeBets: betStatus?.activeBets || [],
                                                activeMatches: betStatus?.activeMatches || []
                                            });
                                            setShowLimitNotification(true);
                                        }}
                                        className="text-orange-400 hover:text-orange-300 text-sm font-semibold mt-2 underline"
                                    >
                                        Ver detalhes da atividade
                                    </button>
                                </div>
                            )}

                            {/* CASO 3: Usuário está livre para entrar na fila */}
                            <form onSubmit={handleSubmit} className={`flex flex-col space-y-6 ${cannotJoin ? 'opacity-50 pointer-events-none' : ''}`}>
                                {/* ... (o resto do formulário permanece igual) ... */}
                                <div className="flex flex-col">
                                    <label htmlFor="betAmount" className="mb-2 text-lg font-medium text-gray-300">Valor da Aposta:</label>
                                    <select id="betAmount" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} required className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 appearance-none">
                                        {BET_OPTIONS.map((amount) => (<option key={amount} value={amount.toString()}>R$ {amount.toFixed(2)}</option>))}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="modality" className="mb-2 text-lg font-medium text-gray-300">Modalidade:</label>
                                    <select id="modality" value={modality} onChange={(e) => setModality(e.target.value)} className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 appearance-none">
                                        <option value="1v1">1x1</option>
                                        <option value="2v2">2x2</option>
                                        <option value="3v3">3x3</option>
                                        <option value="4v4">4x4</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="platform" className="mb-2 text-lg font-medium text-gray-300">Plataforma:</label>
                                    <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value)} className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 appearance-none">
                                        <option value="Mobile">Mobile</option>
                                        <option value="Emulador">Emulador</option>
                                    </select>
                                </div>
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                    <h3 className="text-sky-400 font-bold mb-2">Como funciona:</h3>
                                    <ul className="text-sm text-gray-300 space-y-1">
                                        <li>• Você será pareado com um oponente de nível similar</li>
                                        <li>• O vencedor leva o valor total da aposta (menos taxas)</li>
                                        <li>• Um mediador supervisionará a partida</li>
                                        <li>• Siga as regras para evitar penalizações</li>
                                    </ul>
                                </div>
                                <button type="submit" disabled={!user || user.balance < parseFloat(betAmount) || cannotJoin} className="bg-sky-500 hover:bg-sky-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
                                    {cannotJoin ? 'Limite de Apostas Atingido' : (user && user.balance < parseFloat(betAmount) ? 'Saldo Insuficiente' : 'Entrar na Fila')}
                                </button>
                            </form>
                        </>
                    )}                </div>
            </MatchRedirect>
            {/* 11. Renderizar o modal de notificação */}
            <BetLimitNotification
                isVisible={showLimitNotification}
                onClose={() => setShowLimitNotification(false)}
                {...limitNotificationData}
            />
        </>
    );
};

export default BetQueuePage;
