import {TrendingUp, Calendar, Sidebar, Trophy } from "lucide-react";

export default function Main() {
  return (
    <>
      <main className="border-b border-gray-700 flex flex-col items-center justify-center min-h-screen px-6 py-48">
        <div className="w-full max-w-4xl">
          {/* Título */}
          <div className="flex flex-col items-start">
            <h1 className="text-white text-5xl font-bold">
              Ganhe dinheiro
            </h1>
            <h1 className="text-white text-5xl font-bold">Competindo</h1>
          </div>

          {/* Descrição principal */}
          <div className="mt-5 text-2xl text-white">
            <p>Participe de torneios emocionantes,</p>
            <p>desafie outros jogadores e conquiste prêmios em dinheiro.</p>
            <p>
              Mostre suas habilidades, suba no ranking e transforme diversão em
              lucro!
            </p>
          </div>

         
            
           
          
          
          {/* Subtítulos lado a lado */}
          <div className="flex flex-row gap-44 mt-12">
            {/* Subtítulo 1 */}
            <div>
            <Trophy className="mt-30 text-white" size={48} />
              <div className="text-lg mt-7">
              <h2 className="text-white font-bold">Ganhe seus troféus</h2>
              <p className=" text-gray-300 mt-3">Mostre seu potencial,</p>
              <p className=" text-gray-300">e suba no ranking</p>
              </div>
            </div>

            {/* Subtítulo 2 */}
            <div>
            <Calendar className="mt-30 text-white "size={48}/>
              <div className="text-lg mt-7">
              <h2 className="text-white font-bold">Torneios todos os dias</h2>
              <p className="   text-gray-300 mt-3">Todo dia uma nova chance de competir,</p >
              <p className="  text-gray-300">conquistar e serreconhecido!</p>
              </div>
            </div>

            {/* Subtítulo 3 (vazio por enquanto) */}
            <div >
            <TrendingUp className="mt-30 text-white "size={48}/>
              <div className=" text-lg mt-7">
              <h2 className="font-bold text-white">Crie seus torneios</h2>
              <p className="text-gray-300 mt-3">Organize competições personalizadas, convide amigos e</p>
              <p className="text-gray-300">mostre quem manda no jogo. Sua arena, suas regras</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
