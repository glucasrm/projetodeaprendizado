import { useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from '../../context/UserContext'; // Ajuste o caminho se necessário
import { Button } from "../../components/ui/button";
import AmigoCard from '../../components/friends/Friend-teams-Card';
import { friendshipService } from '../../../../backend/src/services/api'; // Importe o serviço de amizade
import { Loader2, Users, AlertCircle } from 'lucide-react'; // Ícones para loading e erro
import { useNavigate } from 'react-router-dom'; // Para navegação

const AmigosList = () => {
  const { user } = useContext(UserContext);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Começa como true para indicar carregamento inicial
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchFriends = useCallback(async () => {
    if (!user?.id) {
      // Se o usuário não estiver logado, não há amigos para buscar
      setFriends([]);
      setIsLoading(false);
      setError('Você precisa estar logado para ver seus amigos.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      // Chama o serviço de amizade para obter a lista de amigos
      const response = await friendshipService.getFriends(user.id);
      // A resposta do backend é { message: '...', data: [...], total: ... }
      // Mapeamos os dados para o formato esperado pelo AmigoCard
      const formattedFriends = response.data.map(item => ({
        id: item.friend.id,
        friendshipId: item.friendshipId, // Mantém o friendshipId se precisar para remover amizade
        name: item.friend.profile?.username || `${item.friend.nome} ${item.friend.sobrenome}`, // Prioriza username
        avatar: item.friend.profile?.avatar || `https://placehold.co/100x100/aabbcc/ffffff?text=${item.friend.profile?.username?.charAt(0) || item.friend.nome?.charAt(0) || '?'}` // Fallback para avatar
      }));
      setFriends(formattedFriends);
    } catch (err) {
      console.error('Erro ao carregar amigos:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao carregar a lista de amigos.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]); // Recarrega se o ID do usuário mudar

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]); // Executa fetchFriends quando o componente monta ou fetchFriends muda

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Carregando amigos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-red-700">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p className="text-lg mb-2">{error}</p>
        <Button onClick={fetchFriends} variant="outline" className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg mb-4 text-gray-700">Você ainda não tem amigos.</p>
        <Button 
          variant="default" 
          className="bg-blue-700 hover:bg-blue-800"
          onClick={() => navigate('/search')} // Navega para a página de busca
        >
          Adicionar Amigos
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
      {friends.map((amigo) => (
        // Passamos o objeto amigo completo, que agora inclui name e avatar formatados
        <AmigoCard key={amigo.id} amigo={amigo} /> 
      ))}
    </div>
  );
};

export default AmigosList;
