import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import BackButton from "../../../../shared/components/BackButton";
import { ROLE_HOME } from "../../../auth/roleRoutes";
import DistributorInfo from "../components/DistributorInfo";
import MoreProducts from "../components/MoreProducts";
import ProductOrderPanel from "../components/ProductOrderPanel";
import useDistributorProduct from "../hooks/useDistributorProduct";

const DistributorProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const { product, loading, error } = useDistributorProduct(id);

  let content: ReactNode;

  if (loading) {
    content = <p>Loading...</p>;
  } else if (error) {
    content = <p>{error.message}</p>;
  } else if (!product) {
    content = <p>Product not found.</p>;
  } else {
    content = (
      <>
        <div className="product-header">
          <h1>{product.product.name}</h1>

          <div className="product-meta">
            <span>
              <strong>Brand:</strong> {product.product.brand}
            </span>

            <span>
              <strong>Category:</strong> {product.product.category}
            </span>
          </div>
        </div>

        <div className="product-content">
          <ProductOrderPanel
            key={product.id}
            distributorId={product.distributor.id}
            productId={product.product.id}
            price={product.price}
            initialStock={product.stock}
          />

          <DistributorInfo distributor={product.distributor} />
        </div>

        <MoreProducts
          distributorId={product.distributor.id}
          distributorName={product.distributor.businessName}
          currentProductId={product.id}
        />
      </>
    );
  }

  // The back button sits outside `content` so every state has a way out.
  return (
    <div className="distributor-product-details">
      <BackButton fallback={ROLE_HOME.RETAILER} />

      {content}
    </div>
  );
};

export default DistributorProductDetailsPage;
