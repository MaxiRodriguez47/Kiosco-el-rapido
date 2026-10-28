from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime

import models, schemas
from database import get_db

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("/", response_model=dict)
@router.post("", response_model=dict)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    if not order.items:
        raise HTTPException(status_code=400, detail="El pedido debe contener al menos un item")

    total = 0.0
    items_out = []

    # Process items (products and combos)
    for item in order.items:
        if item.is_combo and item.combo_id:
            combo = db.query(models.Combo).filter(models.Combo.id == item.combo_id).first()
            if not combo:
                raise HTTPException(status_code=404, detail="Combo no encontrado")
            now = datetime.utcnow()
            if not combo.active:
                raise HTTPException(status_code=400, detail="Combo no disponible")
            if combo.start_date and combo.start_date > now:
                raise HTTPException(status_code=400, detail="Combo no disponible")
            if combo.end_date and combo.end_date < now:
                raise HTTPException(status_code=400, detail="Combo no disponible")
            try:
                combo_items = json.loads(combo.items_json)
            except Exception:
                combo_items = []
            for ci in combo_items:
                product = db.query(models.Product).filter(models.Product.id == ci.get("product_id")).first()
                if not product:
                    raise HTTPException(status_code=404, detail="Producto del combo no encontrado")
                needed = ci.get("quantity", 1) * item.quantity
                if product.stock < needed:
                    raise HTTPException(status_code=400, detail=f"Stock insuficiente para {product.name}")
            combo_price = float(combo.price) * item.quantity
            total += combo_price
            items_out.append({
                "type": "combo",
                "combo_id": combo.id,
                "quantity": item.quantity,
                "name": combo.name,
                "price": combo.price,
            })
        else:
            product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Producto con id {item.product_id} no encontrado")
            if product.stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Stock insuficiente para {product.name}")
            # Check if there's an active offer
            now = datetime.utcnow()
            offer = db.query(models.Offer).filter(
                models.Offer.product_id == product.id,
                models.Offer.active == True
            ).first()
            if offer:
                if offer.start_date and offer.start_date > now:
                    offer = None
                elif offer.end_date and offer.end_date < now:
                    offer = None
            item_price = float(offer.promo_price) if offer else float(product.price)
            total += item_price * item.quantity
            items_out.append({
                "product_id": product.id,
                "quantity": item.quantity,
                "name": product.name,
                "price": item_price,
                "original_price": product.price if offer else None,
            })

    # Discount stock
    for item in order.items:
        if item.is_combo and item.combo_id:
            combo = db.query(models.Combo).filter(models.Combo.id == item.combo_id).first()
            try:
                combo_items = json.loads(combo.items_json)
            except Exception:
                combo_items = []
            for ci in combo_items:
                product = db.query(models.Product).filter(models.Product.id == ci.get("product_id")).first()
                if product:
                    product.stock -= ci.get("quantity", 1) * item.quantity
                    db.add(product)
        else:
            product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
            if product:
                product.stock -= item.quantity
                db.add(product)

    # Create order
    db_order = models.Order(
        total=total,
        items_json=json.dumps(items_out, ensure_ascii=False),
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    return {
        "id": db_order.id,
        "created_at": db_order.created_at.isoformat() if db_order.created_at else datetime.utcnow().isoformat(),
        "total": db_order.total,
        "items": items_out,
    }


@router.get("/", response_model=List[dict])
@router.get("", response_model=List[dict])
def list_orders(db: Session = Depends(get_db)):
    orders = db.query(models.Order).order_by(models.Order.id.desc()).all()
    result = []
    for o in orders:
        try:
            items = json.loads(o.items_json)
        except Exception:
            items = []
        result.append({
            "id": o.id,
            "created_at": o.created_at.isoformat() if o.created_at else "",
            "total": o.total,
            "items": items,
        })
    return result
