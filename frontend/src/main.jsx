// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/login/Login-page.jsx';
import Cadastro from './pages/sign/sign-page.jsx';
import Torneios from './pages/tournaments/Tournaments-page.jsx';
import TorneiosFuturosPage from './pages/tournaments/Tournaments-next-page.jsx';
import TorneiosPassadosPage from './pages/tournaments/Tournaments-past-page.jsx';
import GamesList from './pages/games/Games-list-page.jsx';
import GamePage from './pages/games/Game-profile-page.jsx';
import RankList from './pages/Ranking/Rank-games-page.jsx';
import MainLayout from './components/navbar/MainLayout.jsx';
// Remova este import, pois BettingForm será usado via QueuePage ou diretamente na rota do jogo
import BettingForm from './pages/apostado/Apostado-games-page.jsx'; 
import ChatLayout from './pages/chat/Chat-page.jsx';
import OverviewPage from './pages/overview/Overview-games-page.jsx';
import GamesTorneios from './pages/tournaments/Tournaments-games-page.jsx';
import PerfilPage from './pages/profile/Profile-users-page.jsx';
import OverViewPerfil from './pages/overview/Overview-perfil-page.jsx'
import AmigosList from './pages/friends/friends-list-profile-page';
import EquipeList from './pages/teams/Teams-list-profile-page.jsx'
import TorneiosDoUsuario from './pages/tournaments/Tournaments-list-profile-page.jsx'
import Configuracoes from './pages/settings/Settings-page';
import Carteira from './pages/carteira/Carteira-page';
import CadastrarChavePix from './pages/chavepix/Cadastrochavepix-page'
import TorneioDetalhesPage from './pages/tournaments/Tournaments-details-page';
import EquipesPage from './pages/teams/Teams-list-page';
import CreateOptionsGrid from './pages/created/Created-teams-tournaments';
import PainelPrincipal from './pages/tournaments/Tournaments-panel-page';
import AppearanceSettings from './pages/tournaments/Tournaments-appearence-page';
import { UserProvider } from './context/UserContext';
import NotificationsPage from './pages/notifications/notifications';
import UserSearchPage from './pages/search/search-page';

import MatchDetails from './pages/apostado/MatchDetails';
// Remova este import, pois MediationQueueControl será usado via QueuePage
// import MediationQueueControl from './components/apostado/MediationQueueControl'; 

// Importe o novo componente QueuePage
import QueuePage from './pages/apostado/QueuePage';


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <UserProvider>
                <Routes>
                    {/* Rotas COM Navbar */}
                    <Route path="/" element={<MainLayout><App /></MainLayout>} />
                    <Route path="/torneios" element={<MainLayout><Torneios/></MainLayout>} />
                    <Route path="/torneios-futuros" element={<MainLayout><TorneiosFuturosPage/></MainLayout>} />
                    <Route path="/torneios-passados" element={<MainLayout><TorneiosPassadosPage/></MainLayout>} />
                    <Route path="/games" element={<MainLayout><GamesList/></MainLayout>} />
                    <Route path="/configuracoes" element={<MainLayout><Configuracoes/></MainLayout>} />
                    <Route path="/equipes-page" element={<MainLayout><EquipesPage/></MainLayout>} />
                    <Route path="/carteira" element={<MainLayout><Carteira/></MainLayout>} />
                    <Route path="/cadastrochave" element={<MainLayout><CadastrarChavePix/></MainLayout>} />
                    <Route path="/chat" element={<MainLayout><ChatLayout/></MainLayout>} />
                    <Route path="/created" element={<MainLayout><CreateOptionsGrid/></MainLayout>} />
                    <Route path="/torneios/:jogo/:id/painel" element={<MainLayout><PainelPrincipal /></MainLayout>} />
                    <Route path="/torneios/:jogo/:id/painel/aparencia" element={<MainLayout><AppearanceSettings /></MainLayout>} />
                    <Route path="/torneios/:jogo/:id" element={<MainLayout><TorneioDetalhesPage/></MainLayout>} />
                    <Route path="/notificacoes" element={<MainLayout><NotificationsPage/></MainLayout>} />
                    <Route path="/search" element={<MainLayout><UserSearchPage /></MainLayout>} />

                    {/* NOVA ROTA UNIFICADA PARA FILAS */}
                    <Route path="/fila" element={<MainLayout><QueuePage /></MainLayout>} />
                    <Route path="/apostas/detalhes/:matchId" element={<MainLayout><MatchDetails /></MainLayout>} />


                    {/*abas do perfil page - Rota para o perfil do usuário logado*/}
                    <Route path="/perfil" element={<MainLayout><PerfilPage /></MainLayout>}>
                        <Route index element={<OverViewPerfil />} />
                        <Route path="amigos" element={<AmigosList />} />
                        <Route path="equipes" element={<EquipeList />} />
                        <Route path="torneios-usuario" element={<TorneiosDoUsuario />} />
                    </Route>

                    {/*abas do perfil page - Rota para perfis públicos usando userId */}
                    <Route path="/perfil/:userId" element={<MainLayout><PerfilPage /></MainLayout>}>
                        <Route index element={<OverViewPerfil />} />
                        {/* Se você quiser sub-rotas para perfis públicos, adicione-as aqui.
                            Ex: <Route path="amigos" element={<AmigosListPublic />} /> */}
                    </Route>


                    {/*abas do gamepage*/}
                    <Route path="/games/:slug" element={<MainLayout><GamePage/></MainLayout>}>
                        <Route index element={<OverviewPage />} />
                        <Route path="ranking" element={<RankList />} />
                        {/* A rota "apostado" ainda pode existir para acessar o formulário diretamente */}
                        <Route path="apostado" element={<BettingForm />} /> 
                        <Route path="torneios" element={<GamesTorneios />} />
                    </Route>


                    {/* Rotas SEM Navbar */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<Cadastro />} />

                </Routes>
            </UserProvider>
        </BrowserRouter>
    </StrictMode>
);