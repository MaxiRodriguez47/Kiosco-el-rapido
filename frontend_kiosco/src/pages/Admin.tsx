import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getProducts, updateProduct, deleteProduct, getAllOffers, createOffer, updateOffer, deleteOffer, getAllCombos, createCombo, updateCombo, deleteCombo } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../types";

function formatPriceARS(price: number) {
  return price.toLocaleString("es-AR");
}

function Admin() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<"products" | "offers" | "combos">("products");

  const [newOffer, setNewOffer] = useState({ product_id: "", discount_percent: "", promo_price: "", active: true, start_date: "", end_date: "" });
  const [newCombo, setNewCombo] = useState({ name: "", price: "", active: true, start_date: "", end_date: "", items: [{ product_id: "", quantity: 1 }] });

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodData, offersData, combosData] = await Promise.all([
        getProducts(),
        getAllOffers(),
        getAllCombos(),
      ]);
      setProducts(prodData);
      setOffers(offersData);
      setCombos(combosData);
    } catch (err) {
      setError("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleUpdate = async (product: Product) => {
    try {
      setMessage(null);
      await updateProduct(product.id, {
        name: product.name,
        category: product.category,
        price: Number(product.price),
        stock: Number(product.stock),
        description: product.description,
        image: product.image,
      });
      setMessage("Producto actualizado correctamente");
      fetchAll();
    } catch (err) {
      setError("Error al actualizar el producto");
    }
  };

  const handleChange = (id: number, field: keyof Product, value: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              [field]: field === "price" || field === "stock" ? Number(value) : value,
            }
          : p
      )
    );
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que querés eliminar este producto?")) {
      return;
    }
    try {
      setMessage(null);
      setError(null);
      await deleteProduct(id);
      setMessage("Producto eliminado correctamente");
      fetchAll();
    } catch (err) {
      setError("Error al eliminar el producto");
    }
  };

  const handleCreateOffer = async () => {
    try {
      setMessage(null);
      await createOffer({
        product_id: Number(newOffer.product_id),
        discount_percent: Number(newOffer.discount_percent),
        promo_price: Number(newOffer.promo_price),
        active: newOffer.active,
        start_date: newOffer.start_date || null,
        end_date: newOffer.end_date || null,
      });
      setMessage("Oferta creada");
      setNewOffer({ product_id: "", discount_percent: "", promo_price: "", active: true, start_date: "", end_date: "" });
      fetchAll();
    } catch (err) {
      setError("Error al crear oferta");
    }
  };

  const handleToggleOffer = async (offer: any) => {
    try {
      await updateOffer(offer.id, {
        product_id: offer.product_id,
        discount_percent: offer.discount_percent,
        promo_price: offer.promo_price,
        active: !offer.active,
        start_date: offer.start_date,
        end_date: offer.end_date,
      });
      fetchAll();
    } catch (err) {
      setError("Error al actualizar oferta");
    }
  };

  const handleDeleteOffer = async (id: number) => {
    try {
      await deleteOffer(id);
      fetchAll();
    } catch (err) {
      setError("Error al eliminar oferta");
    }
  };

  const handleCreateCombo = async () => {
    try {
      setMessage(null);
      const items = newCombo.items.filter((i) => i.product_id).map((i) => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) }));
      await createCombo({
        name: newCombo.name,
        price: Number(newCombo.price),
        items,
        active: newCombo.active,
        start_date: newCombo.start_date || null,
        end_date: newCombo.end_date || null,
      });
      setMessage("Combo creado");
      setNewCombo({ name: "", price: "", active: true, start_date: "", end_date: "", items: [{ product_id: "", quantity: 1 }] });
      fetchAll();
    } catch (err) {
      setError("Error al crear combo");
    }
  };

  return (
    <div className="admin-page">
      <h1>Panel de Administración</h1>
      <p style={{ textAlign: "center" }}>Gestionar productos, ofertas y combos</p>

      <div className="admin-tabs">
        <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>Productos</button>
        <button className={tab === "offers" ? "active" : ""} onClick={() => setTab("offers")}>Ofertas</button>
        <button className={tab === "combos" ? "active" : ""} onClick={() => setTab("combos")}>Combos</button>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Cargando...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}
      {message && <p style={{ textAlign: "center", color: "green" }}>{message}</p>}

      {tab === "products" && !loading && !error && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio (ARS)</th>
                <th>Stock</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.image}</td>
                  <td>
                    <input type="text" value={product.name} onChange={(e) => handleChange(product.id, "name", e.target.value)} />
                  </td>
                  <td>
                    <select value={product.category} onChange={(e) => handleChange(product.id, "category", e.target.value)}>
                      <option value="bebidas">bebidas</option>
                      <option value="snacks">snacks</option>
                      <option value="golosinas">golosinas</option>
                      <option value="varios">varios</option>
                    </select>
                  </td>
                  <td>
                    <input type="number" value={product.price} onChange={(e) => handleChange(product.id, "price", e.target.value)} />
                    <div style={{ fontSize: "12px", color: "#666" }}>$ {formatPriceARS(Number(product.price))}</div>
                  </td>
                  <td>
                    <input type="number" value={product.stock} onChange={(e) => handleChange(product.id, "stock", e.target.value)} />
                  </td>
                  <td>
                    <button onClick={() => handleUpdate(product)}>Guardar</button>
                    <button onClick={() => handleDeleteProduct(product.id)} style={{ backgroundColor: "#d33", marginLeft: "5px" }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "offers" && !loading && !error && (
        <div>
          <div className="admin-form">
            <h3>Nueva Oferta</h3>
            <div className="admin-form-grid">
              <select value={newOffer.product_id} onChange={(e) => setNewOffer({ ...newOffer, product_id: e.target.value })}>
                <option value="">Seleccionar producto</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} (${formatPriceARS(p.price)})</option>)}
              </select>
              <input type="number" placeholder="% Descuento" value={newOffer.discount_percent} onChange={(e) => setNewOffer({ ...newOffer, discount_percent: e.target.value })} />
              <input type="number" placeholder="Precio oferta" value={newOffer.promo_price} onChange={(e) => setNewOffer({ ...newOffer, promo_price: e.target.value })} />
              <input type="date" value={newOffer.start_date} onChange={(e) => setNewOffer({ ...newOffer, start_date: e.target.value })} />
              <input type="date" value={newOffer.end_date} onChange={(e) => setNewOffer({ ...newOffer, end_date: e.target.value })} />
              <button onClick={handleCreateOffer}>Crear Oferta</button>
            </div>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Descuento</th>
                  <th>Precio Oferta</th>
                  <th>Activo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.id}>
                    <td>{offer.product_name}</td>
                    <td>{offer.discount_percent}%</td>
                    <td>${formatPriceARS(offer.promo_price)}</td>
                    <td>{offer.active ? "Sí" : "No"}</td>
                    <td>
                      <button onClick={() => handleToggleOffer(offer)}>{offer.active ? "Desactivar" : "Activar"}</button>
                      <button onClick={() => handleDeleteOffer(offer.id)} style={{ backgroundColor: "#666" }}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "combos" && !loading && !error && (
        <div>
          <div className="admin-form">
            <h3>Nuevo Combo</h3>
            <div className="admin-form-grid">
              <input type="text" placeholder="Nombre del combo" value={newCombo.name} onChange={(e) => setNewCombo({ ...newCombo, name: e.target.value })} />
              <input type="number" placeholder="Precio del combo" value={newCombo.price} onChange={(e) => setNewCombo({ ...newCombo, price: e.target.value })} />
              <input type="date" value={newCombo.start_date} onChange={(e) => setNewCombo({ ...newCombo, start_date: e.target.value })} />
              <input type="date" value={newCombo.end_date} onChange={(e) => setNewCombo({ ...newCombo, end_date: e.target.value })} />
            </div>
            <div style={{ marginTop: "15px" }}>
              <h4>Productos del combo</h4>
              {newCombo.items.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <select value={item.product_id} onChange={(e) => {
                    const items = [...newCombo.items];
                    items[idx].product_id = e.target.value;
                    setNewCombo({ ...newCombo, items });
                  }}>
                    <option value="">Seleccionar</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" placeholder="Cantidad" value={item.quantity} onChange={(e) => {
                    const items = [...newCombo.items];
                    items[idx].quantity = Number(e.target.value);
                    setNewCombo({ ...newCombo, items });
                  }} style={{ width: "100px" }} />
                </div>
              ))}
              <button onClick={() => setNewCombo({ ...newCombo, items: [...newCombo.items, { product_id: "", quantity: 1 }] })}>Agregar producto</button>
              <button onClick={handleCreateCombo} style={{ marginLeft: "10px" }}>Crear Combo</button>
            </div>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Activo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {combos.map((combo) => (
                  <tr key={combo.id}>
                    <td>{combo.name}</td>
                    <td>${formatPriceARS(combo.price)}</td>
                    <td>{combo.active ? "Sí" : "No"}</td>
                    <td>
                      <button onClick={() => {}}>{combo.active ? "Desactivar" : "Activar"}</button>
                      <button onClick={() => deleteCombo(combo.id).then(fetchAll)} style={{ backgroundColor: "#666" }}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
