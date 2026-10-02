import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import BackButton from "../../../../shared/components/BackButton";
import { ROLE_HOME } from "../../../auth/roleRoutes";
import DistributorProductCard from "../components/DistributorProductCard";
import useDistributorProducts from "../hooks/useDistributorProducts";

export const Distributor = () => {
  const { distributorId } = useParams<{ distributorId: string }>();

  const { products, loading, error } = useDistributorProducts(distributorId);

  let content: ReactNode;

  if (loading) {
    content = <div className="distributor-status">Loading products...</div>;
  } else if (error) {
    content = <div className="distributor-error">{error.message}</div>;
  } else {
    content = (
      <>
        <div className="distributor-header">
          <h1>Distributor Products</h1>
          <p>Products available from this distributor</p>
        </div>

        {products.length === 0 ? (
          <div className="distributor-empty">
            <h3>No products available</h3>
            <p>This distributor currently has no products listed.</p>
          </div>
        ) : (
          <div className="distributor-products">
            {products.map((item) => (
              <DistributorProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </>
    );
  }

  // The back button sits outside `content` so every state has a way out.
  return (
    <div className="distributor-page">
      <BackButton fallback={ROLE_HOME.RETAILER} />

      {content}
    </div>
  );
};

export default Distributor;
