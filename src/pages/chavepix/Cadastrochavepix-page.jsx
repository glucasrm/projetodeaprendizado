import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard } from "lucide-react";

const CadastroChave = () => {
  const [chavePix, setChavePix] = useState("");
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const chaveSalva = localStorage.getItem("chavePix");
    if (chaveSalva) setChavePix(chaveSalva);
  }, []);

  const handleSalvar = () => {
    if (!chavePix.trim()) {
      setMensagem("Por favor, insira uma chave válida.");
      return;
    }

    localStorage.setItem("chavePix", chavePix);
    setMensagem("Chave Pix salva com sucesso!");

    setTimeout(() => {
      navigate("/carteira");
    }, 1500); // redireciona após 1,5s
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <CreditCard className="w-8 h-8" />
        Cadastro de Chave Pix
      </h1>

      <input
        type="text"
        value={chavePix}
        onChange={(e) => setChavePix(e.target.value)}
        placeholder="Insira sua chave Pix (email, CPF, etc)"
        className="w-full max-w-md p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      />

      <button
        onClick={handleSalvar}
        className="bg-blue-600 hover:bg-blue-700 transition p-4 rounded-lg font-medium w-full max-w-md"
      >
        {localStorage.getItem("chavePix") ? "Substituir Chave" : "Cadastrar Chave"}
      </button>

      {mensagem && <p className="text-green-400 mt-4">{mensagem}</p>}
    </div>
  );
};

export default CadastroChave;
