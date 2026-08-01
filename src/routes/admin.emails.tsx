import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/emails")({
  component: EmailsPage,
});

type Tpl = { id: string; key: string; subject: string; body_html: string };
type EmailTemplateInsert = Database["public"]["Tables"]["email_templates"]["Insert"];

function EmailsPage() {
  const qc = useQueryClient();
  const { data: templates } = useQuery({
    queryKey: ["admin-emails"],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_templates").select("*").order("key");
      if (error) throw error;
      return data as Tpl[];
    },
  });

  const save = useMutation({
    mutationFn: async (t: Partial<Tpl> & { id?: string }) => {
      if (t.id) {
        const { id, ...changes } = t;
        const { error } = await supabase.from("email_templates").update(changes).eq("id", id);
        if (error) throw error;
      } else {
        const insertPayload: EmailTemplateInsert = {
          key: t.key ?? "",
          subject: t.subject ?? "",
          body_html: t.body_html ?? "",
        };
        const { error } = await supabase.from("email_templates").insert(insertPayload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-emails"] });
      toast.success("Salvo.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Emails</h1>
        <button
          onClick={() => setCreating(true)}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Novo template
        </button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Templates customizáveis. Envio segmentado será plugado à infra de email configurada para
        produção quando ativarmos o domínio.
      </p>

      {creating && (
        <TemplateForm
          onCancel={() => setCreating(false)}
          onSave={async (t) => {
            await save.mutateAsync(t);
            setCreating(false);
          }}
        />
      )}

      <div className="mt-6 space-y-3">
        {(templates ?? []).map((t) => (
          <TemplateRow key={t.id} t={t} onSave={(next) => save.mutate({ ...next, id: t.id })} />
        ))}
        {templates?.length === 0 && !creating && (
          <p className="mt-8 text-sm text-muted-foreground">Nenhum template ainda.</p>
        )}
      </div>
    </div>
  );
}

function TemplateRow({ t, onSave }: { t: Tpl; onSave: (t: Partial<Tpl>) => void }) {
  const [editing, setEditing] = useState(false);
  if (editing)
    return (
      <TemplateForm
        initial={t}
        onCancel={() => setEditing(false)}
        onSave={(v) => {
          onSave(v);
          setEditing(false);
        }}
      />
    );
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{t.key}</p>
        <p className="truncate text-xs text-muted-foreground">{t.subject}</p>
      </div>
      <button
        onClick={() => setEditing(true)}
        className="rounded-full border border-border px-3 py-1 text-xs"
      >
        Editar
      </button>
    </div>
  );
}

function TemplateForm({
  initial,
  onCancel,
  onSave,
}: {
  initial?: Tpl;
  onCancel: () => void;
  onSave: (t: Partial<Tpl>) => void;
}) {
  const [f, setF] = useState<Partial<Tpl>>({
    key: initial?.key ?? "",
    subject: initial?.subject ?? "",
    body_html: initial?.body_html ?? "",
  });
  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-border bg-background p-5">
      <input
        placeholder="key (ex: magic_link)"
        value={f.key ?? ""}
        onChange={(e) => setF({ ...f, key: e.target.value })}
        className="w-full rounded-xl border border-border px-3 py-2 text-sm"
      />
      <input
        placeholder="Assunto"
        value={f.subject ?? ""}
        onChange={(e) => setF({ ...f, subject: e.target.value })}
        className="w-full rounded-xl border border-border px-3 py-2 text-sm"
      />
      <textarea
        placeholder="HTML do email"
        value={f.body_html ?? ""}
        onChange={(e) => setF({ ...f, body_html: e.target.value })}
        rows={10}
        className="w-full rounded-xl border border-border px-3 py-2 font-mono text-xs"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-full border border-border px-4 py-1.5 text-sm"
        >
          Cancelar
        </button>
        <button
          onClick={() => onSave(f)}
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
