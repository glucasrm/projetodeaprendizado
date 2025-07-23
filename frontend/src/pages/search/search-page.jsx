import { useState, useEffect, useContext, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Search, UserPlus, Users, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { UserContext } from '../../context/UserContext';
// Importação correta dos serviços da API. Verifique se este caminho está correto para o seu projeto.
// Assumindo que 'api.js' está em 'src/services/api.js' e este componente está em 'src/pages/SearchPage.jsx'
import { friendshipService, userService } from '../../../../backend/src/services/api'; 

const UserSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useContext(UserContext);

  useEffect(() => {
    console.log('Estado do usuário no UserContext:', user);
    if (user?.id) {
      console.log('ID do usuário no UserContext:', user.id);
    } else {
      console.log('Usuário não logado ou ID indisponível no UserContext.');
    }
  }, [user]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await userService.searchUsers(searchQuery.trim());
      setSearchResults(response.data || []);
      console.log('Busca realizada com sucesso. Resultados:', response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar usuários. Tente novamente.';
      setError(errorMessage);
      console.error('Erro na busca:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const loadSuggestedUsers = useCallback(async () => {
    console.log('Tentando carregar usuários sugeridos. user.id:', user?.id);
    if (!user?.id) {
      setSuggestedUsers([]);
      return;
    }

    try {
      const response = await userService.getSuggestedUsers(user.id, 5);
      setSuggestedUsers(response.data || []);
      console.log('Usuários sugeridos carregados. Resultados:', response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar usuários sugeridos.';
      setError(errorMessage);
      console.error('Erro ao carregar usuários sugeridos:', err);
    }
  }, [user?.id]);

  const handleSendFriendRequest = async (receiverId, userListType) => {
    console.log('Botão Adicionar clicado. user.id no momento:', user?.id);

    if (!user?.id) {
      setError('Você precisa estar logado para enviar pedidos de amizade.');
      return;
    }

    try {
      console.log(`Enviando pedido de amizade: requesterId=${user.id}, receiverId=${receiverId}`);
      await friendshipService.sendFriendRequest(null, receiverId); 
      setError('');

      // Após enviar, recarrega as listas para obter o status atualizado e friendshipId
      // Isso é mais robusto do que tentar atualizar o estado manualmente aqui.
      loadSuggestedUsers(); 
      handleSearch(); 

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao enviar pedido de amizade.';
      setError(errorMessage);
      console.error('Erro ao enviar pedido:', err);
    }
  };

  const handleAcceptFriendRequest = async (friendshipId, userListType) => {
    if (!user?.id) {
      setError('Você precisa estar logado para aceitar pedidos de amizade.');
      return;
    }

    try {
      // friendshipId agora é o ID do registro de amizade, vindo do backend
      await friendshipService.acceptFriendRequest(friendshipId, user.id);
      setError('');

      // Após aceitar, recarrega as listas para obter o status atualizado
      loadSuggestedUsers(); 
      handleSearch(); 

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao aceitar pedido de amizade.';
      setError(errorMessage);
      console.error('Erro ao aceitar pedido:', err);
    }
  };

  const getInitials = (nome, sobrenome) => {
    return `${nome?.charAt(0) || ''}${sobrenome?.charAt(0) || ''}`.toUpperCase();
  };

  const getUserDisplayName = (searchUser) => {
    return searchUser.profile?.username || `${searchUser.nome} ${searchUser.sobrenome}`;
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    loadSuggestedUsers();
  }, [user?.id, loadSuggestedUsers]);

  const renderActionButton = (targetUser, userListType) => {
    if (targetUser.id === user?.id) {
      return <Badge variant="secondary">Você</Badge>;
    }

    switch (targetUser.friendshipStatus) {
      case 'pending_sent':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pendente
          </Badge>
        );
      case 'pending_received':
        // Agora, targetUser.friendshipId deve estar disponível vindo do backend
        if (!targetUser.friendshipId) {
            console.warn(`friendshipId não encontrado para usuário ${targetUser.id} com status pending_received. Isso indica um problema no backend.`);
            return (
                <Badge variant="destructive">Erro Status (ID ausente)</Badge>
            );
        }
        return (
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 border-green-600 flex items-center gap-1"
            onClick={() => handleAcceptFriendRequest(targetUser.friendshipId, userListType)} // <-- MUDANÇA AQUI!
          >
            <CheckCircle className="h-3 w-3" /> Aceitar
          </Button>
        );
      case 'friends':
        return (
          <Badge variant="outline" className="text-green-600 border-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Amigos
          </Badge>
        );
      case 'none':
      default:
        return (
          <Button
            size="sm"
            onClick={() => handleSendFriendRequest(targetUser.id, userListType)}
            className="flex items-center gap-1"
            disabled={!user?.id}
          >
            <UserPlus className="h-3 w-3" />
            Adicionar
          </Button>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Usuários
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Digite nome, username ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {!searchQuery.trim() && suggestedUsers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                Usuários sugeridos
              </div>

              <div className="grid gap-3">
                {suggestedUsers.map((suggestedUser) => (
                  <Card key={suggestedUser.id} className="transition-all duration-200 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(suggestedUser.nome, suggestedUser.sobrenome)}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <h3 className="font-medium text-lg">
                              {suggestedUser.nome} {suggestedUser.sobrenome}
                            </h3>
                            <p className="text-sm text-gray-600">@{getUserDisplayName(suggestedUser)}</p>
                            <p className="text-xs text-gray-500">{suggestedUser.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {renderActionButton(suggestedUser, 'suggested')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Buscando usuários...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {searchResults.length} usuário(s) encontrado(s)
                </div>

                <div className="grid gap-3">
                  {searchResults.map((searchUser) => (
                    <Card key={searchUser.id} className="transition-all duration-200 hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(searchUser.nome, searchUser.sobrenome)}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <h3 className="font-medium text-lg">
                                {searchUser.nome} {searchUser.sobrenome}
                              </h3>
                              <p className="text-sm text-gray-600">@{getUserDisplayName(searchUser)}</p>
                              <p className="text-xs text-gray-500">{searchUser.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {renderActionButton(searchUser, 'search')}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : searchQuery.trim() && !isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum usuário encontrado para "{searchQuery}"</p>
                <p className="text-sm">Tente usar termos diferentes</p>
              </div>
            ) : !searchQuery.trim() && suggestedUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Digite algo para buscar usuários</p>
                <p className="text-sm">Você pode buscar por nome, username ou email</p>
              </div>
            ) : null}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Dicas de Busca</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use nomes completos ou parciais</li>
              <li>• Busque por username (ex: @joao_silva)</li>
              <li>• Digite o email do usuário</li>
              <li>• A busca é feita em tempo real conforme você digita</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSearchPage;
