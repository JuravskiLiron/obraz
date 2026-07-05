import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProduct } from "@/hooks/useProducts";
import { useAdminCreateProduct, useAdminUpdateProduct } from "@/hooks/useAdmin";
import { useBrands, useCategoryTree } from "@/hooks/useCatalog";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToastStore } from "@/store/toastStore";
import type { AdminProductRequest } from "@/api/admin";
import type { CategoryNode } from "@/types/api";

const COLORS_TEMPLATE = `[
  {
    "name": "Black",
    "hex": "#111111",
    "images": [
      { "url": "https://picsum.photos/seed/black1/600/800", "alt": "Front" },
      { "url": "https://picsum.photos/seed/black2/600/800", "alt": "Back" }
    ]
  }
]`;

const VARIANTS_TEMPLATE = `[
  { "sku": "SKU-BLK-S", "color": "Black", "size": "S", "stock": 10, "price": 49.99 },
  { "sku": "SKU-BLK-M", "color": "Black", "size": "M", "stock": 6, "price": 49.99 }
]`;

function flatten(nodes: CategoryNode[], depth = 0, out: { id: string; label: string }[] = []) {
  for (const n of nodes) {
    out.push({ id: n.id, label: `${"— ".repeat(depth)}${n.name} (${n.gender})` });
    if (n.children.length) flatten(n.children, depth + 1, out);
  }
  return out;
}

