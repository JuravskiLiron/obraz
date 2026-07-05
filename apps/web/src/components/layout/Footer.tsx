import { Link } from "react-router-dom";

const columns: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Help",
    links: [
      { label: "Track order", to: "/account/orders" },
      { label: "Delivery & returns", to: "/" },
      { label: "Size guide", to: "/" },
      { label: "Contact us", to: "/" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "Women", to: "/women" },
      { label: "Men", to: "/men" },
      { label: "New in", to: "/women?isNew=true" },
      { label: "Sale", to: "/women?onSale=true" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About FaraX", to: "/" },
      { label: "Careers", to: "/" },
      { label: "Corporate responsibility", to: "/" },
      { label: "Investors", to: "/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="container-px py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow mb-4 text-fg">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-[13px] text-muted hover:text-fg"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="eyebrow mb-4 text-fg">Stay in the loop</h3>
            <p className="mb-3 text-[13px] text-muted">
              New arrivals, exclusive offers, and more.
            </p>
            <div className="flex border border-fg">
              <input
                type="email"
                placeholder="Email address"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-subtle"
              />
              <button className="bg-fg px-4 text-[12px] font-semibold uppercase tracking-wide text-bg">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-px flex flex-col items-center justify-between gap-2 py-5 text-[12px] text-muted sm:flex-row">
          <span className="font-display font-extrabold uppercase tracking-[0.12em] text-fg">
            FaraX
          </span>
          <span>© {new Date().getFullYear()} FaraX. Demo storefront.</span>
        </div>
      </div>
    </footer>
  );
}
