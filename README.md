# TP4 y 5 - Kiosco El Rápido

## Parte 1 - Frontend (React + TypeScript + Vite)

### Instalar y correr
```bash
cd kiosco-el-rapido
npm install
npm run dev
```

La app corre en http://localhost:5173

## Parte 2 - Backend (FastAPI + SQLite)

### Instalar dependencias
```bash
cd backend
pip install -r requirements.txt
```

### Correr el backend
```bash
uvicorn main:app --reload
```

El backend corre en http://localhost:8000
Documentación Swagger: http://localhost:8000/docs

### Correr frontend apuntando a la API
El frontend ya está configurado para apuntar a `http://localhost:8000` por defecto. Si querés cambiarlo, podés crear un archivo `.env` en `kiosco-el-rapido/` con:
```env
VITE_API_URL=http://localhost:8000
```

## Funcionalidades
- Listado de productos con filtro por categoría (frontend + backend)
- Detalle de producto
- Carrito de compras
- Crear pedido desde el carrito (POST /api/orders) con descuento de stock
- Estados de carga y error visibles en UI
- CORS habilitado
