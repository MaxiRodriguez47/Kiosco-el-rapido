from pydantic import BaseModel, Field, field_validator
from typing import List, Optional


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, description="Nombre obligatorio")
    category: str
    price: float = Field(..., gt=0, description="Precio debe ser mayor a 0")
    stock: int = Field(..., ge=0, description="Stock no puede ser negativo")
    description: Optional[str] = None
    image: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str):
        if not v or not v.strip():
            raise ValueError("name no puede estar vacío")
        return v.strip()


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True


class OfferBase(BaseModel):
    product_id: int
    discount_percent: float = Field(..., ge=0)
    promo_price: float = Field(..., ge=0)
    active: bool = True
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class OfferCreate(OfferBase):
    pass


class Offer(OfferBase):
    id: int

    class Config:
        from_attributes = True


class ComboItem(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class ComboBase(BaseModel):
    name: str
    price: float = Field(..., ge=0)
    items: List[ComboItem]
    active: bool = True
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class ComboCreate(ComboBase):
    pass


class Combo(ComboBase):
    id: int
    items_json: Optional[str] = None

    class Config:
        from_attributes = True


class OrderItem(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    is_combo: Optional[bool] = False
    combo_id: Optional[int] = None


class OrderCreate(BaseModel):
    items: List[OrderItem]


class OrderItemOut(BaseModel):
    product_id: int
    quantity: int
    name: Optional[str] = None
    price: Optional[float] = None


class Order(BaseModel):
    id: int
    created_at: str
    total: float
    items: List[OrderItemOut]

    class Config:
        from_attributes = True
