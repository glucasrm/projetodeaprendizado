import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { motion } from 'framer-motion';
import { futurosTorneios } from '../../mockData';
import {
  Paintbrush,
  Users,
  Calendar,
  Gift,
  Handshake,
  Mail,
  ListOrdered,
  Brackets,
  Upload,
  Info,
} from 'lucide-react';

export default function PainelPrincipal() {
  const navigate = useNavigate();

  // Simula pegar o primeiro torneio
  const torneio = futurosTorneios[0];
  const { id, jogo } = torneio;

  const actions = [
    { label: 'Publicar Torneio', icon: Upload, path: `/torneios/${jogo}/${id}` },
    { label: 'Perfil / Aparência', icon: Paintbrush, path: `/torneios/${jogo}/${id}/painel/aparencia` },
    { label: 'Quem Somos / Contato', icon: Info, path: 'contato' },
    { label: 'Agenda', icon: Calendar, path: 'agenda' },
    { label: 'Organizadores', icon: Users, path: 'organizadores' },
    { label: 'Premiação', icon: Gift, path: 'premiacao' },
    { label: 'Patrocinadores', icon: Handshake, path: 'patrocinadores' },
    { label: 'Convites', icon: Mail, path: 'convites' },
    { label: 'Pontuação', icon: ListOrdered, path: 'pontuacao' },
    { label: 'Chaves', icon: Brackets, path: 'chaves' },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Painel de Controle</h1>
          <span className="bg-yellow-500 text-black text-sm px-3 py-1 rounded-full">Rascunho</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {actions.map(({ label, icon: Icon, path }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                onClick={() =>
                  path.startsWith('/') ? navigate(path) : navigate(`/torneios/${jogo}/${id}/painel/${path}`)
                }
                className="cursor-pointer bg-gray-900 hover:bg-gray-800 transition rounded-2xl shadow-md"
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Icon size={32} className="mb-4 text-blue-400" />
                  <span className="text-lg font-medium">{label}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
