import { Link } from "react-router-dom";
import type { CategoryNode, Gender } from "@/types/api";

export function MegaMenu({
  node,
  gender,
  onNavigate,
}: {
  node: CategoryNode;
  gender: Gender;
  onNavigate: () => void;
}) {
  const columns = node.children;
  return (
    <div className="container-px py-8">
      <div className="grid grid-cols-4 gap-8">
        {columns.map((col) => (
          <div key={col.id}>
            <Link
              to={`/${gender}/${col.slug}`}
              onClick={onNavigate}
              className="mb-3 block font-display text-[13px] font-bold uppercase tracking-[0.1em] hover:underline"
            >
              {col.name}
            </Link>
            <ul className="space-y-2">
              {col.children.length > 0 ? (
                col.children.map((leaf) => (
                  <li key={leaf.id}>
                    <Link
                      to={`/${gender}/${leaf.slug}`}
                      onClick={onNavigate}
                      className="text-[13px] text-muted hover:text-fg"
                    >
                      {leaf.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link
                    to={`/${gender}/${col.slug}`}
                    onClick={onNavigate}
                    className="text-[13px] text-muted hover:text-fg"
                  >
                    Shop all {col.name}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        ))}
        <div className="col-span-1">
          <Link
            to={`/${gender}?onSale=true`}
            onClick={onNavigate}
            className="mb-3 block font-display text-[13px] font-bold uppercase tracking-[0.1em] text-sale hover:underline"
          >
            Sale
          </Link>
          <Link
            to={`/${gender}?isNew=true`}
            onClick={onNavigate}
            className="block text-[13px] text-muted hover:text-fg"
          >
            New in
          </Link>
        </div>
      </div>
    </div>
  );
}
