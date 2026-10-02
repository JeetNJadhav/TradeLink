import BackButton from "../../../../shared/components/BackButton";
import { ROLE_HOME } from "../../../auth/roleRoutes";
import ProductCard from "../components/ProductCard";
import ProductSearch from "../components/ProductSearch";
import useProductSearch from "../hooks/useProductSearch";

const Products = () => {
  const { products, loading, error, hasSearched, search } = useProductSearch();

  return (
    <div className="products">
      <BackButton fallback={ROLE_HOME.RETAILER} />

      <h1>Search Products</h1>

      <ProductSearch onSearch={search} />

      {!hasSearched && <p>Search by product, brand or distributor.</p>}

      {loading && <p>Searching...</p>}

      {error && <p>{error}</p>}

      {hasSearched && !loading && !error && products.length === 0 && (
        <p>No products found.</p>
      )}

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Products;
