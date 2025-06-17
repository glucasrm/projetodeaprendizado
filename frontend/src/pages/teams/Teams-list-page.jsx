//página de lista de equipes 
import React, { useEffect, useState } from 'react';
import EquipeCard from '../../components/teams/Teams-list-card';

const EquipesPage = () => {
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    // Simulando chamada à API
    const fetchEquipes = async () => {
      try {
        setLoading(true);

        // Simula um delay de 1.5 segundos
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Dados simulados como se viessem da API
        const data = [
          {
            id: 1,
            nome: 'Team Alpha',
            avatar: '/images/team-alpha.png',
            membros: 5,
          },
          {
            id: 2,
            nome: 'Los Guerreros',
            avatar: '/images/los-guerreros.png',
            membros: 3,
          },
          {
            id: 3,
            nome: 'Night Foxes',
            avatar: '/images/night-foxes.png',
            membros: 4,
          },
        ];

        setEquipes(data);
      } catch (err) {
        setErro('Erro ao carregar equipes');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipes();
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Minhas Equipes</h1>

        {loading ? (
          <p className="text-gray-400">Carregando equipes...</p>
        ) : erro ? (
          <p className="text-red-500">{erro}</p>
        ) : equipes.length === 0 ? (
          <p className="text-gray-400">Você ainda não faz parte de nenhuma equipe.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipes.map((equipe) => (
              <EquipeCard
                key={equipe.id}
                nome={equipe.nome}
                avatar={equipe.avatar}
                membros={equipe.membros}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipesPage;
