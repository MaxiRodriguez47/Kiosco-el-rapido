from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json

import models
from database import engine, SessionLocal
from routers import products, orders, offers, combos

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kiosco El Rápido API", description="API para TP Parte 2", version="1.0.0")

# CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(orders.router)
app.include_router(offers.router)
app.include_router(combos.router)


@app.get("/")
def root():
    return {"message": "Kiosco El Rápido API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


# Seed data
def seed_data():
    db = SessionLocal()
    try:
        seed_products = [
            {"name": "Papas Lay's Clásicas 85 g", "category": "snacks", "price": 4200.0, "stock": 20, "description": "Papas Lay's Clásicas 85 g", "image": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400"},
            {"name": "Doritos Queso 200 g", "category": "snacks", "price": 9500.0, "stock": 15, "description": "Doritos Queso 200 g", "image": "https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400"},
            {"name": "Maní Japonés DIA 65 g", "category": "snacks", "price": 1950.0, "stock": 25, "description": "Maní Japonés DIA 65 g", "image": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400"},
            {"name": "3D Mega Queso 43 g", "category": "snacks", "price": 2500.0, "stock": 20, "description": "3D Mega Queso 43 g", "image": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400"},
            {"name": "Alfajor Guaymallén 38 g", "category": "golosinas", "price": 603.0, "stock": 40, "description": "Alfajor Guaymallén 38 g", "image": "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400"},
            {"name": "Alfajor Milka Mousse 42 g", "category": "golosinas", "price": 1510.0, "stock": 30, "description": "Alfajor Milka Mousse 42 g", "image": "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400"},

        ]
        for p in seed_products:
            exists = db.query(models.Product).filter(models.Product.name == p["name"]).first()
            if not exists:
                db.add(models.Product(**p))
        db.commit()

        # Seed offers
        if db.query(models.Offer).count() == 0:
            def get_pid(name):
                prod = db.query(models.Product).filter(models.Product.name == name).first()
                return prod.id if prod else None

            offers_data = [
                {"product_name": "Papas Lay's Clásicas 85 g", "discount_percent": 20, "promo_price": 3360},
                {"product_name": "Doritos Queso 200 g", "discount_percent": 15, "promo_price": 8075},
                {"product_name": "Alfajor Milka Mousse 42 g", "discount_percent": 20, "promo_price": 1208},
                {"product_name": "Kinder Bueno 43 g", "discount_percent": 10, "promo_price": 2835},
                {"product_name": "Coca-Cola Original 220 ml", "discount_percent": 20, "promo_price": 880},
                {"product_name": "Sprite Lima-Limón 600 ml", "discount_percent": 25, "promo_price": 1950},
            ]
            for od in offers_data:
                pid = get_pid(od["product_name"])
                if pid:
                    db.add(models.Offer(product_id=pid, discount_percent=od["discount_percent"], promo_price=od["promo_price"], active=True))

        # Seed combos
        if db.query(models.Combo).count() == 0:
            def get_pid(name):
                prod = db.query(models.Product).filter(models.Product.name == name).first()
                return prod.id if prod else None
            combo1 = [{"product_id": get_pid("Alfajor Guaymallén 38 g"), "quantity": 2}]
            combo2 = [{"product_id": get_pid("Papas Lay's Clásicas 85 g"), "quantity": 1}, {"product_id": get_pid("Coca-Cola Original 220 ml"), "quantity": 1}]
            combo3 = [{"product_id": get_pid("Alfajor Milka Mousse 42 g"), "quantity": 2}]
            combo4 = [{"product_id": get_pid("Sprite Lima-Limón 600 ml"), "quantity": 2}]
            if all(c[0]["product_id"] for c in [combo1]):
                db.add(models.Combo(name="Combo Merienda", price=1000.0, items_json=json.dumps(combo1), active=True))
            if all(x["product_id"] for x in combo2):
                db.add(models.Combo(name="Combo Snack", price=4500.0, items_json=json.dumps(combo2), active=True))
            if all(c[0]["product_id"] for c in [combo3]):
                db.add(models.Combo(name="Combo Dulce", price=2500.0, items_json=json.dumps(combo3), active=True))
            if all(c[0]["product_id"] for c in [combo4]):
                db.add(models.Combo(name="Combo Bebidas", price=4500.0, items_json=json.dumps(combo4), active=True))
        db.commit()
    finally:
        db.close()


seed_data()
