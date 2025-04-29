import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Torneios from './pages/Torneios';
import TorneiosFuturosPage from './pages/TorneiosFuturosPage';
import TorneiosPassadosPage from './pages/TorneiosPassados';
import GamesList from './pages/GamesList';
import GamePage from './pages/GamePage.jsx';
import RankList from './pages/RankList.jsx';
import MainLayout from './components/MainLayout';
import ApostadoList from './pages/ApostadoList.jsx';
import ChatLayout from './pages/Chats.jsx';
import OverviewPage from './pages/Overview.jsx';
import GamesTorneios from './pages/GamesTorneios.jsx';
import PerfilPage from './pages/PerfilPage'; 
import OverViewPerfil from './pages/OverViewPerfil.jsx'
import AmigosList from './pages/AmigosList.jsx'
import EquipeList from './pages/EquipeList.jsx'
import TorneiosDoUsuario from './pages/TorneiosDoUsuario.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rotas COM Navbar */}
        <Route path="/" element={<MainLayout><App /></MainLayout>} />
        <Route path="/torneios" element={<MainLayout><Torneios/></MainLayout>} />
        <Route path="/torneios-futuros" element={<MainLayout><TorneiosFuturosPage/></MainLayout>} />
        <Route path="/torneios-passados" element={<MainLayout><TorneiosPassadosPage/></MainLayout>} />
        <Route path="/games" element={<MainLayout><GamesList/></MainLayout>} />

        {/*abas do perfil page*/}
        <Route path="/perfil" element={<MainLayout><PerfilPage /></MainLayout>}>
        <Route index element={<OverViewPerfil />} />
        <Route path="amigos" element={<AmigosList />} />
        <Route path="equipes" element={<EquipeList />} />
        <Route path="torneios-usuario" element={<TorneiosDoUsuario />} />
        </Route>

        
        {/*abas do gamepage*/}
        <Route path="/games/:slug" element={<MainLayout><GamePage/></MainLayout>}>
        <Route index element={<OverviewPage />} />
        <Route path="ranking" element={<RankList />} />
        <Route path="apostado" element={<ApostadoList />} />
        <Route path="torneios" element={<GamesTorneios />} /> {/* 👈 corrigido aqui */}
        
      </Route>


        
      

        {/* Rotas SEM Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/chats" element={<MainLayout><ChatLayout/></MainLayout>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
