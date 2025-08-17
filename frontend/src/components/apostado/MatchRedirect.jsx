// src/components/MatchRedirect.jsx
import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const MatchRedirect = ({ 
    children, 
    userType = 'player', 
    allowedPaths = [],
    onRedirect = null,
    showLoadingOnRedirect = false,
    redirectDelay = 0
}) => {
    const { currentMatch, user } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (!currentMatch || !currentMatch.id) {
            setIsRedirecting(false);
            return;
        }

        // Verificar se já estamos em uma rota permitida
        const isInAllowedPath = allowedPaths.some(path => 
            location.pathname.includes(path)
        );
        
        if (isInAllowedPath) {
            setIsRedirecting(false);
            return;
        }

        // Determinar a rota de redirecionamento
        const getRedirectPath = () => {
            // Prioridade 1: Verificar se é mediador da partida
            if (user?.isAdmin && currentMatch.mediator?.id === user.id) {
                return `/mediacao/chat/${currentMatch.id}`;
            }
            
            // Prioridade 2: Verificar se é jogador da partida
            if (currentMatch.player1?.id === user?.id || currentMatch.player2?.id === user?.id) {
                return `/partida/chat/${currentMatch.id}`;
            }

            // Prioridade 3: Baseado no userType especificado
            if (userType === 'mediator' && user?.isAdmin) {
                return `/mediacao/chat/${currentMatch.id}`;
            } else if (userType === 'player') {
                return `/partida/chat/${currentMatch.id}`;
            }

            // Fallback: usar mediação se o usuário for admin, senão partida
            return user?.isAdmin 
                ? `/mediacao/chat/${currentMatch.id}`
                : `/partida/chat/${currentMatch.id}`;
        };

        const redirectPath = getRedirectPath();
        
        if (redirectPath && location.pathname !== redirectPath) {
            setIsRedirecting(true);
            
            const performRedirect = () => {
                console.log(`[MatchRedirect] Redirecionando para: ${redirectPath}`);
                onRedirect?.(redirectPath, currentMatch, userType);
                navigate(redirectPath);
            };

            if (redirectDelay > 0) {
                const timer = setTimeout(performRedirect, redirectDelay);
                return () => clearTimeout(timer);
            } else {
                performRedirect();
            }
        } else {
            setIsRedirecting(false);
        }
    }, [currentMatch, navigate, location.pathname, userType, user, allowedPaths, onRedirect, redirectDelay]);

    // Mostrar loading durante redirecionamento se habilitado
    if (isRedirecting && showLoadingOnRedirect) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                    <p className="text-lg">Redirecionando para a partida...</p>
                </div>
            </div>
        );
    }

    return children;
};

export default MatchRedirect;
