
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";
import { formatPriceARS, getTransferPrice } from "../utils/price";

interface ProductCardProps {
  product: Product;
  offer?: any;
}

function ProductCard({ product, offer }: ProductCardProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const hasOffer = !!offer && offer.active !== false;
  const originalPrice = hasOffer ? Number(offer.original_price || product.price) : Number(product.price);
  const finalPrice = hasOffer ? Number(offer.promo_price) : Number(product.price);
  const discountPercent = hasOffer ? Math.round(Number(offer.discount_percent)) : 0;
  const transferPrice = getTransferPrice(finalPrice);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "BUTTON") {
      return;
    }
    navigate(`/products/${product.id}`);
  };

  return (
    <div className="product-card product-card-clickable" onClick={handleCardClick}>
      <div className="product-card-image">
        {product.image && (product.image.startsWith("http") || product.image.startsWith("/images/")) ? (
          <img src={product.image} alt={product.name} />
        ) : product.image && /\.(jpg|jpeg|png|webp|svg)$/i.test(product.image) ? (
          <img src={`/images/${product.image}`} alt={product.name} />
        ) : (
          <span className="product-emoji">{product.image || "🛒"}</span>
        )}
      </div>

      <h3>{product.name}</h3>

      <p>Categoría: {product.category}</p>
      <p>Stock: {product.stock}</p>
      {product.stock === 0 && <p style={{ color: "red" }}>Sin stock</p>}

      <div className="price-section">
        {hasOffer && (
          <div className="price-badge">-{discountPercent}% OFF</div>
        )}
        <div className="price-row">
          {hasOffer ? (
            <>
              <span className="price-final">{formatPriceARS(finalPrice)}</span>
              <span className="price-original">{formatPriceARS(originalPrice)}</span>
            </>
          ) : (
            <span className="price-final">{formatPriceARS(finalPrice)}</span>
          )}
        </div>
        <div className="price-transfer">{formatPriceARS(transferPrice)} con Transferencia</div>
      </div>

      <button
        disabled={product.stock === 0}
        onClick={(e) => {
          e.stopPropagation();
          addToCart({ ...product, price: finalPrice }, 1);
        }}
      >
        {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
      </button>
    </div>
  );
}

export default ProductCard;
