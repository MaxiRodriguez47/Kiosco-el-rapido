
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-content">
          <h1>Bienvenidos a Kiosco El Rápido 🏪</h1>
          <p>Todo lo que necesitás, rápido y cerca de vos. Bebidas, snacks, golosinas y más.</p>
          <Link to="/products" className="home-cta">
            Ver todos los productos
          </Link>
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-section-title">Comprá por categoría</h2>
        <div className="home-categories-grid">
          <Link to="/products?category=bebidas" className="home-category-card">
            <span className="home-category-emoji">🥤</span>
            <span className="home-category-name">Bebidas</span>
          </Link>
          <Link to="/products?category=snacks" className="home-category-card">
            <span className="home-category-emoji">🍟</span>
            <span className="home-category-name">Snacks</span>
          </Link>
          <Link to="/products?category=golosinas" className="home-category-card">
            <span className="home-category-emoji">🍬</span>
            <span className="home-category-name">Golosinas</span>
          </Link>
          <Link to="/products?category=varios" className="home-category-card">
            <span className="home-category-emoji">🧻</span>
            <span className="home-category-name">Varios</span>
          </Link>
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-section-title">¿Por qué elegirnos?</h2>
        <div className="home-benefits-grid">
          <div className="home-benefit-card">
            <span className="home-benefit-icon">⚡</span>
            <h3>Compra rápida</h3>
            <p>Agregá al carrito y finalizá tu pedido en segundos</p>
          </div>
          <div className="home-benefit-card">
            <span className="home-benefit-icon">💸</span>
            <h3>Precios accesibles</h3>
            <p>Los mejores precios para tu compra diaria</p>
          </div>
          <div className="home-benefit-card">
            <span className="home-benefit-icon">✅</span>
            <h3>Stock actualizado</h3>
            <p>Siempre sabés qué productos tenemos disponibles</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
