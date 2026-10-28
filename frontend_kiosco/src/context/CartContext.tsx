
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "../types";

// Cada elemento del carrito
export interface CartItem {
  product: Product;
  quantity: number;
}

// Funciones y datos del carrito
interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

// Creamos el contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "kiosco-el-rapido-cart";

// Componente que comparte el carrito
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as CartItem[];
      }
    } catch (error) {
      console.error("Error al cargar carrito desde localStorage:", error);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error al guardar carrito en localStorage:", error);
    }
  }, [items]);

  // Agregar producto
  const addToCart = (product: Product, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) return;

    setItems((currentItems) => {
      const existing = currentItems.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + quantity,
                  product.stock
                ),
              }
            : item
        );
      }

      if (product.stock === 0) return currentItems;

      return [
        ...currentItems,
        {
          product,
          quantity: Math.min(quantity, product.stock),
        },
      ];
    });
  };

  // Eliminar producto
  const removeFromCart = (productId: number) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId)
    );
  };

  // Modificar cantidad
  const updateQuantity = (productId: number, quantity: number) => {
    if (!Number.isInteger(quantity)) return;

    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: Math.min(Math.max(quantity, 0), item.product.stock),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Aumentar cantidad
  const increaseQuantity = (productId: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: Math.min(item.quantity + 1, item.product.stock),
            }
          : item
      )
    );
  };

  // Disminuir cantidad
  const decreaseQuantity = (productId: number) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Vaciar carrito
  const clearCart = () => {
    setItems([]);
  };

  // Cantidad total de unidades
  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Precio total
  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook para utilizar el carrito
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }

  return context;
}
