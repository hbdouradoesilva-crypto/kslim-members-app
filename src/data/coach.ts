export const SUGESTOES = [
  "Estou inchada hoje",
  "Posso comer pão?",
  "Não consegui treinar ontem",
  "Estou na TPM",
  "Quanto de água devo beber?",
  "Qual missão faço hoje?",
];

export const RESPOSTAS: Record<string, string> = {
  "Estou inchada hoje":
    "Vamos desinchar juntas. Sugiro a rotina Barriga Inchada (12 min) agora e o chá anti-inchaço do Guia depois. Hoje evite sal e priorize alimentos do Sinal Verde.",
  "Posso comer pão?":
    "Pão está no Sinal Amarelo. Uma fatia integral no café ou no almoço cabe. Evite à noite e prefira acompanhado de proteína.",
  "Não consegui treinar ontem":
    "Um dia não interrompe o protocolo. Retome hoje a missão do dia atual — sem repor a anterior. A constância é o que constrói o resultado.",
  "Estou na TPM":
    "Faça a rotina TPM (12 min): respiração acolhedora, mobilidade de quadril e visualização. Hidrate bem e evite sódio.",
  "Quanto de água devo beber?":
    "Meta base: 35 ml por kg. Divida ao longo do dia, começando com um copo ao acordar. Chás sem açúcar contam.",
  "Qual missão faço hoje?":
    "Abra a aba Protocolo — sua missão do dia aparece destacada com o tempo e os exercícios da sessão.",
};

export function respostaMock(pergunta: string): string {
  const chave = Object.keys(RESPOSTAS).find(
    (k) => k.toLowerCase() === pergunta.trim().toLowerCase(),
  );
  if (chave) return RESPOSTAS[chave];
  return "Recebi sua mensagem. No Coach Premium, respondo com o seu histórico do protocolo em tempo real. Enquanto isso, use as sugestões rápidas ou consulte o Guia K-Slim.";
}
