import { Link } from "react-router-dom";
import type { DistributorProductItem } from "../types/distributor";

interface DistributorProductCardProps {
  item: DistributorProductItem;
  // "compact" shows name, price and stock only.
  variant?: "full" | "compact";
}

// A distributor's listing, linking to its details page.
const DistributorProductCard = ({
  item,
  variant = "full",
}: DistributorProductCardProps) => {
  const to = `/distributor-products/${item.id}`;

  if (variant === "compact") {
    return (
      <Link className="more-product-card card-link" to={to}>
        <h3>{item.product.name}</h3>

        <p className="more-product-price">₹{item.price}</p>

        <p className="more-product-stock">Stock: {item.stock}</p>
      </Link>
    );
  }

  return (
    <Link className="distributor-product-card card-link" to={to}>
      <h3>{item.product.name}</h3>

      <div className="product-info">
        <span>Brand: {item.product.brand}</span>

        <span>Category: {item.product.category}</span>

        <span className="product-price">₹{item.price}</span>

        <span className="product-stock">Stock: {item.stock}</span>
      </div>
    </Link>
  );
};

export default DistributorProductCard;
