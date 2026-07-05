import type { ProductDetail } from "@/types/api";
import { Accordion } from "@/components/ui/Accordion";

export function ProductAccordions({ product }: { product: ProductDetail }) {
  const a = product.attributes;
  return (
    <Accordion
      defaultOpen="desc"
      items={[
        {
          id: "desc",
          title: "Product details",
          content: (
            <div className="space-y-2">
              <p>{product.description}</p>
              {product.tags.length > 0 && (
                <p className="text-[12px] text-subtle">
                  {product.tags.join(" · ")}
                </p>
              )}
            </div>
          ),
        },
        {
          id: "fit",
          title: "Size & fit",
          content: (
            <ul className="space-y-1">
              {a.fit && <li>{a.fit}</li>}
              {a.modelInfo && <li>{a.modelInfo}</li>}
              {a.lengthCm != null && <li>Length: {a.lengthCm} cm</li>}
            </ul>
          ),
        },
        {
          id: "fabric",
          title: "Fabric & care",
          content: (
            <ul className="space-y-1">
              {a.fabric && <li>{a.fabric}</li>}
              {a.care && <li>{a.care}</li>}
            </ul>
          ),
        },
        {
          id: "delivery",
          title: "Delivery & returns",
          content: (
            <p>
              Standard delivery 3–5 working days. Free returns within 28 days.
              Express and pickup-point options available at checkout.
            </p>
          ),
        },
      ]}
    />
  );
}
