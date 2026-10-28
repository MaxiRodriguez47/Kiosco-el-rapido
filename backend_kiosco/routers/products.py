from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

import models, schemas
from database import get_db

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("/", response_model=List[schemas.Product])
@router.get("", response_model=List[schemas.Product])
def list_products(category: Optional[str] = Query(default=None), db: Session = Depends(get_db)):
    query = db.query(models.Product)
    if category and category.lower() != "todos":
        query = query.filter(models.Product.category == category.lower())
    products = query.all()
    return products


@router.get("/{product_id}", response_model=schemas.Product)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product


@router.put("/{product_id}", response_model=schemas.Product)
@router.patch("/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product_update: schemas.ProductBase, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    product.name = product_update.name.strip()
    product.category = product_update.category.lower()
    product.price = float(product_update.price)
    product.stock = int(product_update.stock)
    product.description = product_update.description
    product.image = product_update.image
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    try:
        from sqlalchemy import text
        db.execute(text("PRAGMA foreign_keys=OFF"))
        db.execute(text("DELETE FROM offers WHERE product_id = :pid"), {"pid": product_id})
        result = db.execute(text("DELETE FROM products WHERE id = :pid"), {"pid": product_id})
        db.commit()
        db.execute(text("PRAGMA foreign_keys=ON"))
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return {"message": "Producto eliminado"}
    except HTTPException:
        db.rollback()
        try:
            from sqlalchemy import text
            db.execute(text("PRAGMA foreign_keys=ON"))
        except:
            pass
        raise
    except Exception as e:
        db.rollback()
        try:
            from sqlalchemy import text
            db.execute(text("PRAGMA foreign_keys=ON"))
        except:
            pass
        raise HTTPException(status_code=400, detail=f"Error al eliminar el producto: {str(e)}")
