// página de cadastro
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/logo.png';

export default function Cadastro() {
  const navigate = useNavigate();
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMensagem('Carregando...');

    if (senha !== confirmarSenha) {
      setMensagem('As senhas não coincidem');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/auth/register', {
        nome,
        sobrenome,
        email,
        telefone,
        senha
      });

      const { token, user } = res.data;
      if (token) {
        localStorage.setItem('token', token);
      }

      setMensagem(`Bem-vindo, ${user.nome || 'usuário'}!`);
      navigate('/');
    } catch (err) {
      console.error(err);
      setMensagem(err.response?.data?.error || 'Erro ao fazer Cadastro.');
    }
  };

  return (
    <div className="flex justify-center h-full bg-gray-950 text-gray-500">
      <div className="px-4 py-8 rounded-2xl bg-gray-900 shadow-md w-full max-w-2xl">
        <div className="flex justify-center mb-4">
          <button onClick={() => navigate('/')}>
            <img src={Logo} className="w-10 h-auto" alt="Trem Loco" />
          </button>
        </div>

        <h1 className="text-center text-white font-bold text-5xl mb-2 mt-6">Cadastre-se</h1>

        <p className="text-center mt-5 text-gray-500">
          Já tem conta?{' '}
          <button
            className="hover:text-blue-500 text-blue-400"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {/* Botões sociais */}
          {/* Google, Facebook, Apple - removidos para foco no essencial, se quiser coloco de volta */}

          <p className="text-center mt-4">ou</p>
        </div>

        <form onSubmit={handleSignUp} className="mt-4">
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-white">
                Nome
              </label>
              <input
                type="text"
                id="first_name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg 
                           focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Seu nome"
                required
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block mb-2 text-sm font-medium text-white">
                Sobrenome
              </label>
              <input
                type="text"
                id="last_name"
                value={sobrenome}
                onChange={(e) => setSobrenome(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg 
                           focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Seu Sobrenome"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block mb-2 text-sm font-medium text-white">
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg 
                           focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="4002-8922"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg 
                           focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="seuemail@gmail.com"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">
              Crie sua senha
            </label>
            <input
              type="password"
              id="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg 
                           focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="•••••••••"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirm_password" className="block mb-2 text-sm font-medium text-white">
              Confirme sua senha
            </label>
            <input
              type="password"
              id="confirm_password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg 
                           focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="•••••••••"
              required
            />
          </div>

          <p className="text-sm text-center text-red-500 mb-4">{mensagem}</p>

          <button
            type="submit"
            className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}

// Estilização global opcional (tailwind)
const style = `
  .input-style {
    @apply bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
           focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
           dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
           dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
  }
`;
