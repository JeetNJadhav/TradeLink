import { useMemo, type ReactNode } from "react";
import BackButton from "../../../../shared/components/BackButton";
import { ROLE_HOME } from "../../../auth/roleRoutes";
import AddListingForm from "../components/AddListingForm";
import ListingRow from "../components/ListingRow";
import useListings from "../hooks/useListings";

const DistributorProducts = () => {
  const { listings, loading, error, reload } = useListings();

  const listedProductIds = useMemo(
    () => new Set(listings.map((listing) => listing.productId)),
    [listings],
  );

  let content: ReactNode;

  if (loading) {
    content = <div className="distributor-status">Loading products...</div>;
  } else if (error) {
    content = <div className="distributor-error">{error.message}</div>;
  } else if (listings.length === 0) {
    content = (
      <div className="distributor-empty">
        <h3>No products listed yet</h3>
        <p>Search the catalog above to add your first product.</p>
      </div>
    );
  } else {
    content = (
      <table className="order-items listings-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Brand</th>
            <th>Category</th>
            <th className="is-numeric">Price (₹)</th>
            <th className="is-numeric">Stock</th>
            <th aria-label="Actions" />
          </tr>
        </thead>

        <tbody>
          {listings.map((listing) => (
            // A new price or stock from the server starts the row afresh, so
            // its inputs never show values the listing no longer has.
            <ListingRow
              key={`${listing.id}:${listing.price}:${listing.stock}`}
              listing={listing}
              onChanged={reload}
            />
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="orders-page">
      <BackButton fallback={ROLE_HOME.DISTRIBUTOR} />

      <div className="distributor-header">
        <h1>My products</h1>
        <p>The products you sell, with the price and stock retailers see</p>
      </div>

      {!loading && !error && (
        <AddListingForm listedProductIds={listedProductIds} onAdded={reload} />
      )}

      {content}
    </div>
  );
};

export default DistributorProducts;
