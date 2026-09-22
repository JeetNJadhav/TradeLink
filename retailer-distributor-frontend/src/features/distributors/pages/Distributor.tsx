import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDistributorProducts } from "../services/distributorService";

interface Product {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
}

interface DistributorProduct {
  id: string;
  price: string;
  stock: number;
  product: Product;
}

export const Distributor = () => {
  const { distributorId } = useParams<{ distributorId: string }>();

  const [products, setProducts] = useState<DistributorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!distributorId) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getDistributorProducts(distributorId);

        setProducts(response.data.products);
      } catch (error) {
        console.error("Failed to fetch distributor products:", error);
        setError("Failed to load distributor products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [distributorId]);

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
        <div className="distributor-error">{error}</div>
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
          {products?.map((item) => (
            <div className="distributor-product-card" key={item.id}>
              <h3>{item.product.name}</h3>

              <div className="product-info">
                {item.product.brand && <span>Brand: {item.product.brand}</span>}

                {item.product.category && (
                  <span>Category: {item.product.category}</span>
                )}

                <span className="product-price">₹{item.price}</span>

                <span className="product-stock">Stock: {item.stock}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Distributor;