export function AdminProductEditPage() {
  const { slug } = useParams();
  const isEdit = !!slug;
  const navigate = useNavigate();
  const pushToast = useToastStore((s) => s.push);

  const { data: existing, isLoading: loadingProduct } = useProduct(slug);
  const { data: brands } = useBrands();
  const { data: tree } = useCategoryTree();
  const categoryOptions = useMemo(() => (tree ? flatten(tree) : []), [tree]);

  const create = useAdminCreateProduct();
  const update = useAdminUpdateProduct();

  const [form, setForm] = useState({
    slug: "",
    name: "",
    brand: "",
    brandId: "",
    gender: "women",
    categoryId: "",
    description: "",
    price: "0",
    salePrice: "",
    currency: "USD",
    tags: "",
    isNew: true,
    isActive: true,
    fit: "",
    fabric: "",
    care: "",
    modelInfo: "",
    lengthCm: "",
  });
  const [colorsJson, setColorsJson] = useState(COLORS_TEMPLATE);
  const [variantsJson, setVariantsJson] = useState(VARIANTS_TEMPLATE);
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !existing) return;
    setForm({
      slug: existing.slug,
      name: existing.name,
      brand: existing.brand,
      brandId: existing.brandId,
      gender: existing.gender,
      categoryId: existing.categoryId,
      description: existing.description,
      price: String(existing.price),
      salePrice: existing.salePrice != null ? String(existing.salePrice) : "",
      currency: existing.currency,
      tags: existing.tags.join(", "),
      isNew: existing.isNew,
      isActive: true,
      fit: existing.attributes.fit,
      fabric: existing.attributes.fabric,
      care: existing.attributes.care,
      modelInfo: existing.attributes.modelInfo,
      lengthCm:
        existing.attributes.lengthCm != null
          ? String(existing.attributes.lengthCm)
          : "",
    });
    setColorsJson(JSON.stringify(existing.colors, null, 2));
    setVariantsJson(JSON.stringify(existing.variants, null, 2));
  }, [isEdit, existing]);

  const set = (k: keyof typeof form) => (v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setJsonError(null);
    let colors: AdminProductRequest["colors"];
    let variants: AdminProductRequest["variants"];
    try {
      colors = JSON.parse(colorsJson);
      variants = JSON.parse(variantsJson);
    } catch {
      setJsonError("Colours or variants JSON is invalid.");
      return;
    }

    const body: AdminProductRequest = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      brand: form.brand.trim(),
      brandId: form.brandId,
      gender: form.gender,
      categoryId: form.categoryId,
      description: form.description,
      colors,
      variants,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      currency: form.currency || "USD",
      attributes: {
        fit: form.fit,
        fabric: form.fabric,
        care: form.care,
        modelInfo: form.modelInfo,
        lengthCm: form.lengthCm ? Number(form.lengthCm) : null,
      },
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isNew: form.isNew,
      isActive: form.isActive,
    };

    const onSuccess = () => {
      pushToast(isEdit ? "Product updated" : "Product created", "success");
      navigate("/admin/products");
    };
    const onError = (err: unknown) =>
      pushToast(err instanceof Error ? err.message : "Save failed", "error");

    if (isEdit && existing) update.mutate({ id: existing.id, body }, { onSuccess, onError });
    else create.mutate(body, { onSuccess, onError });
  };

  if (isEdit && loadingProduct)
    return (
      <div className="grid place-items-center py-20">
        <Spinner />
      </div>
    );

  const pending = create.isPending || update.isPending;

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-8">
      <h2 className="font-display text-lg font-bold uppercase tracking-wide">
        {isEdit ? "Edit product" : "New product"}
      </h2>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Slug" value={form.slug} onChange={set("slug")} required />
        <Input label="Name" value={form.name} onChange={set("name")} required />
        <Input label="Brand name" value={form.brand} onChange={set("brand")} required />
        <Select
          label="Brand"
          value={form.brandId}
          onChange={set("brandId")}
          options={[
            { id: "", label: "— select brand —" },
            ...(brands?.map((b) => ({ id: b.id, label: b.name })) ?? []),
          ]}
        />
        <Select
          label="Gender"
          value={form.gender}
          onChange={set("gender")}
          options={[
            { id: "women", label: "Women" },
            { id: "men", label: "Men" },
            { id: "unisex", label: "Unisex" },
          ]}
        />
        <Select
          label="Category"
          value={form.categoryId}
          onChange={set("categoryId")}
          options={[{ id: "", label: "— select category —" }, ...categoryOptions]}
        />
        <Input label="Price" type="number" value={form.price} onChange={set("price")} required />
        <Input label="Sale price (optional)" type="number" value={form.salePrice} onChange={set("salePrice")} />
        <Input label="Currency" value={form.currency} onChange={set("currency")} />
        <Input label="Tags (comma separated)" value={form.tags} onChange={set("tags")} />
      </section>

      <Textarea label="Description" value={form.description} onChange={set("description")} rows={3} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Fit" value={form.fit} onChange={set("fit")} />
        <Input label="Fabric" value={form.fabric} onChange={set("fabric")} />
        <Input label="Care" value={form.care} onChange={set("care")} />
        <Input label="Model info" value={form.modelInfo} onChange={set("modelInfo")} />
        <Input label="Length (cm)" type="number" value={form.lengthCm} onChange={set("lengthCm")} />
      </section>

      <div className="flex gap-6">
        <Checkbox label="New in" checked={form.isNew} onChange={set("isNew")} />
        <Checkbox label="Active" checked={form.isActive} onChange={set("isActive")} />
      </div>

      <Textarea label="Colours (JSON)" value={colorsJson} onChange={setColorsJson} rows={8} mono />
      <Textarea label="Variants (JSON)" value={variantsJson} onChange={setVariantsJson} rows={6} mono />

      {jsonError && <p className="text-[13px] text-sale">{jsonError}</p>}

      <div className="flex gap-3">
        <Button type="submit" size="lg" loading={pending}>
          {isEdit ? "Save changes" : "Create product"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => navigate("/admin/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        step={type === "number" ? "0.01" : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full border border-line bg-bg px-3 text-sm outline-none focus-visible:border-fg focus-visible:ring-2"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows = 3,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border border-line bg-bg px-3 py-2 text-sm outline-none focus-visible:border-fg focus-visible:ring-2 ${
          mono ? "font-mono text-[12px]" : ""
        }`}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full border border-line bg-bg px-3 text-sm outline-none focus-visible:border-fg focus-visible:ring-2"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      {label}
    </label>
  );
}
