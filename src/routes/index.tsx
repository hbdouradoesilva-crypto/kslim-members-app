import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    // BYPASS: Redireciona direto para o protocolo sem verificar autenticação
    throw redirect({ to: "/protocolo" });
  },
  component: () => null,
});
