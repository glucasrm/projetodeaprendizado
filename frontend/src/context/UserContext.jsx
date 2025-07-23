// src/context/UserContext.js
import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLogin(false);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // CORREÇÃO: Mapeie o userId recebido do backend para a propriedade 'id' no estado do user
      // Se o perfil for encontrado, res.data terá 'userId'.
      // Se não for encontrado e o backend retornar { userId: '...', ... }, isso também funcionará.
      if (res.data && res.data.userId) {
        setUser({
          id: res.data.userId, // Mapeia userId para id
          username: res.data.username,
          avatar: res.data.avatar,
          banner: res.data.banner,
          bio: res.data.bio,
          // Adicione outras propriedades do perfil que você queira manter
        });
        setLogin(true);
      } else {
        // Caso o backend retorne um objeto vazio ou sem userId, trate como não logado
        setUser(null);
        setLogin(false);
      }

    } catch (error) {
      console.error('Erro ao verificar token:', error);
      localStorage.removeItem('token');
      setUser(null);
      setLogin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setLogin(false);
  };

  return (
    <UserContext.Provider value={{ user, login, loading, logout, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;