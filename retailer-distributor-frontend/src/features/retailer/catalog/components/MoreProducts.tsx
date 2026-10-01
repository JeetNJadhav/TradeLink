import { Link } from "react-router-dom";
import useDistributorProducts from "../hooks/useDistributorProducts";
import DistributorProductCard from "./DistributorProductCard";

interface MoreProductsProps {
  distributorId: string;
  distributorName: string;
  // The listing already on screen, left out of the list.
  currentProductId: string;
}

const PREVIEW_COUNT = 3;

// Loads on its own so a failure here never hides the product being viewed.
const MoreProducts = ({
  distributorId,
  distributorName,
  currentProductId,
}: MoreProductsProps) => {
  const { products, loading, error } = useDistributorProducts(distributorId);

  const moreProducts = products.filter((item) => item.id !== currentProductId);

  return (
    <section className="more-products">
      <h2>More products from {distributorName}</h2>

      {loading && <p>Loading products...</p>}

      {error && <p>Could not load more products from this distributor.</p>}

      {!loading && !error && moreProducts.length === 0 && (
        <p>This distributor has no other products.</p>
      )}

      {moreProducts.length > 0 && (
        <>
          <div className="more-products-grid">
            {moreProducts.slice(0, PREVIEW_COUNT).map((item) => (
              <DistributorProductCard
                key={item.id}
                item={item}
                variant="compact"
              />
            ))}
          </div>

          {moreProducts.length > PREVIEW_COUNT && (
            <div className="view-more-container">
              <Link
                className="view-more-products"
                to={`/distributors/${distributorId}/products`}
              >
                View More Products
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default MoreProducts;
