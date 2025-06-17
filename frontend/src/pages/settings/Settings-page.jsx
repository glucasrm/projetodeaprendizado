// src/pages/Settings.jsx
import axios from 'axios';
import { useState, useEffect } from "react";
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

export default function Settings () {
  
  const [abaAtiva, setAbaAtiva] = useState("conta");
  const [username, Setusername] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [banner, setBanner] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bio, setBio] = useState("");
  const [fileError, setFileError] = useState(null); // <-- NOVO ESTADO PARA ERRO DE ARQUIVO

  // Lógica de busca inicial do perfil
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token não encontrado. Redirecionando para login...");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:3000/api/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
         );

        const profileData = response.data;
        if (profileData) {
          Setusername(profileData.username || "");
          setBio(profileData.bio || "");
          
          if (profileData.avatar) {
            setAvatarPreview(`http://localhost:3000${profileData.avatar}` );
          } else {
            setAvatarPreview(null);
          }
          if (profileData.banner) {
            setBannerPreview(`http://localhost:3000${profileData.banner}` );
          } else {
            setBannerPreview(null);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleusername = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      alert("Preencha o nome de usuário!");
      return;
    }

    // Limpa qualquer erro de arquivo anterior ao tentar salvar
    setFileError(null);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("bio", bio);
    if (avatar) formData.append("avatar", avatar);
    if (banner) formData.append("banner", banner);

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Você não está autenticado. Faça login novamente.");
      return;
    }

    try {
      const profileuser = await axios.post(
        "http://localhost:3000/api/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
       );
      alert("Perfil atualizado!");

      const updatedProfileData = profileuser.data.profile;
      if (updatedProfileData) {
        const newAvatarUrl = updatedProfileData.avatar ? `http://localhost:3000${updatedProfileData.avatar}` : null;
        const newBannerUrl = updatedProfileData.banner ? `http://localhost:3000${updatedProfileData.banner}` : null;

        setAvatarPreview(newAvatarUrl );
        setBannerPreview(newBannerUrl);

        Setusername(updatedProfileData.username || "");
        setBio(updatedProfileData.bio || "");
        setAvatar(null);
        setBanner(null);
      }

    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar perfil");
    }
  };

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

            {/* Mensagem de erro de arquivo */}
            {fileError && (
              <div className="bg-red-800 text-white p-3 rounded-md mb-4">
                {fileError}
              </div>
            )}

            <div className="space-y-8">
              {/* Banner */}
              <div className="relative h-40 w-full bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner Preview" className="object-cover w-full h-full"  /> 
                ) : (
                  <span className="text-gray-400">Banner do Perfil</span>
                )}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Alterar banner"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
                      if (!allowedTypes.includes(file.type)) {
                        setFileError("Por favor, selecione um arquivo de imagem (JPG, PNG, GIF, WEBP) para o banner."); // <-- ATUALIZA ESTADO DE ERRO
                        e.target.value = null;
                        setBanner(null); // Limpa o arquivo selecionado
                        setBannerPreview(null); // Limpa a pré-visualização
                        return;
                      }
                      setFileError(null); // Limpa o erro se o arquivo for válido
                      setBanner(file);
                      setBannerPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>

              {/* Avatar */}
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full bg-gray-800 border-4 border-gray-700 overflow-hidden flex items-center justify-center">
                   {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar Preview" className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-gray-500">Avatar</span>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <input type="file" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
                      if (!allowedTypes.includes(file.type)) {
                        setFileError("Por favor, selecione um arquivo de imagem (JPG, PNG, GIF, WEBP) para o avatar."); // <-- ATUALIZA ESTADO DE ERRO
                        e.target.value = null;
                        setAvatar(null); // Limpa o arquivo selecionado
                        setAvatarPreview(null); // Limpa a pré-visualização
                        return;
                      }
                      setFileError(null); // Limpa o erro se o arquivo for válido
                      setAvatar(file);
                      setAvatarPreview(URL.createObjectURL(file));
                    }
                  }} />
                </label>
              </div>

              {/* Nome de usuário */}
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Nome de Usuário
                </label>
                <input onChange={(e) => Setusername(e.target.value)}
                  type="text"
                  className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white"
                  value={username}
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
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white"
                  value={bio}
                ></textarea>
              </div>

              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleusername}>
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
