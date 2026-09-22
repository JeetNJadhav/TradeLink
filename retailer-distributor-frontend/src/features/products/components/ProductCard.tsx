import type { ProductSearchResult } from "../types/productSearch";

interface ProductCardProps {
  product: ProductSearchResult;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="product-card">
      <h3>{product.productName}</h3>

      <p>Brand: {product.brand || "N/A"}</p>

      <p>Distributor: {product.distributorName}</p>

      <p>Price: ₹{product.price}</p>

      <p>Stock: {product.stock}</p>
    </div>
  );
};

export default ProductCard;
