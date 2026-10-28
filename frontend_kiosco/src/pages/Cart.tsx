
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";
import { createOrder } from "../services/api";
import { formatPriceARS, getTransferPrice } from "../utils/price";

function Cart() {
  const { items, totalItems, totalPrice, clearCart } = useCart();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "transferencia">("efectivo");

  const transferTotal = getTransferPrice(totalPrice);

  const finalizarPedido = async () => {
    if (items.length === 0) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));
      await createOrder(orderItems);
      setMessage("¡Pedido realizado con éxito!");
      clearCart();
    } catch (err: any) {
      setError(err.message || "Error al finalizar el pedido. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-page">
      <h1>Carrito de compras 🛒</h1>

      {message && <p className="success-message">{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {items.length === 0 ? (
        <div>
          <p>Tu carrito está vacío.</p>
          <Link to="/products">Ver productos</Link>
        </div>
      ) : (
        <>
          {items.map((item) => (
            <CartItem
              key={item.product.id}
              product={item.product}
              quantity={item.quantity}
            />
          ))}

          <h3>Total de unidades: {totalItems}</h3>
          <div className="cart-payment">
            <h4>Método de pago</h4>
            <label>
              <input
                type="radio"
                name="payment"
                value="efectivo"
                checked={paymentMethod === "efectivo"}
                onChange={(e) => setPaymentMethod(e.target.value as "efectivo")}
              />
              Efectivo
            </label>
            <label>
              <input
                type="radio"
                name="payment"
                value="transferencia"
                checked={paymentMethod === "transferencia"}
                onChange={(e) => setPaymentMethod(e.target.value as "transferencia")}
              />
              Transferencia bancaria (10% off)
            </label>
          </div>
          <h2>
            Total a pagar:{" "}
            {paymentMethod === "transferencia"
              ? formatPriceARS(transferTotal)
              : formatPriceARS(totalPrice)}
          </h2>

          <button
            onClick={() => {
              clearCart();
              setMessage("");
              setError("");
            }}
          >
            Vaciar carrito
          </button>

          <button onClick={finalizarPedido} disabled={loading}>
            {loading ? "Enviando pedido..." : "Finalizar pedido"}
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;
