
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getProducts, getOffers } from "../services/api";
import type { Product } from "../types";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "todos";
  const search = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const [data, offersData] = await Promise.all([getProducts(category), getOffers()]);
        setProducts(data);
        setOffers(offersData);
      } catch (err) {
        setError("No se pudieron cargar los productos. Intentá de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const filteredProducts = products.filter((product) => {
    if (!search) return true;
    return product.name.toLowerCase().includes(search.toLowerCase());
  });

  const getOfferForProduct = (productId: number) => {
    return offers.find((o) => o.product_id === productId);
  };

  return (
    <div>
      <h1>Productos del Kiosco</h1>

      <p style={{ textAlign: "center" }}>
        Elegí los productos que quieras comprar
      </p>



      {search && (
        <p style={{ textAlign: "center" }}>
          Resultados para: <strong>{search}</strong>
        </p>
      )}

      {loading && <p style={{ textAlign: "center" }}>Cargando productos...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div className="products-container">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} offer={getOfferForProduct(product.id)} />
          ))}
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <p style={{ textAlign: "center" }}>No se encontraron productos.</p>
      )}
    </div>
  );
}

export default Products;
