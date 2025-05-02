{/*componente usado no perfil do usuário */}

import { Card, CardContent } from "../ui/card";
import { Badge } from "@/components/ui/badge";
import { FaInstagram } from "react-icons/fa";

const VisaoGeralCard = ({ texto, idioma, gamesaccount }) => { 
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Card About */}
      <div className="flex-1">
        <Card className="bg-[#1E293B] text-white rounded-2xl shadow-md h-full">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Sobre</h2>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Biografia</h3>
              <p className="text-base mt-1">{texto}</p>
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
                <a href="#" className="text-white hover:text-blue-400">
                  <FaInstagram size={28} />
                </a>
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
