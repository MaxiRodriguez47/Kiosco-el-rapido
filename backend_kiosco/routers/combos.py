from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import json

import models, schemas
from database import get_db

router = APIRouter(prefix="/api/combos", tags=["combos"])


@router.get("/", response_model=List[dict])
@router.get("", response_model=List[dict])
def list_combos(db: Session = Depends(get_db)):
    combos = db.query(models.Combo).all()
    now = datetime.utcnow()
    result = []
    for combo in combos:
        if not combo.active:
            continue
        if combo.start_date and combo.start_date > now:
            continue
        if combo.end_date and combo.end_date < now:
            continue
        try:
            items = json.loads(combo.items_json)
        except Exception:
            items = []
        items_detail = []
        for item in items:
            product = db.query(models.Product).filter(models.Product.id == item.get("product_id")).first()
            if product:
                items_detail.append({
                    "product_id": product.id,
                    "name": product.name,
                    "quantity": item.get("quantity", 1),
                    "price": product.price,
                    "image": product.image,
                })
        result.append({
            "id": combo.id,
            "name": combo.name,
            "price": combo.price,
            "items": items_detail,
            "active": combo.active,
        })
    return result


@router.get("/all", response_model=List[dict])
def list_all_combos(db: Session = Depends(get_db)):
    combos = db.query(models.Combo).all()
    result = []
    for combo in combos:
        try:
            items = json.loads(combo.items_json)
        except Exception:
            items = []
        result.append({
            "id": combo.id,
            "name": combo.name,
            "price": combo.price,
            "items": items,
            "active": combo.active,
            "start_date": combo.start_date.isoformat() if combo.start_date else None,
            "end_date": combo.end_date.isoformat() if combo.end_date else None,
        })
    return result


@router.post("/", response_model=dict)
@router.post("", response_model=dict)
def create_combo(combo: schemas.ComboCreate, db: Session = Depends(get_db)):
    items_list = [{"product_id": item.product_id, "quantity": item.quantity} for item in combo.items]
    db_combo = models.Combo(
        name=combo.name,
        price=combo.price,
        items_json=json.dumps(items_list),
        active=combo.active,
        start_date=datetime.fromisoformat(combo.start_date) if combo.start_date else None,
        end_date=datetime.fromisoformat(combo.end_date) if combo.end_date else None,
    )
    db.add(db_combo)
    db.commit()
    db.refresh(db_combo)
    return {"id": db_combo.id, "message": "Combo creado"}


@router.put("/{combo_id}", response_model=dict)
@router.patch("/{combo_id}", response_model=dict)
def update_combo(combo_id: int, combo: schemas.ComboCreate, db: Session = Depends(get_db)):
    db_combo = db.query(models.Combo).filter(models.Combo.id == combo_id).first()
    if not db_combo:
        raise HTTPException(status_code=404, detail="Combo no encontrado")
    items_list = [{"product_id": item.product_id, "quantity": item.quantity} for item in combo.items]
    db_combo.name = combo.name
    db_combo.price = combo.price
    db_combo.items_json = json.dumps(items_list)
    db_combo.active = combo.active
    db_combo.start_date = datetime.fromisoformat(combo.start_date) if combo.start_date else None
    db_combo.end_date = datetime.fromisoformat(combo.end_date) if combo.end_date else None
    db.commit()
    db.refresh(db_combo)
    return {"id": db_combo.id, "message": "Combo actualizado"}


@router.delete("/{combo_id}")
def delete_combo(combo_id: int, db: Session = Depends(get_db)):
    db_combo = db.query(models.Combo).filter(models.Combo.id == combo_id).first()
    if not db_combo:
        raise HTTPException(status_code=404, detail="Combo no encontrado")
    db.delete(db_combo)
    db.commit()
    return {"message": "Combo eliminado"}
