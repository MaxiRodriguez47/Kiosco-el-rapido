import sqlite3
c=sqlite3.connect('kiosco.db')
cur=c.cursor()
cur.execute('SELECT id,name,image FROM products LIMIT 3')
print(cur.fetchall())
c.close()
