
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { totalItems } = useCart();
  const { toggleTheme } = useTheme();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    } else {
      navigate("/products");
    }
  };

  return (
    <header className="header-wrapper">
      <div className="header-top">
        <div className="header-left">
          <h2>🏪 Kiosco El Rápido</h2>
        </div>

        <form className="header-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>

        <div className="header-actions">
          {user ? (
            <div className="header-user">
              <span className="header-username">{user.username} ({user.role})</span>
              <button className="header-logout" onClick={logout}>Salir</button>
            </div>
          ) : (
            <NavLink to="/login" className="header-login">Ingresar</NavLink>
          )}
          <NavLink to="/cart" className="cart-link">
            🛒 <span className="cart-badge">{totalItems}</span>
          </NavLink>
        </div>
      </div>

      <nav className="header-categories">
        <NavLink to="/">Inicio</NavLink>
        <NavLink to="/products">Almacén</NavLink>
        <NavLink to="/products?category=bebidas">Bebidas</NavLink>
        <NavLink to="/products?category=snacks">Snacks</NavLink>
        <NavLink to="/products?category=golosinas">Golosinas</NavLink>
        <NavLink to="/products?category=varios">Varios</NavLink>
        <NavLink to="/offers">Ofertas</NavLink>
        {isAdmin && <NavLink to="/admin">Administración</NavLink>}
        <button
          className="theme-toggle-inline-categories"
          onClick={toggleTheme}
          aria-label="Cambiar tema"
          title="Cambiar tema"
        >
          🌙
        </button>
      </nav>
    </header>
  );
}

export default Header;
