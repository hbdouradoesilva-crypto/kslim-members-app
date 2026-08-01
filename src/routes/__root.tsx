import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportAppError } from "../lib/error-reporting";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <p className="eyebrow">Rota não encontrada</p>
        <h1 className="mt-3 font-display text-4xl">Página indisponível</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          O caminho que você tentou acessar não faz parte do protocolo.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportAppError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <p className="eyebrow">Algo interrompeu</p>
        <h1 className="mt-3 font-display text-3xl">Esta tela não carregou</h1>
        <p className="mt-3 text-sm text-muted-foreground">Tente novamente em alguns segundos.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
          >
            Tentar novamente
          </button>
          <a href="/" className="rounded-full border border-border px-6 py-3 text-sm font-medium">
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "K-Slim — Protocolo Coreano de Modelagem Corporal" },
      {
        name: "description",
        content:
          "K-Slim é o protocolo coreano de 21 dias para desinchar, afinar a cintura e recuperar a leveza do corpo — em casa, sem academia.",
      },
      { name: "author", content: "K-Slim" },
      { name: "theme-color", content: "#fdf5f6" },
      { property: "og:title", content: "K-Slim — Protocolo Coreano de Modelagem Corporal" },
      {
        property: "og:description",
        content:
          "K-Slim é o protocolo coreano de 21 dias para desinchar, afinar a cintura e recuperar a leveza do corpo — em casa, sem academia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "K-Slim — Protocolo Coreano de Modelagem Corporal" },
      {
        name: "twitter:description",
        content:
          "K-Slim é o protocolo coreano de 21 dias para desinchar, afinar a cintura e recuperar a leveza do corpo — em casa, sem academia.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter+Tight:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
