//componente usado na navbar
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import {
  ChevronDown,
  User,
  Wallet,
  Info,
  Gamepad,
  Users,
  Trophy,
  Settings,
  LogOut
} from 'lucide-react';

const UserMenu = ({ user }) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    // Aqui você pode limpar o token, estado global, etc.
    // Exemplo:
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-2 cursor-pointer">
        <ChevronDown className="w-4 h-4 text-white" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="mt-2 text-white bg-gray-900 rounded-md shadow-lg w-48">
        <DropdownMenuItem onClick={() => handleNavigate('/perfil')}>
          <User className="w-4 h-4 mr-2" /> Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigate('/carteira')}>
          <Wallet className="w-4 h-4 mr-2" /> Carteira
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigate('/jogos')}>
          <Gamepad className="w-4 h-4 mr-2" /> Jogos
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigate('/equipes-page')}>
          <Users className="w-4 h-4 mr-2" /> Equipes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigate('/torneios')}>
          <Trophy className="w-4 h-4 mr-2" /> Torneios
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigate('/configuracoes')}>
          <Settings className="w-4 h-4 mr-2" /> Configurações
        </DropdownMenuItem>

        <div className="border-t border-gray-700 my-1"></div>

        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2 text-red-500" /> <span className="text-red-500">Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu; 
