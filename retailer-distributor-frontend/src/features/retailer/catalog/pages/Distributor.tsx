import { useParams } from "react-router-dom";
import DistributorProductCard from "../components/DistributorProductCard";
import useDistributorProducts from "../hooks/useDistributorProducts";

export const Distributor = () => {
  const { distributorId } = useParams<{ distributorId: string }>();

  const { products, loading, error } = useDistributorProducts(distributorId);

  if (loading) {
    return (
      <div className="distributor-page">
        <div className="distributor-status">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="distributor-page">
        <div className="distributor-error">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="distributor-page">
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
    </div>
  );
};

export default Distributor;
