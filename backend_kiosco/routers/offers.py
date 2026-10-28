from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import json

import models, schemas
from database import get_db

router = APIRouter(prefix="/api/offers", tags=["offers"])


@router.get("/", response_model=List[dict])
@router.get("", response_model=List[dict])
def list_offers(db: Session = Depends(get_db)):
    offers = db.query(models.Offer).all()
    now = datetime.utcnow()
    result = []
    for offer in offers:
        if not offer.active:
            continue
        if offer.start_date and offer.start_date > now:
            continue
        if offer.end_date and offer.end_date < now:
            continue
        product = db.query(models.Product).filter(models.Product.id == offer.product_id).first()
        if not product:
            continue
        result.append({
            "id": offer.id,
            "product_id": offer.product_id,
            "product": {
                "id": product.id,
                "name": product.name,
                "category": product.category,
                "price": product.price,
                "stock": product.stock,
                "description": product.description,
                "image": product.image,
            },
            "discount_percent": offer.discount_percent,
            "promo_price": offer.promo_price,
            "original_price": product.price,
            "active": offer.active,
        })
    return result


@router.get("/all", response_model=List[dict])
def list_all_offers(db: Session = Depends(get_db)):
    offers = db.query(models.Offer).all()
    result = []
    for offer in offers:
        product = db.query(models.Product).filter(models.Product.id == offer.product_id).first()
        result.append({
            "id": offer.id,
            "product_id": offer.product_id,
            "product_name": product.name if product else None,
            "discount_percent": offer.discount_percent,
            "promo_price": offer.promo_price,
            "active": offer.active,
            "start_date": offer.start_date.isoformat() if offer.start_date else None,
            "end_date": offer.end_date.isoformat() if offer.end_date else None,
        })
    return result


@router.post("/", response_model=dict)
@router.post("", response_model=dict)
def create_offer(offer: schemas.OfferCreate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == offer.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db_offer = models.Offer(
        product_id=offer.product_id,
        discount_percent=offer.discount_percent,
        promo_price=offer.promo_price,
        active=offer.active,
        start_date=datetime.fromisoformat(offer.start_date) if offer.start_date else None,
        end_date=datetime.fromisoformat(offer.end_date) if offer.end_date else None,
    )
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    return {"id": db_offer.id, "message": "Oferta creada"}


@router.put("/{offer_id}", response_model=dict)
@router.patch("/{offer_id}", response_model=dict)
def update_offer(offer_id: int, offer: schemas.OfferCreate, db: Session = Depends(get_db)):
    db_offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
    if not db_offer:
        raise HTTPException(status_code=404, detail="Oferta no encontrada")
    db_offer.discount_percent = offer.discount_percent
    db_offer.promo_price = offer.promo_price
    db_offer.active = offer.active
    db_offer.start_date = datetime.fromisoformat(offer.start_date) if offer.start_date else None
    db_offer.end_date = datetime.fromisoformat(offer.end_date) if offer.end_date else None
    db.commit()
    db.refresh(db_offer)
    return {"id": db_offer.id, "message": "Oferta actualizada"}


@router.delete("/{offer_id}")
def delete_offer(offer_id: int, db: Session = Depends(get_db)):
    db_offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
    if not db_offer:
        raise HTTPException(status_code=404, detail="Oferta no encontrada")
    db.delete(db_offer)
    db.commit()
    return {"message": "Oferta eliminada"}
