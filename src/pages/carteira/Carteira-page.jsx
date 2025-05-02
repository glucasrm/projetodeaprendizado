import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDown, ArrowUp, Wallet, QrCode, CreditCard } from "lucide-react";

const Carteira = () => {
  const [saldo, setSaldo] = useState(150.75);
  const navigate = useNavigate(); // ← Adicionado aqui
  
  const [chavePix, setChavePix] = useState("");

useEffect(() => {
  const chave = localStorage.getItem("chavePix");
  if (chave) setChavePix(chave);
}, []);


  const handleCadastroChave = () => {
    navigate("/cadastrochave"); // ← Correto agora
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Wallet className="w-8 h-8" />
        Minha Carteira
      </h1>

      {/* Saldo + Chave Pix */}
<div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow mb-8">
  <p className="text-gray-400">Saldo disponível</p>
  <h2 className="text-4xl font-bold mt-2">R$ {saldo.toFixed(2)}</h2>

  {chavePix && (
    <div className="mt-6">
      <p className="text-gray-400 text-sm">Chave Pix cadastrada:</p>
      <div className="flex items-center justify-between bg-gray-700 px-4 py-2 rounded mt-1">
        <span>{chavePix}</span>
        <button
          onClick={() => {
            localStorage.removeItem("chavePix");
            setChavePix("");
          }}
          className="text-red-400 hover:underline text-sm"
        >
          Remover
        </button>
      </div>
    </div>
  )}
</div>


      {/* Ações */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button className="bg-blue-600 hover:bg-blue-700 transition p-4 rounded-lg flex items-center justify-center gap-2 font-medium">
          <ArrowUp className="w-5 h-5" />
          Depositar
        </button>
        <button className="bg-red-600 hover:bg-red-700 transition p-4 rounded-lg flex items-center justify-center gap-2 font-medium">
          <ArrowDown className="w-5 h-5" />
          Sacar
        </button>
        <button className="bg-gray-700 hover:bg-gray-600 transition p-4 rounded-lg flex items-center justify-center gap-2 font-medium">
          <QrCode className="w-5 h-5" />
          Receber via Pix
        </button>
        <button
          onClick={handleCadastroChave}
          className="bg-gray-700 hover:bg-gray-600 transition p-4 rounded-lg flex items-center justify-center gap-2 font-medium"
        >
          <CreditCard className="w-5 h-5" />
          Cadastrar Chave
        </button>
      </div>

      {/* Histórico */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-semibold mb-4">Histórico de Transações</h2>
        <ul className="space-y-3">
          <li className="flex justify-between">
            <span className="text-green-400">+ R$ 50,00</span>
            <span className="text-gray-400">Depósito - 20/04/2025</span>
          </li>
          <li className="flex justify-between">
            <span className="text-red-400">- R$ 30,00</span>
            <span className="text-gray-400">Saque - 18/04/2025</span>
          </li>
          <li className="flex justify-between">
            <span className="text-green-400">+ R$ 100,00</span>
            <span className="text-gray-400">Pix Recebido - 15/04/2025</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Carteira;
