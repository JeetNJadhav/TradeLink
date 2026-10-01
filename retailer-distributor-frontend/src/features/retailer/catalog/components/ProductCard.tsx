import { Link } from "react-router-dom";
import type { ProductSearchResult } from "../types/productSearch";

interface ProductCardProps {
  product: Pick<
    ProductSearchResult,
    "id" | "productName" | "brand" | "distributorName" | "price" | "stock"
  >;
}

// A search result. Its id is the distributor listing's id.
const ProductCard = ({ product }: ProductCardProps) => (
  <Link
    className="product-card card-link"
    to={`/distributor-products/${product.id}`}
  >
    <h3>{product.productName}</h3>

    <p>Brand: {product.brand || "N/A"}</p>

    <p>Distributor: {product.distributorName}</p>

    <p>Price: ₹{product.price} per unit</p>

    <p>Stock: {product.stock} units</p>
  </Link>
);

export default ProductCard;
