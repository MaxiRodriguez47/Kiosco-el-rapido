import type { Product } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function getProducts(category?: string): Promise<Product[]> {
  const url = new URL(`${API_BASE_URL}/api/products`);
  if (category && category !== "todos") {
    url.searchParams.append("category", category);
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Error al obtener los productos");
  }
  return response.json();
}

export async function getProductById(id: number): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
  if (!response.ok) {
    throw new Error("Error al obtener el producto");
  }
  return response.json();
}

export async function createOrder(items: { product_id: number; quantity: number; is_combo?: boolean; combo_id?: number }[]): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Error al crear el pedido");
  }
  return response.json();
}

export async function updateProduct(id: number, product: Partial<Product>): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Error al actualizar el producto");
  }
  return response.json();
}

export async function deleteProduct(id: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Error al eliminar el producto");
  }
  return response.json();
}

export async function getOffers(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/offers`);
  if (!response.ok) throw new Error("Error al obtener ofertas");
  return response.json();
}

export async function getCombos(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/combos`);
  if (!response.ok) throw new Error("Error al obtener combos");
  return response.json();
}

export async function getAllOffers(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/offers/all`);
  if (!response.ok) throw new Error("Error al obtener ofertas");
  return response.json();
}

export async function createOffer(offer: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/offers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(offer),
  });
  if (!response.ok) throw new Error("Error al crear oferta");
  return response.json();
}

export async function updateOffer(id: number, offer: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/offers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(offer),
  });
  if (!response.ok) throw new Error("Error al actualizar oferta");
  return response.json();
}

export async function deleteOffer(id: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/offers/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Error al eliminar oferta");
  return response.json();
}

export async function getAllCombos(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/combos/all`);
  if (!response.ok) throw new Error("Error al obtener combos");
  return response.json();
}

export async function createCombo(combo: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/combos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(combo),
  });
  if (!response.ok) throw new Error("Error al crear combo");
  return response.json();
}

export async function updateCombo(id: number, combo: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/combos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(combo),
  });
  if (!response.ok) throw new Error("Error al actualizar combo");
  return response.json();
}

export async function deleteCombo(id: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/combos/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Error al eliminar combo");
  return response.json();
}
