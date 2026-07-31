export type Alimento = { nome: string; nota?: string };

export const SEMAFORO: Record<"verde" | "amarelo" | "vermelho", { titulo: string; descricao: string; itens: Alimento[] }> = {
  verde: {
    titulo: "Sinal Verde",
    descricao: "Comer à vontade dentro da rotina. Sustentam a drenagem e a saciedade.",
    itens: [
      { nome: "Folhas verdes escuras" },
      { nome: "Pepino" },
      { nome: "Abobrinha" },
      { nome: "Chuchu" },
      { nome: "Ovos" },
      { nome: "Peixes brancos" },
      { nome: "Frango grelhado" },
      { nome: "Iogurte natural sem açúcar" },
      { nome: "Frutas vermelhas" },
      { nome: "Abacate", nota: "porção controlada" },
      { nome: "Chás sem açúcar (hibisco, cavalinha, gengibre)" },
      { nome: "Água com limão" },
    ],
  },
  amarelo: {
    titulo: "Sinal Amarelo",
    descricao: "Consumir com moderação. Encaixe no dia com consciência.",
    itens: [
      { nome: "Arroz branco" },
      { nome: "Pão integral" },
      { nome: "Batata cozida" },
      { nome: "Frutas doces (manga, uva)" },
      { nome: "Queijos amarelos" },
      { nome: "Café com leite" },
      { nome: "Castanhas", nota: "1 punhado" },
      { nome: "Mel puro" },
      { nome: "Chocolate 70%+" },
    ],
  },
  vermelho: {
    titulo: "Sinal Vermelho",
    descricao: "Evitar durante o protocolo. Retêm líquido, inflamam e travam o resultado.",
    itens: [
      { nome: "Refrigerantes" },
      { nome: "Sucos industrializados" },
      { nome: "Frituras" },
      { nome: "Embutidos (salsicha, presunto)" },
      { nome: "Fast food" },
      { nome: "Doces industrializados" },
      { nome: "Salgadinhos de pacote" },
      { nome: "Molhos prontos" },
      { nome: "Bebidas alcoólicas" },
      { nome: "Adoçantes artificiais" },
    ],
  },
};

export const REGRAS_DE_OURO = [
  "Beba água ao acordar antes de qualquer coisa.",
  "Coma sentada, sem tela, mastigando devagar.",
  "Sal do dia todo cabe em uma colher de chá rasa.",
  "Prefira o que tem casca, folha ou raiz.",
  "Evite líquidos durante a refeição principal.",
  "Última refeição pelo menos 2h antes de dormir.",
  "Um deslize não interrompe o protocolo — a próxima refeição continua.",
];

export const MITOS = [
  { mito: "Preciso passar fome para desinchar.", verdade: "Fome desregula hormônios e piora a retenção. O protocolo é o oposto." },
  { mito: "Água em jejum engorda.", verdade: "Água acelera o metabolismo e ativa o intestino." },
  { mito: "Carboidrato à noite engorda.", verdade: "O que importa é a quantidade total do dia, não o horário." },
  { mito: "Suar muito emagrece.", verdade: "Suar elimina água, não gordura. O resultado vem do protocolo consistente." },
  { mito: "Detox de suco resolve.", verdade: "Sucos concentram açúcar e não sustentam. O protocolo K-Slim é sustentável." },
  { mito: "Barriga inchada é sempre gordura.", verdade: "Na maioria das vezes é retenção, gases e postura." },
];

export const FAQ = [
  { q: "Posso fazer o protocolo menstruada?", a: "Sim. Priorize as rotinas de TPM e reduza a intensidade." },
  { q: "Posso comer fora?", a: "Sim. Use o Semáforo como guia e priorize proteína + verde." },
  { q: "E se eu pular um dia?", a: "Sem culpa. Retome no próximo dia. O protocolo é seu ritmo." },
  { q: "Posso combinar com academia?", a: "Sim, mas o protocolo sozinho já entrega o resultado." },
];

export const RECEITAS = [
  { nome: "Chá anti-inchaço K-Slim", tempo: "5 min", ingredientes: ["1 col. chá cavalinha", "1 rodela gengibre", "1 fatia limão", "300 ml água quente"] },
  { nome: "Bowl matinal", tempo: "7 min", ingredientes: ["1 pote iogurte natural", "Frutas vermelhas", "1 col. chia", "Canela"] },
  { nome: "Prato leveza", tempo: "20 min", ingredientes: ["Peixe branco", "Legumes no vapor", "Folhas verdes", "Azeite e limão"] },
  { nome: "Água drenante", tempo: "2 min", ingredientes: ["1 L água", "Pepino", "Hortelã", "Limão"] },
];

export const LISTA_COMPRAS = [
  "Folhas verdes (rúcula, agrião, espinafre)",
  "Pepino, abobrinha, chuchu",
  "Peixe branco, frango, ovos",
  "Iogurte natural sem açúcar",
  "Frutas vermelhas",
  "Chá de hibisco, cavalinha e gengibre",
  "Limão, hortelã, gengibre fresco",
  "Azeite extra virgem",
];
