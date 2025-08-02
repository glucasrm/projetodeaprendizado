// src/pages/queue/QueuePage.jsx
import React, { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import BettingForm from '../apostado/Apostado-games-page'; // Importe o componente de aposta
import MediationQueueControl from '../../components/apostado/MediationQueueControl'; // Importe o componente de mediação

const QueuePage = () => {
    const { user, loading, login } = useContext(UserContext);

    if (loading) {
        return <p className="text-center text-lg text-gray-400 mt-10">Carregando...</p>;
    }

    if (!login) {
        return <p className="text-center text-lg text-red-500 mt-10">Por favor, faça login para acessar esta página.</p>;
    }

    // Se o usuário for um administrador, mostre a fila de mediação
    if (user && user.isAdmin) {
        return <MediationQueueControl />;
    } 
    // Caso contrário (jogador normal), mostre a fila de apostas
    else {
        return <BettingForm />;
    }
};

export default QueuePage;