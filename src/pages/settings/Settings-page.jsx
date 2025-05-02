//página de settings

import { useState } from "react";
import {
  Camera,
  UserCircle,
  Info,
  Bell,
  User,
  Mail,
  Phone,
  Calendar,
  Venus,
} from "lucide-react";

const tabs = [
  { id: "conta", label: "Conta", icon: <UserCircle className="w-5 h-5 mr-2" /> },
  { id: "pessoais", label: "Informações Pessoais", icon: <Info className="w-5 h-5 mr-2" /> },
  { id: "notificacoes", label: "Notificações", icon: <Bell className="w-5 h-5 mr-2" /> },
];

const Configuracoes = () => {
  const [abaAtiva, setAbaAtiva] = useState("conta");

  return (
    <div className="flex min-h-screen text-white bg-gray-900">
      {/* Abas laterais */}
      <aside className="w-1/4 bg-gray-900 p-6 border-r border-gray-700 shadow-sm">
        <nav className="space-y-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAbaAtiva(tab.id)}
              className={`w-full flex items-center text-left px-4 py-2 rounded-md transition ${
                abaAtiva === tab.id
                  ? "bg-gray-800 font-semibold"
                  : "hover:bg-gray-800"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Conteúdo da aba */}
      <main className="flex-1 p-8">
        {abaAtiva === "conta" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Configurações da Conta</h2>

            <div className="space-y-8">
              {/* Banner */}
              <div className="relative h-40 w-full bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                <span className="text-gray-400">Banner do Perfil</span>
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Alterar banner"
                />
              </div>

              {/* Avatar */}
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full bg-gray-800 border-4 border-gray-700 overflow-hidden flex items-center justify-center">
                  <span className="text-gray-500">Avatar</span>
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <input type="file" className="hidden" />
                </label>
              </div>

              {/* Nome de usuário */}
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Nome de Usuário
                </label>
                <input
                  type="text"
                  className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Bio
                </label>
                <textarea
                  rows="3"
                  className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white"
                ></textarea>
              </div>

              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Salvar
              </button>
            </div>
          </div>
        )}

        {/* Informações Pessoais */}
        {abaAtiva === "pessoais" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Informações Pessoais</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Primeiro Nome
                </label>
                <input type="text" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Sobrenome
                </label>
                <input type="text" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Data de Nascimento
                </label>
                <input type="date" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </label>
                <input type="email" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Telefone
                </label>
                <input type="tel" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <Venus className="w-4 h-4 mr-2" />
                  Gênero
                </label>
                <select className="w-full p-2 rounded bg-gray-800 border border-gray-700">
                  <option value="">Selecione</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <button className="col-span-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Salvar
              </button>
            </form>
          </div>
        )}

        {abaAtiva === "notificacoes" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Notificações</h2>
            <p className="text-gray-400">Em breve...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Configuracoes;
