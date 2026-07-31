export type Rotina = {
  slug: string;
  titulo: string;
  categoria: string;
  nivel: "Leve" | "Moderada" | "Intensa";
  objetivo: string;
  videoUrl?: string;
};

export const CATEGORIAS = [
  "Momentos do dia",
  "Situações",
  "Áreas do corpo",
  "Bem-estar",
] as const;

export const ROTINAS: Rotina[] = [
  {
    slug: "ao-acordar",
    titulo: "Ao acordar",
    categoria: "Momentos do dia",
    nivel: "Leve",
    objetivo: "Ativar circulação e postura antes do café.",
    videoUrl: "https://youtu.be/qGF8vB-N1AQ",
  },
  {
    slug: "antes-de-dormir",
    titulo: "Antes de dormir",
    categoria: "Momentos do dia",
    nivel: "Leve",
    objetivo: "Desinchar e desacelerar o sistema nervoso.",
    videoUrl: "https://youtu.be/VoO1Psq-eY4",
  },
  {
    slug: "muito-tempo-sentada",
    titulo: "Depois de ficar muito tempo sentada",
    categoria: "Situações",
    nivel: "Moderada",
    objetivo: "Reativar quadril e postura.",
    videoUrl: "https://youtu.be/dxHeNvdmEJo",
  },
  {
    slug: "pos-viagem",
    titulo: "Depois de viajar",
    categoria: "Situações",
    nivel: "Moderada",
    objetivo: "Drenar pernas e realinhar coluna.",
    videoUrl: "https://youtu.be/LmcDYeEe7cI",
  },
  {
    slug: "tpm",
    titulo: "TPM",
    categoria: "Situações",
    nivel: "Leve",
    objetivo: "Aliviar cólicas, inchaço e tensão emocional.",
    videoUrl: "https://youtu.be/ZMfCXlGlvQU",
  },
  {
    slug: "barriga-inchada",
    titulo: "Barriga inchada",
    categoria: "Áreas do corpo",
    nivel: "Leve",
    objetivo: "Desinchar rápido e reduzir desconforto.",
    videoUrl: "https://youtu.be/zk8aYB9Ge7k",
  },
  {
    slug: "cintura",
    titulo: "Cintura",
    categoria: "Áreas do corpo",
    nivel: "Moderada",
    objetivo: "Modelar oblíquos e transverso.",
    videoUrl: "https://youtu.be/OVFsWxM2foY",
  },
  {
    slug: "postura",
    titulo: "Postura",
    categoria: "Áreas do corpo",
    nivel: "Leve",
    objetivo: "Realinhar ombros e coluna.",
    videoUrl: "https://youtu.be/RNw0Mr2Z0gw",
  },
  {
    slug: "pescoco",
    titulo: "Pescoço",
    categoria: "Áreas do corpo",
    nivel: "Leve",
    objetivo: "Aliviar tensão de tela e postura.",
    videoUrl: "https://youtu.be/-9s1HEPRMzg",
  },
  {
    slug: "relaxamento",
    titulo: "Relaxamento",
    categoria: "Bem-estar",
    nivel: "Leve",
    objetivo: "Baixar o cortisol e recuperar a leveza.",
    videoUrl: "https://youtu.be/Hm63eP3I9Zo",
  },
];
