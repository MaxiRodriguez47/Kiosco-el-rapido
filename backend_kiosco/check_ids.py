import sqlite3
conn = sqlite3.connect('kiosco.db')
cur = conn.cursor()
names = ['Kinder Bueno 43 g','Galletitas Oreo Mini 50 g','Coca-Cola Original 220 ml','Sprite Lima-Limón 600 ml','Agua Villavicencio 500 ml','Gatorade Manzana 750 ml','Pilas Energizer AA x2','Pañuelos Elite Disney x90','Servilletas Elite 100 unidades']
for n in names:
    cur.execute('SELECT id,name,image FROM products WHERE name=?', (n,))
    print(cur.fetchone())
conn.close()
