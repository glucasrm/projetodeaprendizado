// src/hooks/useMatchRedirect.js
import { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../../frontend/src/context/UserContext';

export const useMatchRedirect = (userType = 'player', options = {}) => {
    const { currentMatch, user } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    const {
        preventRedirectPaths = [],
        customRedirectLogic = null,
        onRedirect = null,
        enabled = true
    } = options;

    useEffect(() => {
        if (!enabled || !currentMatch || !currentMatch.id) return;

        // Verificar se estamos em uma rota que não deve ser redirecionada
        const shouldPreventRedirect = preventRedirectPaths.some(path => 
            location.pathname.includes(path)
        );
        
        if (shouldPreventRedirect) return;

        // Usar lógica customizada se fornecida
        if (customRedirectLogic) {
            const customPath = customRedirectLogic(currentMatch, user, userType);
            if (customPath && location.pathname !== customPath) {
                onRedirect?.(customPath, 'custom');
                navigate(customPath);
            }
            return;
        }

        // Lógica padrão de redirecionamento
        const getRedirectPath = () => {
            // Verificar se o usuário é mediador desta partida específica
            if (user?.isAdmin && currentMatch.mediator?.id === user.id) {
                return `/mediacao/chat/${currentMatch.id}`;
            }
            
            // Verificar se o usuário é jogador desta partida específica
            if (currentMatch.player1?.id === user?.id || currentMatch.player2?.id === user?.id) {
                return `/partida/chat/${currentMatch.id}`;
            }

            // Fallback baseado no tipo de usuário especificado
            switch (userType) {
                case 'mediator':
                    return `/mediacao/chat/${currentMatch.id}`;
                case 'player':
                    return `/partida/chat/${currentMatch.id}`;
                default:
                    // Se não conseguir determinar, usar mediação como padrão
                    return `/mediacao/chat/${currentMatch.id}`;
            }
        };

        const redirectPath = getRedirectPath();
        
        // Só redirecionar se não estivermos já na rota correta
        if (redirectPath && location.pathname !== redirectPath) {
            console.log(`[useMatchRedirect] Redirecionando ${userType} de ${location.pathname} para ${redirectPath}`);
            onRedirect?.(redirectPath, userType);
            navigate(redirectPath);
        }
    }, [currentMatch, navigate, location.pathname, userType, user, enabled, preventRedirectPaths, customRedirectLogic, onRedirect]);

    return { 
        currentMatch,
        isRedirectEnabled: enabled,
        currentPath: location.pathname
    };
};
