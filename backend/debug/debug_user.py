import sqlite3

conn = sqlite3.connect('backend/tradex.db')
c = conn.cursor()

c.execute('SELECT id, username, email FROM users')
print("Users:")
for row in c.fetchall():
    print(f"  ID={row[0]}: {row[1]} ({row[2]})")

c.execute('SELECT id, user_id, type, symbol, price FROM transactions WHERE symbol="PAYTM"')
print("\nPAYTM transactions:")
for row in c.fetchall():
    print(f"  user_id={row[1]}, {row[2]} x{row[3]} @ {row[4]}")

conn.close()