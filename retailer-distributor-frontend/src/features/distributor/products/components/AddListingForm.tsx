import { useState, type FormEvent } from "react";
import useListingAction from "../hooks/useListingAction";
import {
  parsePrice,
  parseStock,
  PRICE_HINT,
  STOCK_HINT,
} from "../listingInput";
import { addListing } from "../services/listingService";
import type { CatalogProduct } from "../types/listing";
import CatalogProductPicker from "./CatalogProductPicker";

interface AddListingFormProps {
  listedProductIds: ReadonlySet<string>;
  onAdded: () => void;
}

// Pick a product of the master list, then give it a price and a stock.
const AddListingForm = ({ listedProductIds, onAdded }: AddListingFormProps) => {
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const action = useListingAction();

  const newPrice = parsePrice(price);
  const newStock = parseStock(stock);

  const reset = () => {
    setProduct(null);
    setPrice("");
    setStock("");
  };

  // A hint only shows for a field that has something typed in it.
  const hint =
    (price !== "" && newPrice === null && PRICE_HINT) ||
    (stock !== "" && newStock === null && STOCK_HINT);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product || newPrice === null || newStock === null) return;

    const added = await action.run(() =>
      addListing({ productId: product.id, price: newPrice, stock: newStock }),
    );

    if (added) reset();

    // Reload even after a failure: the usual cause is that the product was
    // listed from another tab, and the list should show that.
    onAdded();
  };

  return (
    <form
      className="add-listing-form"
      aria-labelledby="add-listing-title"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <h2 id="add-listing-title">Add product</h2>

      <CatalogProductPicker
        listedProductIds={listedProductIds}
        disabled={action.submitting}
        onPick={setProduct}
      />

      {product && (
        <div className="add-listing-fields">
          <p className="add-listing-product">
            <strong>{product.name}</strong>
            <span>
              {product.brand} · {product.category}
            </span>
          </p>

          <label>
            Price (₹)
            <input
              type="text"
              inputMode="decimal"
              value={price}
              required
              autoFocus
              disabled={action.submitting}
              onChange={(event) => setPrice(event.target.value)}
            />
          </label>

          <label>
            Stock
            <input
              type="text"
              inputMode="numeric"
              value={stock}
              required
              disabled={action.submitting}
              onChange={(event) => setStock(event.target.value)}
            />
          </label>

          <div className="listing-actions">
            <button
              className="order-action-button is-primary"
              type="submit"
              disabled={
                action.submitting || newPrice === null || newStock === null
              }
            >
              {action.submitting ? "Adding..." : "Add product"}
            </button>

            <button
              className="order-action-button"
              type="button"
              disabled={action.submitting}
              onClick={reset}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {product && hint && <p className="listing-hint">{hint}</p>}

      {action.error && (
        <p className="order-error" role="alert">
          {action.error}
        </p>
      )}
    </form>
  );
};

export default AddListingForm;
