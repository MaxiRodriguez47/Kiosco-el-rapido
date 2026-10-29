
import { useCart } from "../context/CartContext";
import type { Product } from "../types";

interface CartItemProps {
  product: Product;
  quantity: number;
}

function CartItem({ product, quantity }: CartItemProps) {
  const { updateQuantity, removeFromCart, increaseQuantity, decreaseQuantity } =
    useCart();

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {product.image && (product.image.startsWith("http") || product.image.startsWith("/images/")) ? (
          <img src={product.image} alt={product.name} style={{ width: "90px", height: "90px", objectFit: "contain" }} />
        ) : product.image && /\.(jpg|jpeg|png|webp|svg)$/i.test(product.image) ? (
          <img src={`/images/${product.image}`} alt={product.name} style={{ width: "90px", height: "90px", objectFit: "contain" }} />
        ) : (
          <span style={{ fontSize: "70px" }}>{product.image || "🛒"}</span>
        )}
      </div>

      <div>
        <h3>{product.name}</h3>
        <p>Precio: ${product.price}</p>
        <p>Subtotal: ${product.price * quantity}</p>
      </div>

      <div>
        <div className="quantity-controls">
          <button
            type="button"
            className="qty-btn"
            onClick={() => decreaseQuantity(product.id)}
            aria-label="Disminuir cantidad"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 1 && value <= product.stock) {
                updateQuantity(product.id, value);
              } else if (value > product.stock) {
                updateQuantity(product.id, product.stock);
              }
            }}
          />
          <button
            type="button"
            className="qty-btn"
            onClick={() => increaseQuantity(product.id)}
            disabled={quantity >= product.stock}
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>
        <button onClick={() => removeFromCart(product.id)}>Eliminar</button>
      </div>
    </div>
  );
}

export default CartItem;
