// src/pages/Settings.jsx
import axios from 'axios';
import { useState, useEffect, useContext } from "react";
import UserContext from '../../context/UserContext';
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
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [socialLinks, setSocialLinks] = useState([]); // Se quiser exibir uma lista das já cadastradas
  const { user, login } = useContext(UserContext);



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

  const handleAddSocialLink = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Você não está autenticado.");
    return;
  }

  if (!selectedPlatform || !socialUrl.startsWith('http')) {
    alert("Preencha a plataforma e coloque uma URL válida com http:// ou https://");
    return;
  }

  try {
    await axios.post(
      "http://localhost:3000/api/profile/social-links",
      {
        platform: selectedPlatform,
        url: socialUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Rede social adicionada!");
    setSelectedPlatform("");
    setSocialUrl("");
  } catch (error) {
    console.error("Erro ao adicionar rede social:", error);
    alert("Erro ao adicionar rede social.");
  }
};


  //aba de informações pessoais  
  useEffect(() => {
  const fetchAccountInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get("http://localhost:3000/api/account/account-info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      setNome(data.nome || "");
      setSobrenome(data.sobrenome || "");
      setEmail(data.email || "");
      setTelefone(data.telefone || "");
      setDataNascimento(data.dataNascimento ? data.dataNascimento.slice(0, 10) : ""); // Corta o timestamp
      setGenero(data.genero || "");
    } catch (error) {
      console.error("Erro ao buscar informações da conta:", error);
    }
  };

  if (abaAtiva === "pessoais") {
    fetchAccountInfo();
  }
}, [abaAtiva]);

const handleSaveAccountInfo = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Você não está autenticado. Faça login novamente.");
    return;
  }

  try {
    await axios.post(
      "http://localhost:3000/api/account/account-info",
      {
        nome,
        sobrenome,
        telefone,
        dataNascimento,
        genero,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Informações pessoais salvas com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar informações pessoais:", error);
    alert("Erro ao salvar informações pessoais.");
  }
};

//mostrar as redes sociais já cadastradas
useEffect(() => {
  const fetchSocialLinks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get("http://localhost:3000/api/profile/social-links", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSocialLinks(response.data);
    } catch (error) {
      console.error("Erro ao buscar redes sociais:", error);
    }
  };

  if (abaAtiva === "conta") {
    fetchSocialLinks();
  }
}, [abaAtiva]);


  return ( 
    login?(<div className="flex min-h-screen text-white bg-gray-900">
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

                <div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Redes Sociais Salvas:</h3>

              {socialLinks.length === 0 && <p className="text-gray-400">Nenhuma rede social adicionada ainda.</p>}

                        {socialLinks.map((link) => (
            <div key={link.id} className="flex items-center space-x-2 mb-2">
              <span className="capitalize">{link.platform}:</span>
              <input
                type="text"
                value={link.url}
                onChange={(e) => {
                  const updatedLinks = socialLinks.map((l) =>
                    l.id === link.id ? { ...l, url: e.target.value } : l
                  );
                  setSocialLinks(updatedLinks);
                }}
                className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 text-white"
              />

              <button
                onClick={async () => {
                  const token = localStorage.getItem("token");
                  try {
                    await axios.put(
                      `http://localhost:3000/api/profile/social-links/${link.id}`,
                      { url: link.url },
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    alert("Rede social atualizada!");
                  } catch (error) {
                    console.error("Erro ao atualizar:", error);
                    alert("Erro ao atualizar a rede social.");
                  }
                }}
                className="bg-blue-600 text-white px-2 py-1 rounded"
              >
                Salvar
              </button>

              <button
                onClick={async () => {
                  const token = localStorage.getItem("token");
                  try {
                    await axios.delete(
                      `http://localhost:3000/api/profile/social-links/${link.id}`,
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    setSocialLinks(socialLinks.filter((l) => l.id !== link.id));
                    alert("Rede social deletada!");
                  } catch (error) {
                    console.error("Erro ao deletar:", error);
                    alert("Erro ao deletar a rede social.");
                  }
                }}
                className="bg-red-600 text-white px-2 py-1 rounded"
              >
                Excluir
              </button>
            </div>
          ))}

            </div>


              <label className="block text-sm font-medium mb-1">A dicionar Rede Social</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 mb-2"
              >
                <option value="">Selecione uma plataforma</option>
                <option value="discord">Discord</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="facebook">Facebook</option>
              </select>

              {selectedPlatform && (
                <>
                  <input
                    type="text"
                    placeholder="Digite o link da sua rede social"
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700 mb-2"
                    value={socialUrl}
                    onChange={(e) => setSocialUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddSocialLink}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Salvar Rede Social
                  </button>
                </>
              )}
            </div>

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
            <form onSubmit={handleSaveAccountInfo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Primeiro Nome</label>
              <input
                type="text"
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sobrenome</label>
              <input
                type="text"
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                value={sobrenome}
                onChange={(e) => setSobrenome(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
              <input
                type="date"
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                value={email}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input
                type="tel"
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gênero</label>
              <select
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <button
              type="submit"
              className="col-span-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
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
):(
  <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white text-2xl">
    Usuário não logado.
  </div>
)
      );

};