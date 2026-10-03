import { useState, type FormEvent } from "react";
import useListingAction from "../hooks/useListingAction";
import {
  parsePrice,
  parseStock,
  PRICE_HINT,
  STOCK_HINT,
} from "../listingInput";
import { removeListing, updateListing } from "../services/listingService";
import type { Listing, ListingChanges } from "../types/listing";
import { stockLevelOf } from "../stockLevel";
import StockLevelBadge from "./StockLevelBadge";

interface ListingRowProps {
  listing: Listing;
  // Called after a save or a removal, successful or not, so the list shows
  // what the server now has.
  onChanged: () => void;
}

// One listing with its price and stock editable in place.
const ListingRow = ({ listing, onChanged }: ListingRowProps) => {
  const [price, setPrice] = useState(String(listing.price));
  const [stock, setStock] = useState(String(listing.stock));
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  const action = useListingAction();

  const newPrice = parsePrice(price);
  const newStock = parseStock(stock);

  // Only what was edited is sent: saving a new price must not write back a
  // stock that orders have changed since the page loaded.
  const changes: ListingChanges = {};
  if (newPrice !== null && newPrice !== listing.price) changes.price = newPrice;
  if (newStock !== null && newStock !== listing.stock) changes.stock = newStock;

  const hint =
    (newPrice === null && PRICE_HINT) || (newStock === null && STOCK_HINT);
  const canSave = !hint && Object.keys(changes).length > 0;
  const formId = `listing-${listing.id}`;
  const productName = listing.product.name;

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    await action.run(() => updateListing(listing.id, changes));
    onChanged();
  };

  const handleRemove = async () => {
    const removed = await action.run(() => removeListing(listing.id));
    if (!removed) setConfirmingRemoval(false);
    onChanged();
  };

  return (
    <tr className={`is-stock-${stockLevelOf(listing.stock)}`}>
      <td>{productName}</td>
      <td>{listing.product.brand}</td>
      <td>{listing.product.category}</td>

      <td className="is-numeric">
        <input
          form={formId}
          type="text"
          inputMode="decimal"
          value={price}
          aria-label={`Price of ${productName}`}
          aria-invalid={newPrice === null}
          disabled={action.submitting}
          onChange={(event) => setPrice(event.target.value)}
        />
      </td>

      <td className="is-numeric">
        <input
          form={formId}
          type="text"
          inputMode="numeric"
          value={stock}
          aria-label={`Stock of ${productName}`}
          aria-invalid={newStock === null}
          disabled={action.submitting}
          onChange={(event) => setStock(event.target.value)}
        />
        <StockLevelBadge stock={listing.stock} />
      </td>

      <td>
        {/* The inputs sit in other cells and join this form through `form`. */}
        <form
          id={formId}
          className="listing-actions"
          onSubmit={(event) => void handleSave(event)}
        >
          {confirmingRemoval ? (
            <>
              <button
                className="order-action-button is-danger"
                type="button"
                disabled={action.submitting}
                onClick={() => void handleRemove()}
              >
                {action.submitting ? "Removing..." : "Confirm"}
              </button>

              <button
                className="order-action-button"
                type="button"
                disabled={action.submitting}
                onClick={() => setConfirmingRemoval(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className="order-action-button is-primary"
                type="submit"
                disabled={action.submitting || !canSave}
              >
                {action.submitting ? "Saving..." : "Save"}
              </button>

              <button
                className="order-action-button is-danger"
                type="button"
                disabled={action.submitting}
                aria-label={`Remove ${productName}`}
                onClick={() => setConfirmingRemoval(true)}
              >
                Remove
              </button>
            </>
          )}
        </form>

        {confirmingRemoval && (
          <p className="listing-hint">
            Retailers will no longer see or order this product.
          </p>
        )}

        {hint && <p className="listing-hint">{hint}</p>}

        {action.error && (
          <p className="order-error" role="alert">
            {action.error}
          </p>
        )}
      </td>
    </tr>
  );
};

export default ListingRow;
