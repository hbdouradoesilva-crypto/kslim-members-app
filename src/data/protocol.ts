export type Missao = {
  dia: number;
  semana: 1 | 2 | 3;
  titulo: string;
  objetivo: string;
  duracaoMin: number;
  foco: Array<"linfatico" | "core" | "mobilidade" | "postura" | "cintura" | "gluteo">;
  exercicios: { nome: string; tempo: string }[];
  checklist: string[];
  /** Link do YouTube (qualquer formato: watch, youtu.be, shorts, embed). */
  videoUrl?: string;
};

export const SEMANAS = [
  {
    numero: 1 as const,
    nome: "Desinchar e Ativar",
    descricao: "Ativação linfática, respiração e mobilidade. O corpo começa a soltar retenção.",
  },
  {
    numero: 2 as const,
    nome: "Modelar e Afinar",
    descricao: "Cintura, core profundo e postura. A silhueta começa a se redesenhar.",
  },
  {
    numero: 3 as const,
    nome: "Consolidar e Manter",
    descricao: "Rituais integrados. O protocolo vira hábito e a leveza se sustenta.",
  },
];

export const PROTOCOLO: Missao[] = [
  { dia: 1, semana: 1, titulo: "Ativar o Sistema Linfático", objetivo: "Iniciar a drenagem e reduzir a sensação de peso.", duracaoMin: 12, foco: ["linfatico"],
    exercicios: [
      { nome: "Auto-drenagem pescoço e clavícula", tempo: "3 min" },
      { nome: "Escova a seco guiada", tempo: "4 min" },
      { nome: "Respiração ativadora 4-7-8", tempo: "3 min" },
      { nome: "Elevação de pernas na parede", tempo: "2 min" },
    ],
    checklist: ["Hidratar antes de começar", "Ambiente calmo e iluminado", "Respirar pelo nariz"], videoUrl: "https://youtu.be/shYtJOhXJ8U" },
  { dia: 2, semana: 1, titulo: "Despertar o Core", objetivo: "Reconectar o abdômen profundo e a respiração diafragmática.", duracaoMin: 14, foco: ["core"],
    exercicios: [
      { nome: "Respiração diafragmática deitada", tempo: "4 min" },
      { nome: "Ativação de transverso", tempo: "4 min" },
      { nome: "Dead bug suave", tempo: "3 min" },
      { nome: "Alongamento final", tempo: "3 min" },
    ],
    checklist: ["Coluna neutra", "Sem prender a respiração", "Movimento lento"], videoUrl: "https://youtu.be/uM4YKBqiT0o" },
  { dia: 3, semana: 1, titulo: "Mobilizar a Fáscia", objetivo: "Soltar tensões que travam a cintura e os quadris.", duracaoMin: 15, foco: ["mobilidade"],
    exercicios: [
      { nome: "Rolamento lateral suave", tempo: "4 min" },
      { nome: "Mobilidade de quadril 360°", tempo: "5 min" },
      { nome: "Abertura torácica", tempo: "3 min" },
      { nome: "Respiração final", tempo: "3 min" },
    ],
    checklist: ["Sem forçar amplitude", "Sentir o alongamento, não a dor"], videoUrl: "https://youtu.be/WDGUi-ILT-E" },
  { dia: 4, semana: 1, titulo: "Primeira Respiração Vacuum", objetivo: "Introduzir a técnica coreana que afina a cintura por dentro.", duracaoMin: 12, foco: ["core", "cintura"],
    exercicios: [
      { nome: "Aquecimento respiratório", tempo: "3 min" },
      { nome: "Vacuum em 4 apoios", tempo: "5 min" },
      { nome: "Vacuum em pé", tempo: "3 min" },
      { nome: "Relaxamento", tempo: "1 min" },
    ],
    checklist: ["Estômago vazio", "3 séries curtas são melhores que uma longa"], videoUrl: "https://youtu.be/kcmordwb2Ks" },
  { dia: 5, semana: 1, titulo: "Correção Postural", objetivo: "Realinhar ombros e coluna — a postura sozinha afina a silhueta.", duracaoMin: 13, foco: ["postura"],
    exercicios: [
      { nome: "Retração escapular", tempo: "3 min" },
      { nome: "Alongamento peitoral", tempo: "3 min" },
      { nome: "Ativação de romboides", tempo: "4 min" },
      { nome: "Consciência corporal em pé", tempo: "3 min" },
    ],
    checklist: ["Pés paralelos", "Coroa da cabeça alongada"], videoUrl: "https://youtu.be/oqGPG6MGDd8" },
  { dia: 6, semana: 1, titulo: "Drenagem Profunda", objetivo: "Intensificar a saída de líquido retido.", duracaoMin: 16, foco: ["linfatico"],
    exercicios: [
      { nome: "Massagem drenante guiada", tempo: "6 min" },
      { nome: "Bombeamento de tornozelo", tempo: "3 min" },
      { nome: "Pernas para cima", tempo: "5 min" },
      { nome: "Respiração final", tempo: "2 min" },
    ],
    checklist: ["Hidratar após", "Evitar sal no jantar"], videoUrl: "https://youtu.be/I6BQ61OBBLw" },
  { dia: 7, semana: 1, titulo: "Integração da Semana 1", objetivo: "Combinar drenagem, core e postura em um único ritual.", duracaoMin: 18, foco: ["linfatico", "core", "postura"],
    exercicios: [
      { nome: "Ativação linfática", tempo: "4 min" },
      { nome: "Vacuum", tempo: "4 min" },
      { nome: "Postura consciente", tempo: "4 min" },
      { nome: "Respiração de fechamento", tempo: "6 min" },
    ],
    checklist: ["Celebrar a primeira semana", "Registrar como o corpo está"], videoUrl: "https://youtu.be/JiuKxgpT8I4" },

  { dia: 8, semana: 2, titulo: "Ativar a Cintura", objetivo: "Trabalhar oblíquos internos com foco em afinamento.", duracaoMin: 15, foco: ["cintura", "core"],
    exercicios: [
      { nome: "Rotações controladas", tempo: "4 min" },
      { nome: "Side plank progressivo", tempo: "4 min" },
      { nome: "Vacuum lateral", tempo: "4 min" },
      { nome: "Alongamento oblíquo", tempo: "3 min" },
    ],
    checklist: ["Sem puxar o pescoço", "Costelas para dentro"], videoUrl: "https://youtu.be/9q5mf9aqCTI" },
  { dia: 9, semana: 2, titulo: "Modelagem do Glúteo Médio", objetivo: "Ativar a lateral do quadril — afina a silhueta e sustenta a postura.", duracaoMin: 16, foco: ["gluteo", "postura"],
    exercicios: [
      { nome: "Clamshell", tempo: "4 min" },
      { nome: "Fire hydrant", tempo: "4 min" },
      { nome: "Ponte com abdução", tempo: "5 min" },
      { nome: "Alongamento final", tempo: "3 min" },
    ],
    checklist: ["Tronco imóvel", "Movimento vem do quadril"], videoUrl: "https://youtu.be/9q5mf9aqCTI" },
  { dia: 10, semana: 2, titulo: "Respiração Diafragmática Avançada", objetivo: "Aprofundar a técnica que reduz o volume abdominal.", duracaoMin: 12, foco: ["core", "cintura"],
    exercicios: [
      { nome: "Respiração 360°", tempo: "4 min" },
      { nome: "Vacuum sustentado", tempo: "5 min" },
      { nome: "Integração em pé", tempo: "3 min" },
    ],
    checklist: ["Ambiente silencioso", "Sem pressa"], videoUrl: "https://youtu.be/SsTeWz5MzLI" },
  { dia: 11, semana: 2, titulo: "Alongamento Profundo", objetivo: "Liberar tensões que impedem a postura ereta.", duracaoMin: 18, foco: ["mobilidade", "postura"],
    exercicios: [
      { nome: "Cadeia posterior", tempo: "6 min" },
      { nome: "Abertura de quadril", tempo: "6 min" },
      { nome: "Torácica e ombros", tempo: "6 min" },
    ],
    checklist: ["Respirar dentro do alongamento", "Sem competir com o corpo"], videoUrl: "https://youtu.be/MLQle2YF3c0" },
  { dia: 12, semana: 2, titulo: "Cintura + Glúteo em Sequência", objetivo: "Combinar modelagem lateral com sustentação posterior.", duracaoMin: 20, foco: ["cintura", "gluteo"],
    exercicios: [
      { nome: "Aquecimento", tempo: "3 min" },
      { nome: "Circuito cintura", tempo: "7 min" },
      { nome: "Circuito glúteo", tempo: "7 min" },
      { nome: "Volta à calma", tempo: "3 min" },
    ],
    checklist: ["Hidratar durante", "Respiração fluida"], videoUrl: "https://youtu.be/wZ0K3i_fWE4" },
  { dia: 13, semana: 2, titulo: "Ritual Anti-Inchaço", objetivo: "Rotina completa para dias em que o corpo pede leveza.", duracaoMin: 17, foco: ["linfatico", "mobilidade"],
    exercicios: [
      { nome: "Drenagem manual", tempo: "5 min" },
      { nome: "Mobilidade de tornozelo", tempo: "4 min" },
      { nome: "Pernas na parede", tempo: "5 min" },
      { nome: "Respiração de fechamento", tempo: "3 min" },
    ],
    checklist: ["Chá sem açúcar após", "Evitar sódio à noite"], videoUrl: "https://youtu.be/S3EB2oZ0E1I" },
  { dia: 14, semana: 2, titulo: "Integração da Semana 2", objetivo: "Sequência completa que consolida cintura, core e postura.", duracaoMin: 22, foco: ["cintura", "core", "postura"],
    exercicios: [
      { nome: "Ativação", tempo: "5 min" },
      { nome: "Bloco de modelagem", tempo: "10 min" },
      { nome: "Alongamento final", tempo: "7 min" },
    ],
    checklist: ["Observar a cintura no espelho", "Registrar sensações"], videoUrl: "https://youtu.be/QwvlIdM-A9o" },

  { dia: 15, semana: 3, titulo: "Ritual Matinal K-Slim", objetivo: "Criar o hábito de começar o dia ativando o corpo.", duracaoMin: 14, foco: ["linfatico", "postura"],
    exercicios: [
      { nome: "Respiração ao acordar", tempo: "3 min" },
      { nome: "Drenagem rápida", tempo: "5 min" },
      { nome: "Postura consciente", tempo: "4 min" },
      { nome: "Intenção do dia", tempo: "2 min" },
    ],
    checklist: ["Antes do café", "Luz natural se possível"], videoUrl: "https://youtu.be/IPDlZJU3gnw" },
  { dia: 16, semana: 3, titulo: "Ritual Noturno K-Slim", objetivo: "Fechar o dia desinchando e relaxando o sistema nervoso.", duracaoMin: 15, foco: ["linfatico", "mobilidade"],
    exercicios: [
      { nome: "Alongamento leve", tempo: "5 min" },
      { nome: "Pernas para cima", tempo: "5 min" },
      { nome: "Respiração 4-7-8", tempo: "5 min" },
    ],
    checklist: ["Luz baixa", "Sem tela nos últimos 3 min"], videoUrl: "https://youtu.be/0Rhb07nO8hI" },
  { dia: 17, semana: 3, titulo: "Cintura em Foco", objetivo: "Sessão dedicada ao afinamento.", duracaoMin: 20, foco: ["cintura"],
    exercicios: [
      { nome: "Aquecimento", tempo: "4 min" },
      { nome: "Circuito cintura avançado", tempo: "12 min" },
      { nome: "Vacuum final", tempo: "4 min" },
    ],
    checklist: ["Costelas para dentro", "Sem prender a respiração"], videoUrl: "https://youtu.be/CPpJZadVxZQ" },
  { dia: 18, semana: 3, titulo: "Postura + Glúteo", objetivo: "Sustentar a silhueta pelo posterior.", duracaoMin: 18, foco: ["postura", "gluteo"],
    exercicios: [
      { nome: "Ativação escapular", tempo: "5 min" },
      { nome: "Ponte progressiva", tempo: "7 min" },
      { nome: "Alongamento", tempo: "6 min" },
    ],
    checklist: ["Coluna alongada", "Sem hiperextender lombar"], videoUrl: "https://youtu.be/URhteM6ptmQ" },
  { dia: 19, semana: 3, titulo: "Ritual Completo", objetivo: "Sessão integrada — o corpo já reconhece a sequência.", duracaoMin: 24, foco: ["linfatico", "core", "cintura", "postura"],
    exercicios: [
      { nome: "Ativação", tempo: "5 min" },
      { nome: "Cintura + core", tempo: "8 min" },
      { nome: "Postura + glúteo", tempo: "6 min" },
      { nome: "Alongamento", tempo: "5 min" },
    ],
    checklist: ["Ritmo próprio", "Respiração conduz o movimento"], videoUrl: "https://youtu.be/-PV09sLwZJg" },
  { dia: 20, semana: 3, titulo: "Micro-hábitos K-Slim", objetivo: "Instalar micro-rotinas para manter o protocolo depois dos 21 dias.", duracaoMin: 12, foco: ["postura", "core"],
    exercicios: [
      { nome: "Vacuum no banheiro", tempo: "3 min" },
      { nome: "Postura no espelho", tempo: "3 min" },
      { nome: "Respiração no trânsito", tempo: "3 min" },
      { nome: "Alongamento no sofá", tempo: "3 min" },
    ],
    checklist: ["Escolher 2 para manter", "Anotar quais"], videoUrl: "https://youtu.be/CNTzB61_H9Q" },
  { dia: 21, semana: 3, titulo: "Celebração e Avaliação", objetivo: "Fechar o protocolo com consciência do que mudou.", duracaoMin: 20, foco: ["linfatico", "core", "cintura", "postura"],
    exercicios: [
      { nome: "Ritual completo", tempo: "12 min" },
      { nome: "Respiração de gratidão", tempo: "5 min" },
      { nome: "Avaliação corporal", tempo: "3 min" },
    ],
    checklist: ["Registrar antes/depois", "Escolher próximo ciclo"], videoUrl: "https://youtu.be/tQd94IywuwA" },
];

export const FOCOS_LABEL: Record<string, string> = {
  linfatico: "Sistema Linfático",
  core: "Core",
  mobilidade: "Mobilidade",
  postura: "Postura",
  cintura: "Cintura",
  gluteo: "Glúteo",
};
