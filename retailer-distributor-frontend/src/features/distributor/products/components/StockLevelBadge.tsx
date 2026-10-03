import { stockLevelOf, type StockLevel } from "../stockLevel";

const BADGES: Record<StockLevel, { label: string; className: string } | null> =
  {
    out: { label: "Out of stock", className: "is-out-of-stock" },
    low: { label: "Low stock", className: "is-low-stock" },
    ok: null,
  };

// Flags a listing retailers cannot order, or soon will not be able to.
const StockLevelBadge = ({ stock }: { stock: number }) => {
  const badge = BADGES[stockLevelOf(stock)];
  if (!badge) return null;

  return (
    <span className={`order-status-badge ${badge.className}`}>
      {badge.label}
    </span>
  );
};

export default StockLevelBadge;
