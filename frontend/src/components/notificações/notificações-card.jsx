import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, Trash2, ExternalLink } from 'lucide-react';
import { notificationService } from '../../../../backend/src/services/notificações-services';

const NotificationCard = ({ notification, onUpdate, currentUserId }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsRead = async () => {
    if (notification.read) return;
    
    setIsLoading(true);
    try {
      await notificationService.markAsRead(notification.id, currentUserId);
      onUpdate();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await notificationService.deleteNotification(notification.id, currentUserId);
      onUpdate();
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_invite':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'friend_accepted':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'friend_declined':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'friend_invite':
        return 'bg-blue-50 border-blue-200';
      case 'friend_accepted':
        return 'bg-green-50 border-green-200';
      case 'friend_declined':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d atrás`;
    }
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${
        !notification.read 
          ? `${getNotificationColor(notification.type)} border-l-4` 
          : 'bg-white border-gray-200'
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getNotificationIcon(notification.type)}
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{notification.message}</h4>
              {!notification.read && (
                <Badge variant="secondary" className="text-xs">
                  Nova
                </Badge>
              )}
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(notification.createdAt)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">
          {notification.content}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {notification.link && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = notification.link}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Ver
              </Button>
            )}
            
            {!notification.read && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleMarkAsRead}
                disabled={isLoading}
              >
                <Check className="h-3 w-3 mr-1" />
                Marcar como lida
              </Button>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
