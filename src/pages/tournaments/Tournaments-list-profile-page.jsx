import { useContext } from 'react';
import { UserContext } from '../../components/navbar/MainLayout';
import { Button } from '../../components/ui/button';
import TorneioCard from '../../components/tournaments/Tournaments-Card';

const TorneiosDoUsuario = () => {
  const { user } = useContext(UserContext);

  // Simulação de torneios jogados
  const torneios = user?.torneios?.length > 0 ? user.torneios : [
    {
      id: 1,
      nome: "Copa ReactJS 2025",
      imagem: "https://source.unsplash.com/featured/?esports,tournament",
      data: "12/05/2025",
      horario: "18:00",
      local: "Online",
      tipo: "5v5",
      slots: 32,
      organizador: "Dev League",
      premiacao: "R$ 5.000,00",
      tags: ["FPS", "Competitivo", "Nacional"]
    },
    {
      id: 2,
      nome: "Frontend Clash",
      imagem: "https://source.unsplash.com/featured/?gaming,frontend",
      data: "28/04/2025",
      horario: "16:00",
      local: "São Paulo - SP",
      tipo: "1v1",
      slots: 16,
      organizador: "Code Wars",
      premiacao: "Monitor Gamer 144hz",
      tags: ["HTML", "CSS", "Design"]
    }
  ];

  if (torneios.length === 0) {
    return (
      <div className="text-center">
        <p className="text-lg mb-4">Você ainda não participou de nenhum torneio.</p>
        <Button variant="default" className="bg-blue-700 hover:bg-blue-800">
          Procurar Torneios
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {torneios.map((torneio) => (
        <TorneioCard key={torneio.id} {...torneio} />
      ))}
    </div>
  );
};

export default TorneiosDoUsuario;
