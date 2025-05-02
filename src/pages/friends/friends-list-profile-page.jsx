//página de lista de amigos do perfil do usuário

import { useContext } from 'react';
import { UserContext } from '../../components/navbar/MainLayout';
import { Button } from "../../components/ui/button";
import AmigoCard from '../../components/friends/Friend-teams-Card';

const AmigosList = () => {
  const { user } = useContext(UserContext);

  // 👇 Correção: usar dados de teste se não tiver amigos no contexto
  const amigos = user?.amigos?.length > 0 ? user.amigos : [
    { id: 1, name: "Lucas Silva", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
    { id: 2, name: "Mariana Costa", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
    { id: 3, name: "João Pedro", avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
    { id: 4, name: "Ana Paula", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
  ];

  if (amigos.length === 0) {
    return (
      <div className="text-center">
        <p className="text-lg mb-4">Você ainda não tem amigos.</p>
        <Button variant="default" className="bg-blue-700 hover:bg-blue-800">
          Adicionar Amigos
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {amigos.map((amigo) => (
        <AmigoCard key={amigo.id} amigo={amigo} />
      ))}
    </div>
  );
};

export default AmigosList;
