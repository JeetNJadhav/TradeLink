import { useState } from "react";
import usePlaceOrder from "../../orders/hooks/usePlaceOrder";
import QuantityStepper from "./QuantityStepper";

interface ProductOrderPanelProps {
  distributorId: string;
  productId: string;
  price: number;
  // Stock when the listing was loaded. After that the panel keeps it up to
  // date itself from each order's response.
  initialStock: number;
}

// Price, stock and ordering for one listing. Render it with a `key` per listing
// so the stock, quantity and order messages start fresh for every product.
const ProductOrderPanel = ({
  distributorId,
  productId,
  price,
  initialStock,
}: ProductOrderPanelProps) => {
  const [stock, setStock] = useState(initialStock);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const { placing, order, error, placeOrder } = usePlaceOrder();

  const inStock = stock > 0;
  // Stock can drop below what was selected once an order went through.
  const quantity = Math.max(1, Math.min(selectedQuantity, stock));

  const handlePlaceOrder = async () => {
    const placed = await placeOrder({
      distributorId,
      items: [{ productId, quantity }],
    });

    if (!placed) return;

    const stockLevel = placed.stockLevels.find(
      (level) => level.productId === productId,
    );
    if (stockLevel) setStock(stockLevel.stock);

    setSelectedQuantity(1);
  };

  return (
    <section className="product-info">
      <h2>Product Details</h2>

      <div className="price-stock">
        <div>
          <span className="label">Price</span>
          <span className="price">₹{price}</span>
        </div>

        <div>
          <span className="label">Available Stock</span>
          <span className="stock">{inStock ? stock : "Out of stock"}</span>
        </div>
      </div>

      <div className="quantity-section">
        <span>Quantity</span>

        <QuantityStepper
          value={quantity}
          max={stock}
          disabled={placing || !inStock}
          onChange={setSelectedQuantity}
        />
      </div>

      <button
        className="add-to-cart-button"
        type="button"
        disabled={placing || !inStock}
        onClick={() => void handlePlaceOrder()}
      >
        {placing ? "Placing Order..." : "Place Order"}
      </button>

      {order && (
        <p className="order-success" role="status">
          Order placed successfully. Total: ₹{order.totalAmount}
        </p>
      )}
      {error && (
        <p className="order-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
};

export default ProductOrderPanel;
