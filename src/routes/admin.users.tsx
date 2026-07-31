import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, UserPlus, X } from "lucide-react";
import {
  adminListUsers,
  adminToggleActive,
  adminSetRole,
  adminListProductsLite,
  adminExportUsersCSV,
  adminInviteAdmin,
  adminReleaseAccessByEmail,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

type Row = Awaited<ReturnType<typeof adminListUsers>>[number];
type Product = Awaited<ReturnType<typeof adminListProductsLite>>[number];

function UsersPage() {
  const listFn = useServerFn(adminListUsers);
  const productsFn = useServerFn(adminListProductsLite);
  const toggleFn = useServerFn(adminToggleActive);
  const roleFn = useServerFn(adminSetRole);
  const exportFn = useServerFn(adminExportUsersCSV);
  const inviteFn = useServerFn(adminInviteAdmin);
  const releaseFn = useServerFn(adminReleaseAccessByEmail);
  const qc = useQueryClient();

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "aluno">("all");
  const [includes, setIncludes] = useState<string[]>([]);
  const [excludes, setExcludes] = useState<string[]>([]);
  const [onlyActive, setOnlyActive] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [releaseEmail, setReleaseEmail] = useState("");
  const [releaseProductId, setReleaseProductId] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listFn(),
  });
  const { data: products } = useQuery({
    queryKey: ["admin-products-lite"],
    queryFn: () => productsFn(),
  });

  const productMap = useMemo(
    () => new Map((products ?? []).map((p) => [p.id, p])),
    [products],
  );

  const filtered = useMemo(() => {
    return (users ?? []).filter((u) => {
      const matchQ =
        !q ||
        u.email.toLowerCase().includes(q.toLowerCase()) ||
        (u.full_name ?? "").toLowerCase().includes(q.toLowerCase());
      const matchRole = roleFilter === "all" || u.roles.includes(roleFilter);
      const matchActive = !onlyActive || u.is_active;
      const owned = new Set(u.product_ids);
      const matchInc = includes.every((id) => owned.has(id));
      const matchExc = excludes.every((id) => !owned.has(id));
      return matchQ && matchRole && matchActive && matchInc && matchExc;
    });
  }, [users, q, roleFilter, includes, excludes, onlyActive]);

  const toggleMut = useMutation({
    mutationFn: (v: { user_id: string; is_active: boolean }) => toggleFn({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Atualizado."); },
    onError: (e: Error) => toast.error(e.message),
  });
  const roleMut = useMutation({
    mutationFn: (v: { user_id: string; role: "admin" | "aluno"; grant: boolean }) => roleFn({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Permissão atualizada."); },
    onError: (e: Error) => toast.error(e.message),
  });
  const inviteMut = useMutation({
    mutationFn: (email: string) => inviteFn({ data: { email } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setInviteEmail("");
      toast.success("Admin adicionado. Link mágico enviado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const releaseMut = useMutation({
    mutationFn: (v: { email: string; product_id: string }) => releaseFn({
      data: { ...v, send_link: true },
    }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setReleaseEmail("");
      toast.success(res.magic_link_sent ? "Acesso liberado e link enviado." : "Acesso liberado. Reenvie o link pelo login se necessário.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [exporting, setExporting] = useState(false);
  async function handleExport() {
    try {
      setExporting(true);
      const res = await exportFn({
        data: { includes, excludes, role: roleFilter, onlyActive },
      });
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `usuarios-remarketing-${stamp}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`${res.count} contatos exportados.`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setExporting(false);
    }
  }

  function toggleIn(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-display text-3xl">Usuários</h1>
        <button
          onClick={handleExport}
          disabled={exporting || isLoading}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          title="Baixa CSV pronto para Custom Audience do Meta Ads (email, fn, ln, country)"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Gerando…" : "Exportar CSV (Meta Ads)"}
        </button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {filtered.length} de {users?.length ?? 0} usuários •{" "}
        Formato pronto para Custom Audience do Meta Ads.
      </p>

      {/* Invite admin */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-background p-4">
        <p className="text-sm font-medium">Adicionar novo admin por e-mail</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Cria a conta se não existir e concede permissão de admin. O usuário recebe link mágico.
        </p>
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (inviteEmail.trim()) inviteMut.mutate(inviteEmail.trim());
          }}
        >
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@exemplo.com"
            className="flex-1 min-w-[220px] rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={inviteMut.isPending}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" />
            {inviteMut.isPending ? "Enviando…" : "Adicionar admin"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-background p-4">
        <p className="text-sm font-medium">Liberar acesso de aluno por e-mail</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Cria ou normaliza a conta, libera o produto escolhido e envia o link mágico.
        </p>
        <form
          className="mt-3 grid gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const productId = releaseProductId || products?.[0]?.id || "";
            if (releaseEmail.trim() && productId) {
              releaseMut.mutate({ email: releaseEmail.trim(), product_id: productId });
            }
          }}
        >
          <div className="flex flex-wrap gap-2">
            <input
              type="email"
              required
              value={releaseEmail}
              onChange={(e) => setReleaseEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="flex-1 min-w-[220px] rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <select
              value={releaseProductId || products?.[0]?.id || ""}
              onChange={(e) => setReleaseProductId(e.target.value)}
              className="min-w-[180px] rounded-full border border-border bg-background px-4 py-2 text-sm"
              required
            >
              {(products ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={releaseMut.isPending || (products ?? []).length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" />
            {releaseMut.isPending ? "Liberando…" : "Liberar acesso e enviar link"}
          </button>
        </form>
      </div>
      </div>

      {/* Filters */}
      <div className="mt-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por email ou nome"
            className="flex-1 min-w-[180px] rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | "admin" | "aluno")}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm"
          >
            <option value="all">Todos os papéis</option>
            <option value="admin">Admins</option>
            <option value="aluno">Alunos</option>
          </select>
          <label className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
            />
            Somente ativos
          </label>
        </div>

        <ProductPicker
          label="Comprou (produtos)"
          hint="Filtra quem comprou TODOS os selecionados."
          products={products ?? []}
          selected={includes}
          onToggle={(id) => toggleIn(includes, setIncludes, id)}
        />
        <ProductPicker
          label="NÃO comprou (produtos)"
          hint="Filtra quem NÃO comprou nenhum dos selecionados. Útil para remarketing de Order Bump."
          products={products ?? []}
          selected={excludes}
          onToggle={(id) => toggleIn(excludes, setExcludes, id)}
        />

        {(includes.length > 0 || excludes.length > 0) && (
          <button
            onClick={() => { setIncludes([]); setExcludes([]); }}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" /> limpar filtros de produto
          </button>
        )}
      </div>

      {isLoading && <p className="mt-8 text-sm text-muted-foreground">Carregando…</p>}

      <div className="mt-6 space-y-2">
        {filtered.map((u) => (
          <UserRow
            key={u.id}
            u={u}
            productMap={productMap}
            onToggle={() => toggleMut.mutate({ user_id: u.id, is_active: !u.is_active })}
            onRole={(role, grant) => roleMut.mutate({ user_id: u.id, role, grant })}
          />
        ))}
        {filtered.length === 0 && !isLoading && (
          <p className="mt-8 text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
        )}
      </div>
    </div>
  );
}

function ProductPicker({
  label, hint, products, selected, onToggle,
}: {
  label: string;
  hint: string;
  products: Product[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {products.length === 0 && (
          <p className="px-1 text-xs text-muted-foreground">Nenhum produto cadastrado.</p>
        )}
        {products.map((p) => {
          const active = selected.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onToggle(p.id)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/50"
              }`}
            >
              {p.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function UserRow({
  u, productMap, onToggle, onRole,
}: {
  u: Row;
  productMap: Map<string, Product>;
  onToggle: () => void;
  onRole: (role: "admin" | "aluno", grant: boolean) => void;
}) {
  const isAdmin = u.roles.includes("admin");
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{u.full_name || "(sem nome)"}</p>
        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
        {u.product_ids.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {u.product_ids.map((pid) => (
              <span
                key={pid}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-foreground"
              >
                {productMap.get(pid)?.title ?? "produto"}
              </span>
            ))}
          </div>
        )}
      </div>
      <span className={`rounded-full px-2 py-0.5 text-xs ${isAdmin ? "bg-primary/15" : "bg-muted"}`}>
        {u.roles.join(", ") || "—"}
      </span>
      <span className={`rounded-full px-2 py-0.5 text-xs ${u.is_active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
        {u.is_active ? "Ativo" : "Inativo"}
      </span>
      <button onClick={onToggle} className="rounded-full border border-border px-3 py-1 text-xs">
        {u.is_active ? "Desativar" : "Ativar"}
      </button>
      <button
        onClick={() => onRole("admin", !isAdmin)}
        className="rounded-full border border-border px-3 py-1 text-xs"
      >
        {isAdmin ? "Rebaixar" : "Promover a admin"}
      </button>
    </div>
  );
}
