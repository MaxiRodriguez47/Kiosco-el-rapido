import sqlite3
conn = sqlite3.connect('kiosco.db')
cur = conn.cursor()
cur.execute('SELECT id,name FROM products ORDER BY id')
for r in cur.fetchall():
    print(f"{r[0]}|{r[1]}")
conn.close()
