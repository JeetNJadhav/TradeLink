import ProductCard from "../components/ProductCard";
import ProductSearch from "../components/ProductSearch";
import useProductSearch from "../hooks/useProductSearch";

const Products = () => {
  const { products, loading, error, search } = useProductSearch();
  console.log("Products", products);

  return (
    <div className="products">
      <h1>Search Products</h1>

      <ProductSearch onSearch={search} />

      {loading && <p>Searching...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && products.length === 0 && <p>No products found.</p>}

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Products;
