{/*componente usado no perfil do usuário */}

import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { FaInstagram, FaFacebook, FaYoutube, FaDiscord } from "react-icons/fa";
import {useContext, useEffect, useState} from 'react';
import UserContext from "../../context/UserContext";
import axios from 'axios';

const VisaoGeralCard = ({ texto, idioma, gamesaccount, socialLinks: socialLinksProp }) => { 

  const { user } = useContext(UserContext);
  const [socialLinks, setSocialLinks] = useState([]);

useEffect(() => {
  const fetchSocialLinks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:3000/api/profile/social-links", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSocialLinks(res.data);
    } catch (error) {
      console.error("Erro ao buscar redes sociais:", error);
    }
  };

  
    fetchSocialLinks();
}, []);


  const renderIcon = (platform) => {
    switch (platform) {
      case 'instagram':
        return <FaInstagram size={28} />;
      case 'facebook':
        return <FaFacebook size={28} />;
      case 'youtube':
        return <FaYoutube size={28} />;
      case 'discord':
        return <FaDiscord size={28} />;
      default:
        return null;
    }
  };
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Card About */}
      <div className="flex-1">
        <Card className="bg-[#1E293B] text-white rounded-2xl shadow-md h-full">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Sobre</h2>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Biografia</h3>
              <p className="text-base mt-1">{user?.bio || 'Bio'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Idiomas</h3>
              <Badge className="bg-[#334155] text-white px-3 py-1 rounded-full mt-1">
                {idioma}
              </Badge>
            </div>
      <div>
              <h3 className="text-sm font-medium text-gray-400">Redes sociais</h3>
              <div className="flex items-center gap-3 mt-2">
                {socialLinks.length > 0 ? (
                  socialLinks.map((link) => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400">
                      {renderIcon(link.platform)}
                    </a>
                  ))
                ) : (
                  <p className="text-gray-500">Nenhuma rede social adicionada.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card Game Accounts */}
      <div className="flex-1">
        <Card className="bg-[#1E293B] text-white rounded-2xl shadow-md h-full">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Game Accounts</h2>
            <div>
              <h3 className="text-base font-medium">{gamesaccount}</h3>
              <div className="flex items-center justify-between bg-[#334155] p-3 rounded-lg mt-3">
                <div className="flex items-center gap-2">
                  <img src="/logo_freefire.png" alt="Free Fire" className="w-8 h-8" />
                  <span className="font-semibold">GGL?</span>
                </div>
                <button className="text-gray-400 hover:text-gray-200">•••</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisaoGeralCard;
