import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/uiStore";
import {
  FilterSidebar,
  type FilterState,
  type FilterHandlers,
} from "./FilterSidebar";
import type { Facets } from "@/types/api";

export function FilterDrawer({
  facets,
  state,
  handlers,
  total,
  onClearAll,
}: {
  facets: Facets;
  state: FilterState;
  handlers: FilterHandlers;
  total: number;
  onClearAll: () => void;
}) {
  const drawer = useUiStore((s) => s.drawer);
  const close = useUiStore((s) => s.closeDrawer);

  return (
    <Drawer
      open={drawer === "filter"}
      onClose={close}
      side="left"
      title="Filter"
      footer={
        <div className="flex items-center gap-3 px-5 py-4">
          <Button variant="outline" size="sm" onClick={onClearAll}>
            Clear
          </Button>
          <Button fullWidth onClick={close}>
            View {total} items
          </Button>
        </div>
      }
    >
      <div className="px-5">
        <FilterSidebar facets={facets} state={state} handlers={handlers} />
      </div>
    </Drawer>
  );
}
