import React from 'react';
import { futurosTorneios, torneiosPassados, topJogadores } from '../mockData';
import TorneioCard from '../components/TorneioCard'
import { apostasRecentes } from '../apostadoData';
import ApostadoCard from '../components/ApostadoCard';


const OverviewPage = () => {
  return (
    <div className="space-y-8 p-4">
     {/* Torneios Futuros */}
<section>
  <h2 className="text-2xl font-bold mb-4">Próximos Torneios</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {futurosTorneios.map((torneio) => (
      <div key={torneio.id}>
        <TorneioCard {...torneio} />
      </div>
    ))}
  </div>
  <button className="mt-4 text-blue-400 hover:underline">Ver todos os torneios</button>
</section>


      {/* Torneios Passados */}
      {/* Torneios Passados */}
<section>
  <h2 className="text-2xl font-bold mb-4">Resultados Recentes</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {torneiosPassados.map((torneio, index) => (
      <TorneioCard
        key={index}
        nome={torneio.nome}
        data={torneio.data}
        vencedor={torneio.vencedor}
        imagem={torneio.imagem} // opcional: caso adicione imagem dos passados
        local={torneio.local || "Indefinido"} // fallback caso não tenha local
        tipo={torneio.tipo || "Indefinido"}
        slots={torneio.slots || 0}
        premiacao={torneio.premiacao}
        tags={torneio.tags || []}
        organizador={torneio.organizador}
      />
    ))}
  </div>
</section>


      {/* Apostas Recentes */}
<section>
  <h2 className="text-2xl font-bold mb-4">Apostas Recentes</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {apostasRecentes.map(aposta => (
      <ApostadoCard key={aposta.id} {...aposta} />
    ))}
  </div>
</section>


      {/* Top Jogadores */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Top Jogadores</h2>
        <div className="flex flex-col gap-2">
          {topJogadores.map(jogador => (
            <div key={jogador.id} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">#{jogador.id} {jogador.nome}</h3>
              <p>Pontos: {jogador.pontos}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default OverviewPage;
