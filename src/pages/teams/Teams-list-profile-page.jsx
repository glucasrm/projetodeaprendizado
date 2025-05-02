//página de lista de teams no perfil do usuário
import { useContext } from 'react';
import { UserContext } from '../../components/navbar/MainLayout';
import { Button } from "../../components/ui/button";
import AmigoCard from '../../components/friends/Friend-teams-Card';

const EquipeList = () => {
  const { user } = useContext(UserContext);

  // Simulação de equipes
  const equipes = user?.equipes?.length > 0 ? user.equipes : [
    { id: 101, name: "Frontend Ninjas", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=Frontend" },
    { id: 102, name: "Backend Brawlers", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=Backend" },
    { id: 103, name: "Fullstack Force", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=Fullstack" },
    { id: 104, name: "UX Avengers", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=UX" },
  ];

  if (equipes.length === 0) {
    return (
      <div className="text-center">
        <p className="text-lg mb-4">Você ainda não está em nenhuma equipe.</p>
        <Button variant="default" className="bg-blue-700 hover:bg-blue-800">
          Criar ou Entrar em Equipe
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {equipes.map((equipe) => (
        <AmigoCard key={equipe.id} amigo={equipe} type="equipe" />
      ))}
    </div>
  );
};

export default EquipeList;
