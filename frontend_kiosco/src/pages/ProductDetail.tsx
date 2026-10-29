
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { getProductById, getOffers } from "../services/api";
import type { Product } from "../types";
import { formatPriceARS, getTransferPrice } from "../utils/price";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        if (id) {
          const [data, offersData] = await Promise.all([getProductById(Number(id)), getOffers()]);
          setProduct(data);
          const foundOffer = offersData.find((o: any) => o.product_id === Number(id));
          setOffer(foundOffer || null);
        }
      } catch (err) {
        setError("No se pudo cargar el producto. Intentá de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail">
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail">
        <p style={{ color: "red" }}>{error}</p>
        <Link to="/products">Volver al catálogo</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail">
        <h1>Producto no encontrado</h1>
        <Link to="/products">Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <Link to="/products" className="back-link back-link-top">
        ← Volver
      </Link>
      <h1>Detalle del producto</h1>

      <div className="detail-card">
        <div className="detail-image">
          {product.image && (product.image.startsWith("http") || product.image.startsWith("/images/")) ? (
            <img src={product.image} alt={product.name} style={{ maxWidth: "320px", maxHeight: "320px", objectFit: "contain" }} />
          ) : product.image && /\.(jpg|jpeg|png|webp|svg)$/i.test(product.image) ? (
            <img src={`/images/${product.image}`} alt={product.name} style={{ maxWidth: "320px", maxHeight: "320px", objectFit: "contain" }} />
          ) : (
            <span style={{ fontSize: "140px" }}>{product.image || "🛒"}</span>
          )}
        </div>

        <h2>{product.name}</h2>

        <p>Categoría: {product.category}</p>
        <p>{product.description}</p>

        <div className="price-section detail-price">
          {offer && (
            <div className="price-badge">-{Math.round(Number(offer.discount_percent))}% OFF</div>
          )}
          <div className="price-row">
            {offer ? (
              <>
                <span className="price-final">{formatPriceARS(Number(offer.promo_price))}</span>
                <span className="price-original">{formatPriceARS(Number(offer.original_price || product.price))}</span>
              </>
            ) : (
              <span className="price-final">{formatPriceARS(Number(product.price))}</span>
            )}
          </div>
          <div className="price-transfer">
            {formatPriceARS(getTransferPrice(offer ? Number(offer.promo_price) : Number(product.price)))} con Transferencia
          </div>
        </div>

        <p>Stock disponible: {product.stock}</p>
        {product.stock === 0 && <p style={{ color: "red" }}>Sin stock</p>}

        <label htmlFor="quantity">Cantidad: </label>

        <input
          id="quantity"
          type="number"
          min="1"
          max={product.stock}
          value={quantity}
          disabled={product.stock === 0}
          onChange={(e) => {
            const value = Number(e.target.value);
            setQuantity(Math.max(1, Math.min(product.stock, value || 1)));
          }}
        />

        <button
          disabled={product.stock === 0}
          onClick={() => {
            const priceToAdd = offer ? Number(offer.promo_price) : Number(product.price);
            addToCart({ ...product, price: priceToAdd }, quantity);
            alert("Producto agregado al carrito");
          }}
        >
          {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
        </button>

        <Link to="/products" className="back-link">
          ← Volver al catálogo
        </Link>
      </div>
    </div>
  );
}

export default ProductDetail;
