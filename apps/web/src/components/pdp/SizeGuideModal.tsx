import { Modal } from "@/components/ui/Modal";

const rows = [
  ["XS", "32–34", "24–26", "34–36"],
  ["S", "36–38", "28–30", "38–40"],
  ["M", "39–41", "31–33", "41–43"],
  ["L", "42–44", "34–36", "44–46"],
  ["XL", "45–47", "37–39", "47–49"],
];

export function SizeGuideModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Size guide">
      <p className="mb-4 text-sm text-muted">
        Measurements in inches. If you’re between sizes, we recommend sizing up.
      </p>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-fg text-left">
            <th className="py-2 font-semibold">Size</th>
            <th className="py-2 font-semibold">Chest</th>
            <th className="py-2 font-semibold">Waist</th>
            <th className="py-2 font-semibold">Hips</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-b border-line">
              {r.map((cell, i) => (
                <td key={i} className={i === 0 ? "py-2.5 font-medium" : "py-2.5 text-muted"}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}
