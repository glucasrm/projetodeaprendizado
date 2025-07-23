import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check, X, Clock } from 'lucide-react';
import { friendshipService } from '../services/api';

const FriendRequestCard = ({ request, onUpdate, currentUserId, type = 'received' }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await friendshipService.acceptFriendRequest(request.id, currentUserId);
      onUpdate();
    } catch (error) {
      console.error('Erro ao aceitar pedido:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      await friendshipService.declineFriendRequest(request.id, currentUserId);
      onUpdate();
    } catch (error) {
      console.error('Erro ao recusar pedido:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (nome, sobrenome) => {
    return `${nome?.charAt(0) || ''}${sobrenome?.charAt(0) || ''}`.toUpperCase();
  };

  const friend = type === 'received' ? request.from : request.to;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(friend.nome, friend.sobrenome)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h4 className="font-medium text-sm">
              {friend.nome} {friend.sobrenome}
            </h4>
            <p className="text-xs text-muted-foreground">
              {type === 'received' ? 'Enviou um pedido de amizade' : 'Pedido enviado'}
            </p>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDate(request.createdAt)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {type === 'received' ? (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleAccept}
              disabled={isLoading}
              className="flex-1"
            >
              <Check className="h-3 w-3 mr-1" />
              Aceitar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDecline}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="h-3 w-3 mr-1" />
              Recusar
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center py-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Aguardando resposta
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FriendRequestCard;
