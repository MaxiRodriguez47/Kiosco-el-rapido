import sqlite3
import json

conn = sqlite3.connect('kiosco.db')
cur = conn.cursor()

# IDs de los productos a eliminar
ids_to_delete = [17, 18, 19, 20, 21, 22, 23, 24, 25]

# Desactivar foreign keys
cur.execute("PRAGMA foreign_keys=OFF")

# Eliminar ofertas relacionadas
for pid in ids_to_delete:
    cur.execute("DELETE FROM offers WHERE product_id = ?", (pid,))
    print(f"Eliminadas ofertas para producto {pid}")

# Limpiar combos que referencian estos productos
cur.execute("SELECT id, items_json FROM combos")
combos = cur.fetchall()
for combo_id, items_json in combos:
    try:
        items = json.loads(items_json)
        # Filtrar items que NO sean de los productos a eliminar
        new_items = [item for item in items if item.get('product_id') not in ids_to_delete]
        if len(new_items) != len(items):
            cur.execute("UPDATE combos SET items_json = ? WHERE id = ?", (json.dumps(new_items), combo_id))
            print(f"Actualizado combo {combo_id}")
    except Exception as e:
        print(f"Error al procesar combo {combo_id}: {e}")

# Eliminar productos
for pid in ids_to_delete:
    cur.execute("DELETE FROM products WHERE id = ?", (pid,))
    print(f"Eliminado producto {pid}")

conn.commit()
cur.execute("PRAGMA foreign_keys=ON")
conn.close()
print("Listo")
