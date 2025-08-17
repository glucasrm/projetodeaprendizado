// useMatchRedirect.test.js
import { renderHook, act } from '@testing-library/react-hooks';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../frontend/src/context/UserContext'; // Ajuste o caminho conforme necessário
import { useMatchRedirect } from '../src/hooks/seMatchRedirect'; // Ajuste o caminho conforme necessário

// Mock do useNavigate e useLocation
const mockNavigate = jest.fn();
const mockUseLocation = jest.fn(() => ({ pathname: '/' }));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
}));

describe('useMatchRedirect', () => {
    let mockUserContextValue;

    // Wrapper para o provedor de contexto
    const wrapper = ({ children }) => (
        <BrowserRouter>
            <UserContext.Provider value={mockUserContextValue}>
                {children}
            </UserContext.Provider>
        </BrowserRouter>
    );

    beforeEach(() => {
        // Resetar mocks antes de cada teste
        mockNavigate.mockClear();
        mockUseLocation.mockClear();

        // Estado inicial padrão do contexto
        mockUserContextValue = {
            user: null,
            currentMatch: null,
            login: false,
            isAdmin: false,
        };
    });

    it('não deve redirecionar se currentMatch for nulo', () => {
        const { result } = renderHook(() => useMatchRedirect(), { wrapper });
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('não deve redirecionar se currentMatch.id for nulo', () => {
        mockUserContextValue.currentMatch = { id: null };
        const { result } = renderHook(() => useMatchRedirect(), { wrapper });
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('deve redirecionar mediador para /mediacao/chat/:id', () => {
        mockUserContextValue.user = { id: 'mediator123', isAdmin: true };
        mockUserContextValue.currentMatch = {
            id: 'match123',
            mediator: { id: 'mediator123' },
            player1: { id: 'playerA' },
            player2: { id: 'playerB' }
        };

        const { result, rerender } = renderHook(() => useMatchRedirect('mediator'), { wrapper });

        expect(mockNavigate).toHaveBeenCalledWith('/mediacao/chat/match123');
    });

    it('deve redirecionar jogador para /partida/chat/:id se for player1', () => {
        mockUserContextValue.user = { id: 'playerA' };
        mockUserContextValue.currentMatch = {
            id: 'match456',
            mediator: { id: 'mediatorXYZ' },
            player1: { id: 'playerA' },
            player2: { id: 'playerB' }
        };

        const { result, rerender } = renderHook(() => useMatchRedirect('player'), { wrapper });

        expect(mockNavigate).toHaveBeenCalledWith('/partida/chat/match456');
    });

    it('deve redirecionar jogador para /partida/chat/:id se for player2', () => {
        mockUserContextValue.user = { id: 'playerB' };
        mockUserContextValue.currentMatch = {
            id: 'match789',
            mediator: { id: 'mediatorXYZ' },
            player1: { id: 'playerA' },
            player2: { id: 'playerB' }
        };

        const { result, rerender } = renderHook(() => useMatchRedirect('player'), { wrapper });

        expect(mockNavigate).toHaveBeenCalledWith('/partida/chat/match789');
    });

    it('não deve redirecionar se já estiver na rota correta', () => {
        mockUserContextValue.user = { id: 'playerA' };
        mockUserContextValue.currentMatch = {
            id: 'match101',
            mediator: { id: 'mediatorXYZ' },
            player1: { id: 'playerA' },
            player2: { id: 'playerB' }
        };
        mockUseLocation.mockReturnValue({ pathname: '/partida/chat/match101' });

        const { result } = renderHook(() => useMatchRedirect('player'), { wrapper });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('deve usar preventRedirectPaths para evitar redirecionamento', () => {
        mockUserContextValue.user = { id: 'playerA' };
        mockUserContextValue.currentMatch = {
            id: 'match101',
            mediator: { id: 'mediatorXYZ' },
            player1: { id: 'playerA' },
            player2: { id: 'playerB' }
        };
        mockUseLocation.mockReturnValue({ pathname: '/games/some-game' });

        const { result } = renderHook(() => useMatchRedirect('player', { preventRedirectPaths: ['/games/'] }), { wrapper });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('deve usar customRedirectLogic se fornecido', () => {
        mockUserContextValue.user = { id: 'playerA' };
        mockUserContextValue.currentMatch = {
            id: 'matchCustom',
            mediator: { id: 'mediatorXYZ' },
            player1: { id: 'playerA' },
            player2: { id: 'playerB' }
        };

        const customLogic = (match, user, type) => {
            if (type === 'player') return `/custom/player/chat/${match.id}`;
            return null;
        };

        const { result } = renderHook(() => useMatchRedirect('player', { customRedirectLogic: customLogic }), { wrapper });

        expect(mockNavigate).toHaveBeenCalledWith('/custom/player/chat/matchCustom');
    });

    it('não deve redirecionar se enabled for false', () => {
        mockUserContextValue.user = { id: 'playerA' };
        mockUserContextValue.currentMatch = {
            id: 'matchDisabled',
            mediator: { id: 'mediatorXYZ' },
            player1: { id: 'playerA' },
            player2: { id: 'playerB' }
        };

        const { result } = renderHook(() => useMatchRedirect('player', { enabled: false }), { wrapper });

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});