//página de login

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../../assets/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensagem('Carregando...');

    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        senha,
      });

      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setMensagem(`Bem-vindo, ${user.nome || 'usuário'}!`);
      navigate('/'); // redirecionar para a dashboard/painel
    } catch (err) {
      console.error(err);
      setMensagem(err.response?.data?.error || 'Erro ao fazer login.');
    }
  };

  return (
    <div className="flex justify-center h-screen bg-gray-950 text-white">
      <div className="px-4 py-8 rounded-2xl bg-gray-900 shadow-md">
        <p className="flex justify-center mx-auto">
          <button onClick={() => navigate('/')}>
            <img src={Logo} className="w-10 h-auto" alt="Trem Loco" />
          </button>
        </p>

        <h1 className="flex justify-center font-bold text-5xl mb-1 mt-6">Login</h1>

        <p className="flex justify-center mt-5 text-gray-500">
          Não tem conta?{' '}
          <button
            className="hover:text-blue-500 text-blue-400 ml-1"
            onClick={() => navigate('/cadastro')}
          >
            Cadastre-se
          </button>
        </p>

        <div className="mt-6">
          <form className="max-w-sm mx-auto" onSubmit={handleLogin}>
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-white"
              >
                Seu email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg 
                           focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="nome@gmail.com"
                required
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-white"
              >
                Sua senha
              </label>
              <input
                type="password"
                id="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg 
                           focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              />
            </div>

            <div className="flex items-start mb-5">
              <div className="flex items-center h-5">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-700 focus:ring-blue-600"
                />
              </div>
              <label
                htmlFor="remember"
                className="ml-2 text-sm font-medium text-gray-300"
              >
                Lembrar de mim
              </label>
            </div>

            <button
            onClick={Login}
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none 
                         focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center"
            >
              Entrar
            </button>

            {mensagem && (
              <p className="text-sm text-center mt-4 text-red-400">{mensagem}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
