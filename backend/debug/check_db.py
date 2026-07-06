import sqlite3

conn = sqlite3.connect('backend/tradex.db')
c = conn.cursor()

print("=== ALL BUY TRANSACTIONS ===")
c.execute("SELECT type, symbol, quantity, price, total FROM transactions WHERE type='BUY'")
for row in c.fetchall():
    print(f"  BUY {row[2]} {row[1]} @ {row[3]}")

print("\n=== ALL SELL TRANSACTIONS ===")
c.execute("SELECT type, symbol, quantity, price, total FROM transactions WHERE type='SELL'")
for row in c.fetchall():
    print(f"  SELL {row[2]} {row[1]} @ {row[3]}")

conn.close()