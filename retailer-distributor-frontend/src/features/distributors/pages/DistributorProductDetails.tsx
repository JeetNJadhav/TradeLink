import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getDistributorProductById,
  getDistributorProducts,
} from "../services/distributorService";

const DistributorProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [productDetailsData, setProductDetailsData] = useState<any>(null);
  const [distributorProductsData, setDistributorProductsData] = useState<any[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(true);
  const [error, setError] = useState("");

  const distributorId = location.state?.distributorId;

  useEffect(() => {
    if (!id || !distributorId) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setLoadingMoreProducts(true);
        setError("");

        const [productDetails, distributorProducts] = await Promise.all([
          getDistributorProductById(id),
          getDistributorProducts(distributorId),
        ]);

        setProductDetailsData(productDetails.data.distributorProduct);

        setDistributorProductsData(distributorProducts.data?.products || []);
      } catch (error) {
        console.error(error);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
        setLoadingMoreProducts(false);
      }
    };

    fetchDetails();
  }, [id, distributorId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!productDetailsData) {
    return <p>Product not found.</p>;
  }

  // Remove the current product from "More products"
  const moreProducts = distributorProductsData.filter(
    (item) => item.id !== productDetailsData.id,
  );

  return (
    <div className="distributor-product-details">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back to Search
      </button>

      <div className="product-header">
        <h1>{productDetailsData.product.name}</h1>

        <div className="product-meta">
          <span>
            <strong>Brand:</strong> {productDetailsData.product.brand}
          </span>

          <span>
            <strong>Category:</strong> {productDetailsData.product.category}
          </span>
        </div>
      </div>

      {/* Current Product */}
      <div className="product-content">
        <section className="product-info">
          <h2>Product Details</h2>

          <div className="price-stock">
            <div>
              <span className="label">Price</span>
              <span className="price">₹{productDetailsData.price}</span>
            </div>

            <div>
              <span className="label">Available Stock</span>
              <span className="stock">{productDetailsData.stock}</span>
            </div>
          </div>

          <div className="quantity-section">
            <span>Quantity</span>

            <div className="quantity-control">
              <button>-</button>
              <span>1</span>
              <button>+</button>
            </div>
          </div>

          <button className="add-to-cart-button">Add to Cart</button>
        </section>

        {/* Distributor */}
        <section className="distributor-info">
          <h2>Distributor</h2>

          <h3>{productDetailsData.distributor.businessName}</h3>

          <p>
            <strong>Location:</strong>
            {productDetailsData.distributor.locations?.[0]?.city}
          </p>

          <p>
            <strong>Address:</strong>
            {productDetailsData.distributor.locations?.[0]?.address}
          </p>

          <p>
            <strong>Contact:</strong>
            {productDetailsData.distributor.contactInfo}
          </p>
        </section>
      </div>

      {/* More Products */}
      <section className="more-products">
        <h2>
          More products from {productDetailsData.distributor.businessName}
        </h2>

        {loadingMoreProducts ? (
          <p>Loading products...</p>
        ) : (
          <>
            <div className="more-products-grid">
              {moreProducts.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="more-product-card"
                  onClick={() =>
                    navigate(`/distributor-products/${item.id}`, {
                      state: {
                        distributorId: productDetailsData.distributor.id,
                      },
                    })
                  }
                >
                  <h3>{item.product.name}</h3>

                  <p className="more-product-price">₹{item.price}</p>

                  <p className="more-product-stock">Stock: {item.stock}</p>
                </div>
              ))}
            </div>

            {moreProducts.length > 3 && (
              <div className="view-more-container">
                <button
                  className="view-more-products"
                  onClick={() =>
                    navigate(`/distributors/${distributorId}/products`)
                  }
                >
                  View More Products
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default DistributorProductDetails;
