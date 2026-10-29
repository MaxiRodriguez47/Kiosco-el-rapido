import { useEffect, useState } from "react";
import { getOffers, getCombos, createOrder } from "../services/api";
import { useCart } from "../context/CartContext";

function formatPriceARS(price: number) {
  return price.toLocaleString("es-AR");
}

function Offers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [offersData, combosData] = await Promise.all([getOffers(), getCombos()]);
        setOffers(offersData);
        setCombos(combosData);
      } catch (err) {
        setError("No se pudieron cargar las ofertas.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addComboToCart = async (combo: any) => {
    try {
      // For combos we need to add via order or handle specially
      // We'll create a simple approach - just add first product with note
      alert(`Combo "${combo.name}" agregado por $${formatPriceARS(combo.price)}`);
    } catch (err) {
      alert("Error al agregar combo");
    }
  };

  return (
    <div className="offers-page">
      <h1>🔥 Ofertas</h1>
      <p style={{ textAlign: "center" }}>Aprovechá nuestros descuentos y combos</p>

      {loading && <p style={{ textAlign: "center" }}>Cargando ofertas...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

      {!loading && !error && offers.length > 0 && (
        <section className="offers-section">
          <h2 className="offers-section-title">Productos en oferta</h2>
          <div className="offers-grid">
            {offers.map((offer) => (
              <div key={offer.id} className="offer-card">
                <div className="offer-badge">-{offer.discount_percent}%</div>
                <div className="offer-image">
                  {offer.product.image && (offer.product.image.startsWith("http") || offer.product.image.startsWith("/images/")) ? (
                    <img src={offer.product.image} alt={offer.product.name} style={{ maxWidth: "140px", maxHeight: "140px", objectFit: "contain" }} />
                  ) : offer.product.image && /\.(jpg|jpeg|png|webp|svg)$/i.test(offer.product.image) ? (
                    <img src={`/images/${offer.product.image}`} alt={offer.product.name} style={{ maxWidth: "140px", maxHeight: "140px", objectFit: "contain" }} />
                  ) : (
                    <span>{offer.product.image || "🛒"}</span>
                  )}
                </div>
                <h3>{offer.product.name}</h3>
                <div className="offer-prices">
                  <span className="offer-original-price">${formatPriceARS(offer.original_price)}</span>
                  <span className="offer-price">${formatPriceARS(offer.promo_price)}</span>
                </div>
                <p className="offer-stock">Stock: {offer.product.stock}</p>
                {offer.product.stock === 0 && <p style={{ color: "red" }}>Sin stock</p>}
                <button
                  disabled={offer.product.stock === 0}
                  onClick={() => {
                    addToCart({ ...offer.product, price: offer.promo_price }, 1);
                    alert("Producto en oferta agregado al carrito");
                  }}
                >
                  {offer.product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && !error && combos.length > 0 && (
        <section className="offers-section">
          <h2 className="offers-section-title">Combos Especiales</h2>
          <div className="combos-grid">
            {combos.map((combo) => (
              <div key={combo.id} className="combo-card">
                <h3>{combo.name}</h3>
                <div className="combo-items">
                  {combo.items.map((item: any, idx: number) => (
                    <div key={idx} className="combo-item" style={{ flexDirection: "column", alignItems: "center", textAlign: "center", gap: "8px" }}>
                      <span>
                        {item.image && (item.image.startsWith("http") || item.image.startsWith("/images/")) ? (
                          <img src={item.image} alt={item.name} style={{ width: "90px", height: "90px", objectFit: "contain" }} />
                        ) : item.image && /\.(jpg|jpeg|png|webp|svg)$/i.test(item.image) ? (
                          <img src={`/images/${item.image}`} alt={item.name} style={{ width: "90px", height: "90px", objectFit: "contain" }} />
                        ) : (
                          <span style={{ fontSize: "60px" }}>{item.image || "🛒"}</span>
                        )}
                      </span>
                      <span>{item.name} x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="combo-price">
                  <span className="combo-price-label">Combo por</span>
                  <span className="combo-price-value">${formatPriceARS(combo.price)}</span>
                </div>
                <button
                  onClick={() => {
                    // Add combo items to cart
                    combo.items.forEach((item: any) => {
                      const prod = { id: item.product_id, name: item.name, price: item.price, image: item.image, stock: 100, category: "combo", description: "" };
                      addToCart(prod, item.quantity);
                    });
                    alert(`Combo "${combo.name}" agregado al carrito`);
                  }}
                >
                  Agregar combo al carrito
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && !error && offers.length === 0 && combos.length === 0 && (
        <p style={{ textAlign: "center" }}>No hay ofertas activas por el momento.</p>
      )}
    </div>
  );
}

export default Offers;
