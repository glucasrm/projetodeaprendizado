import React, { createContext, useState } from 'react';
import Navbar from './Navbar';

// Criar o contexto
export const UserContext = createContext();

const MainLayout = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
      </div>
    </UserContext.Provider>
  );
};

export default MainLayout;