import sqlite3
conn = sqlite3.connect('kiosco.db')
cur = conn.cursor()
cur.execute("UPDATE products SET image='/images/beldent.jpg' WHERE id=5")
cur.execute("UPDATE products SET image='/images/gatorade.webp' WHERE id=7")
cur.execute("UPDATE products SET image='/images/doritos.webp' WHERE id=12")
conn.commit()
conn.close()
print('ok')
