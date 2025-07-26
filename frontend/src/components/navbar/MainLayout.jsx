// src/components/MainLayout.jsx
import React from 'react';
import Navbar from './Navbar';
// IMPORTANTE: Não importe UserContext aqui para criar um novo.
// Importe UserProvider para envolver os children.
import { UserProvider } from '../../context/UserContext'; // <--- CORREÇÃO AQUI

const MainLayout = ({ children }) => {
    // Não precisamos de user/setUser states aqui, eles serão fornecidos pelo UserProvider
    return (
        // Use UserProvider para envolver a aplicação
        <UserProvider> {/* <--- CORREÇÃO AQUI */}
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">{children}</main>
            </div>
        </UserProvider>
    );
};

export default MainLayout;