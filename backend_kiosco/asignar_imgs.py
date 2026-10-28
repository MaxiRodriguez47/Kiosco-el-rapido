import sqlite3

conn = sqlite3.connect('kiosco.db')
cur = conn.cursor()

# Mapeo por ID de los productos que quedan
mapeo = {
    1: '/images/coca-cola-500ml.webp',
    2: '/images/agua-mineral-eco-andes-x-500ml.jpg',
    3: '/images/lays-330gr.webp',
    4: '/images/alfajor-jorgito.jpg',
    5: '/images/beldent.jpg',
    6: '/images/galletitas-oreo.webp',
    7: '/images/gatorade.webp',
    8: '/images/mani-salado.webp',
    9: '/images/chocolate-milka.png',
    10: '/images/panuelos-descartables.png',
    11: '/images/papas-lays-85gr.webp',
    12: '/images/doritos.webp',
    13: '/images/mani-dia.jpg',
    14: '/images/SnaCk 3D.webp',
    15: '/images/alfajor-guaymallen.jpg',
    16: '/images/alfajor-milka.jpg',
}

for pid, img in mapeo.items():
    cur.execute('UPDATE products SET image = ? WHERE id = ?', (img, pid))
    print(f'Actualizado {pid} -> {img}')

conn.commit()
conn.close()
print('Listo')
