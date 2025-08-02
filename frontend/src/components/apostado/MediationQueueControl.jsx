// src/components/apostado/MediationQueueControl.jsx
import React, { useContext, useEffect } from 'react';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const MediationQueueControl = () => {
    const { user, loading, isInMediationQueue, joinMediationQueue, leaveQueue, currentMatch, setIsInMediationQueue, setCurrentMatch } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Redireciona para o confronto se o mediador for atribuído a um match
        // E o match tiver um chatRoomId para navegação
        if (currentMatch && user?.isAdmin && currentMatch.id) { 
            navigate(`/apostas/detalhes/${currentMatch.id}`);
            // Limpa o currentMatch após a navegação
            setCurrentMatch(null); 
        }
    }, [currentMatch, navigate, user, setCurrentMatch]);

    // Efeito para verificar se o mediador já está na fila ao carregar a página
    useEffect(() => {
        // Você pode adicionar uma chamada API aqui se `isInMediationQueue`
        // não for totalmente determinado pelo `joinMediationQueue` e `leaveQueue`
        // Por exemplo, uma chamada `checkMediationStatus` no UserContext.
    }, [user, isInMediationQueue]); // Removi 'login' e 'loading' das dependências, pois a QueuePage já os validou.


    if (loading) {
        return null; // O componente QueuePage já mostra o "Carregando..."
    }

    // A verificação de admin já é feita no QueuePage, então não precisamos dela aqui.
    // if (!login || !user || !user.isAdmin) {
    //     return <p className="text-center text-lg text-red-500 mt-10">Acesso negado: Somente mediadores podem acessar esta página.</p>;
    // }

    const handleJoinMediationQueue = async () => {
        const result = await joinMediationQueue();
        if (result.success) {
            alert(result.message);
            setIsInMediationQueue(result.isInMediationQueue || false);
            if (result.currentMatch) {
                setCurrentMatch(result.currentMatch);
            }
        } else {
            alert(result.message);
        }
    };

    const handleLeaveMediationQueue = async () => {
        const result = await leaveQueue('mediator');
        if (result.success) {
            alert(result.message);
            setIsInMediationQueue(result.isInMediationQueue || false);
            setCurrentMatch(null);
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="bg-gray-800 text-gray-100 p-8 rounded-xl max-w-2xl mx-auto my-10 shadow-2xl font-sans">
            <h2 className="text-purple-400 text-4xl font-extrabold text-center mb-6 tracking-wide">Controle de Mediação</h2>

            {isInMediationQueue ? (
                <div className="bg-gray-700 p-8 rounded-xl text-center border-2 border-purple-500 flex flex-col items-center justify-center space-y-5">
                    <p className="text-xl font-bold text-purple-400">Você está na fila de mediadores disponíveis.</p>
                    <p className="text-lg text-gray-300 animate-pulse">Aguardando confrontos para mediar...</p>
                    <button
                        onClick={handleLeaveMediationQueue}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                    >
                        Sair da Fila de Mediação
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-lg text-gray-300 mb-6">Entre na fila para ficar disponível como mediador de confrontos.</p>
                    <button
                        onClick={handleJoinMediationQueue}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                    >
                        Entrar na Fila de Mediação
                    </button>
                </div>
            )}
        </div>
    );
};

export default MediationQueueControl;