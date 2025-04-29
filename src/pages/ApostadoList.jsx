import React, { useState } from 'react';

const ApostadoList = () => {
  const [etapa, setEtapa] = useState(1); // 1 = Aposta/Mediar, 2 = Modalidade, 3 = Plataforma
  const [tipoAcao, setTipoAcao] = useState(null);
  const [modalidadeSelecionada, setModalidadeSelecionada] = useState(null);
  const [valorSelecionado, setValorSelecionado] = useState(null);
  

  const modalidades = ['1v1', '2v2', '3v3', '4v4'];
  const plataformas = ['Mobile', 'Emulador'];
  const valores = ['R$ 2','R$ 3', 'R$5', 'R$ 10', 'R$ 20','R$ 50', 'R$ 100'];

  const irParaFilaMediacao = () => {
    alert('Você entrou na fila de mediação');
    // Aqui no futuro você pode redirecionar para uma página de mediação ou usar um componente
  };

  const irParaSalaDeEspera = (plataforma) => {
    alert(`Você entrou na sala de espera\nModo: ${modalidadeSelecionada}\nValor: ${valorSelecionado}\nPlataforma: ${plataforma}`);
    // Aqui no futuro você pode redirecionar para uma sala de espera
  };

  return (
    <div className="text-white">
      {/* Etapa 1 - Apostar ou Mediar */}
      {etapa === 1 && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setTipoAcao('Apostar');
              setEtapa(2);
            }}
            className="bg-blue-800 p-4 rounded-lg border hover:border-blue-500 transition"
          >
            Apostar
          </button>
          <button
            onClick={irParaFilaMediacao}
            className="bg-yellow-600 p-4 rounded-lg border hover:border-yellow-500 transition"
          >
            Mediar
          </button>
        </div>
      )}

      {/* Etapa 2 - Modalidade */}
      {etapa === 2 && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {modalidades.map((modo) => (
            <button
              key={modo}
              onClick={() => {
                setModalidadeSelecionada(modo);
                setEtapa(3);
              }}
              className="bg-gray-800 p-4 rounded-lg border hover:border-blue-500 transition"
            >
              {modo}
            </button>
          ))}
          <button
            onClick={() => setEtapa(1)}
            className="col-span-2 text-sm text-gray-400 underline mt-4"
          >
            Voltar
          </button>
        </div>
      )}

      {/* Etapa 3 - Valores */}
      {etapa === 3 && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {valores.map((valor) => (
            <button
              key={valor}
              onClick={() => {
                setValorSelecionado(valor);
                setEtapa(4);
              }}
              className="bg-gray-800 p-4 rounded-lg border hover:border-blue-500 transition"
            >
              {valor}
            </button>
          ))}
          <button
            onClick={() => setEtapa(1)}
            className="col-span-2 text-sm text-gray-400 underline mt-4"
          >
            Voltar
          </button>
        </div>
      )}

      {/* Etapa 4 - Plataforma */}
      {etapa === 4 && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {plataformas.map((plataforma) => (
            <button
              key={plataforma}
              onClick={() => irParaSalaDeEspera(plataforma)}
              className="bg-gray-800 p-4 rounded-lg border hover:border-green-500 transition"
            >
              {plataforma}
            </button>
          ))}
          <button
            onClick={() => setEtapa(2)}
            className="col-span-2 text-sm text-gray-400 underline mt-4"
          >
            Voltar
          </button>
        </div>
      )}
    </div>
  );
};

export default ApostadoList;
