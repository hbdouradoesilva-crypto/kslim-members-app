import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
});

type Product = {
  id: string;
  title: string;
  slug: string | null;
  price_cents: number;
  cakto_product_id: string | null;
  is_order_bump: boolean;
  parent_product_id: string | null;
};

function ProductsPage() {
  const qc = useQueryClient();
  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const save = useMutation({
    mutationFn: async (p: Partial<Product> & { id?: string }) => {
      if (p.id) {
        const { error } = await supabase.from("products").update(p).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(p as any);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast.success("Salvo."); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast.success("Removido."); },
    onError: (e: Error) => toast.error(e.message),
  });

  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Produtos</h1>
        <button
          onClick={() => setCreating(true)}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Novo produto
        </button>
      </div>

      {creating && (
        <ProductForm
          products={products ?? []}
          onCancel={() => setCreating(false)}
          onSave={async (p) => { await save.mutateAsync(p); setCreating(false); }}
        />
      )}

      <div className="mt-6 space-y-3">
        {(products ?? []).map((p) => (
          <ProductRow
            key={p.id}
            product={p}
            products={products ?? []}
            onSave={(next) => save.mutate({ ...next, id: p.id })}
            onDelete={() => confirm("Remover este produto?") && del.mutate(p.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ProductRow({ product, products, onSave, onDelete }: {
  product: Product;
  products: Product[];
  onSave: (p: Partial<Product>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <ProductForm
        products={products}
        initial={product}
        onCancel={() => setEditing(false)}
        onSave={(p) => { onSave(p); setEditing(false); }}
      />
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{product.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {product.cakto_product_id ? `Cakto: ${product.cakto_product_id}` : "sem cakto_product_id"} •{" "}
          {(product.price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
      </div>
      {product.is_order_bump && (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs">Order bump</span>
      )}
      <button onClick={() => setEditing(true)} className="rounded-full border border-border px-3 py-1 text-xs">Editar</button>
      <button onClick={onDelete} className="rounded-full border border-border px-3 py-1 text-xs text-destructive">Remover</button>
    </div>
  );
}

function ProductForm({ products, initial, onCancel, onSave }: {
  products: Product[];
  initial?: Product;
  onCancel: () => void;
  onSave: (p: Partial<Product>) => void;
}) {
  const [f, setF] = useState<Partial<Product>>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    price_cents: initial?.price_cents ?? 0,
    cakto_product_id: initial?.cakto_product_id ?? "",
    is_order_bump: initial?.is_order_bump ?? false,
    parent_product_id: initial?.parent_product_id ?? null,
  });
  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-border bg-background p-5">
      <input placeholder="Título" value={f.title ?? ""} onChange={(e) => setF({ ...f, title: e.target.value })}
        className="w-full rounded-xl border border-border px-3 py-2 text-sm" />
      <input placeholder="Slug (opcional)" value={f.slug ?? ""} onChange={(e) => setF({ ...f, slug: e.target.value })}
        className="w-full rounded-xl border border-border px-3 py-2 text-sm" />
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-muted-foreground">
          Preço (R$)
          <input type="number" step="0.01" value={(f.price_cents ?? 0) / 100}
            onChange={(e) => setF({ ...f, price_cents: Math.round(Number(e.target.value) * 100) })}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" />
        </label>
        <label className="text-xs text-muted-foreground">
          Cakto Product ID
          <input value={f.cakto_product_id ?? ""} onChange={(e) => setF({ ...f, cakto_product_id: e.target.value })}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={f.is_order_bump ?? false}
          onChange={(e) => setF({ ...f, is_order_bump: e.target.checked })} />
        É order bump
      </label>
      {f.is_order_bump && (
        <label className="text-xs text-muted-foreground">
          Produto principal
          <select value={f.parent_product_id ?? ""} onChange={(e) => setF({ ...f, parent_product_id: e.target.value || null })}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
            <option value="">— nenhum —</option>
            {products.filter((p) => !p.is_order_bump && p.id !== initial?.id).map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </label>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="rounded-full border border-border px-4 py-1.5 text-sm">Cancelar</button>
        <button onClick={() => onSave(f)} className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
          Salvar
        </button>
      </div>
    </div>
  );
}
