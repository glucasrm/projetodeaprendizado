{/* componente presente em todas as páginas, com exceção da página de login e cadastro */}

import { MessageCircle, Plus } from 'lucide-react';
import Logo from '../../assets/logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import UserMenu  from '../usermenu/UserMenu';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { Bell } from 'lucide-react';


const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useContext(UserContext);


  const handleNavigate = (path, redirectTo = null) => {
    if (redirectTo) {
      navigate(path, { state: { redirectTo } });
    } else {
      navigate(path);
    }
  };

  

 
    const avatarUrl = user?.avatar
  ? `${import.meta.env.VITE_API_URL}${user.avatar}`
  : '/default-avatar.png';

  const encodedUsername = user ? btoa(user.username) : '';

  
  return (
    
    <nav className="bg-gray-900 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] dark:bg-gray-900 border-b border-gray-500">
      <div className="flex flex-wrap items-center justify-between max-w-screen-xl mx-auto p-1">
        
        {/* LOGO */}
        <a onClick={() => handleNavigate('/')} className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
          <img src={Logo} className="w-10" alt="TremLoko Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white dark:text-white">TremLoko</span>
        </a>

        {/* BOTÕES DE LOGIN / PERFIL */}
        <div className="flex items-center md:order-2 space-x-1 md:space-x-2 rtl:space-x-reverse">
          {login ? (
            <div className="flex items-center space-x-2">

              {/* Botão de Chat */}
            <button
              onClick={() => handleNavigate('/chat')}
              className="text-white hover:text-blue-500 transition"
              title="Chat"
            >
              <MessageCircle size={22} />
            </button>

            {/* Botão Criar Torneio */}
            <button
              onClick={() => handleNavigate('/Created')}
              className="text-white hover:text-green-500 transition"
              title="Criar Torneio"
          
            >
              <Plus size={24} />
            </button>

  
          {/* Botão de Notificações */}
          <button
            onClick={() => handleNavigate('/notificacoes')}
            className="text-white hover:text-yellow-400 transition"
            title="Notificações"
          >
            <Bell size={22} />
          </button>


             {/* Avatar + Username */}
             <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNavigate(`/perfil/${encodedUsername}`)}
>
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              /><span className="text-white dark:text-white hover:text-gray-500 font-medium">
                  {user?.username || 'Usuário'}
                </span>

              
            </div>

              <UserMenu />
            </div>

          ) :  (
            <>
              <a
                onClick={() => handleNavigate('/login')}
                className="text-white dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 md:px-5 md:py-2.5 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-gray-800 cursor-pointer"
              >
                Login
              </a>
              <a
                onClick={() => handleNavigate('/cadastro')}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 md:px-5 md:py-2.5 dark:bg-gray-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-gray-800 cursor-pointer"
              >
                Cadastre-se
              </a>
            </>
          )}

          {/* Botão hamburguer para mobile */}
          <button
            data-collapse-toggle="mega-menu"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="mega-menu"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>
        </div>

        {/* MENU DE LINKS */}
        <div id="mega-menu" className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1">
          <ul className="flex flex-col mt-4 font-medium md:flex-row md:mt-0 md:space-x-8 rtl:space-x-reverse">
            <li>
              <a
                onClick={() => handleNavigate('/')}
                className={`block py-2 px-3 border-b border-gray-100 md:border-0 md:p-0 hover:bg-gray-50 md:hover:bg-transparent dark:border-gray-700 cursor-pointer ${
                  location.pathname === '/'
                    ? 'text-blue-600 dark:text-blue-500'
                    : 'text-white dark:text-white md:hover:text-blue-600 md:dark:hover:text-blue-500'
                }`}
              >
                Home
              </a>
            </li>
            <li>
              <a
                onClick={() => handleNavigate('/torneios')}
                className={`block py-2 px-3 border-b border-gray-100 md:border-0 md:p-0 hover:bg-gray-50 md:hover:bg-transparent dark:border-gray-700 cursor-pointer ${
                  location.pathname === '/torneios'
                    ? 'text-blue-600 dark:text-blue-500'
                    : 'text-white dark:text-white md:hover:text-blue-600 md:dark:hover:text-blue-500'
                }`}
              >
                Torneios
              </a>
            </li>
            <li>
              <a
                onClick={() => handleNavigate('/games')}
                className={`block py-2 px-3 border-b border-gray-100 md:border-0 md:p-0 hover:bg-gray-50 md:hover:bg-transparent dark:border-gray-700 cursor-pointer ${
                  location.pathname === '/games' && !location.state?.redirectTo
                    ? 'text-blue-600 dark:text-blue-500'
                    : 'text-white dark:text-white md:hover:text-blue-600 md:dark:hover:text-blue-500'
                }`}
              >
                Jogos
              </a>
            </li>
            <li>
              <a
                onClick={() => handleNavigate('/games', 'ranking')}
                className={`block py-2 px-3 border-b border-gray-100 md:border-0 md:p-0 hover:bg-gray-50 md:hover:bg-transparent dark:border-gray-700 cursor-pointer ${
                  location.pathname === '/games' && location.state?.redirectTo === 'ranking'
                    ? 'text-blue-600 dark:text-blue-500'
                    : 'text-white dark:text-white md:hover:text-blue-600 md:dark:hover:text-blue-500'
                }`}
              >
                Ranking
              </a>
            </li>
          </ul>
        </div>

      </div>


    </nav>
  );
};

export default Navbar;
