import type { OrderStatus } from "./types";

// `status: undefined` shows every order.
const FILTERS: { label: string; status: OrderStatus | undefined }[] = [
  { label: "All", status: undefined },
  { label: "Pending", status: "PENDING" },
  { label: "Accepted", status: "ACCEPTED" },
  { label: "Rejected", status: "REJECTED" },
];

interface OrderStatusFiltersProps {
  status: OrderStatus | undefined;
  onChange: (status: OrderStatus | undefined) => void;
}

const OrderStatusFilters = ({ status, onChange }: OrderStatusFiltersProps) => (
  <div className="orders-filters">
    {FILTERS.map((filter) => (
      <button
        key={filter.label}
        className="orders-filter"
        type="button"
        aria-pressed={filter.status === status}
        onClick={() => onChange(filter.status)}
      >
        {filter.label}
      </button>
    ))}
  </div>
);

export default OrderStatusFilters;
