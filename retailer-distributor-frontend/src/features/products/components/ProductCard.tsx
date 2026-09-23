import { useNavigate } from "react-router-dom";
import type { ProductSearchResult } from "../types/productSearch";

interface ProductCardProps {
  product: ProductSearchResult;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/distributor-products/${product.id}`, {
      state: {
        distributorId: product.distributorId,
      },
    });
  };
  return (
    <div className="product-card" onClick={handleClick}>
      <h3>{product.productName}</h3>

      <p>Brand: {product.brand || "N/A"}</p>

      <p>Distributor: {product.distributorName}</p>

      <p>Price: ₹{product.price} per unit</p>

      <p>Stock: {product.stock} units</p>
    </div>
  );
};

export default ProductCard;
