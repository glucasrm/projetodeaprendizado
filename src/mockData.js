// src/mockData.js

export const futurosTorneios = [
  {
    id: 1,
    imagem: "https://via.placeholder.com/400x200",
    nome: "Torneio Relâmpago #1",
    data: "2025-05-05",
    horario: "18:00",
    local: "Online",
    tipo: "Solo",
    slots: 32,
    tags: ["Rápido", "Competitivo"],
    organizador: "Admin X",
    premiacao: "R$ 500",
  },
  {
    id: 2,
    imagem: "https://via.placeholder.com/400x200",
    nome: "Campeonato Regional",
    data: "2025-05-10",
    horario: "20:00",
    local: "São Paulo",
    tipo: "Duplas",
    slots: 64,
    tags: ["Oficial", "Presencial"],
    organizador: "Organização Y",
    premiacao: "R$ 1000",
  },
];

export const torneiosPassados = [
  {
    id: 1,
    imagem: "https://via.placeholder.com/400x200",
    nome: "Desafio Abril",
    data: "2025-04-20",
    horario: "17:00",
    local: "Online",
    tipo: "Solo",
    slots: 32,
    tags: ["Finalizado", "Competitivo"],
    organizador: "Admin X",
    premiacao: "R$ 500",
    vencedor: "Time Alpha",
  },
  {
    id: 2,
    imagem: "https://via.placeholder.com/400x200",
    nome: "Liga de Primavera",
    data: "2025-04-15",
    horario: "19:00",
    local: "São Paulo",
    tipo: "Duplas",
    slots: 64,
    tags: ["Finalizado", "Presencial"],
    organizador: "Organização Y",
    premiacao: "R$ 1000",
    vencedor: "Jogador123",
  },
];


export const topJogadores = [
  {
    id: 1,
    nome: "JogadorX",
    pontos: 1500,
  },
  {
    id: 2,
    nome: "JogadorY",
    pontos: 1450,
  },
  {
    id: 3,
    nome: "JogadorZ",
    pontos: 1400,
  },
];
