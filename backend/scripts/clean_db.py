import sqlite3

conn = sqlite3.connect('backend/tradex.db')
c = conn.cursor()

# Delete all transactions
c.execute("DELETE FROM transactions")
# Delete all holdings
c.execute("DELETE FROM holdings")
# Delete all users except we keep admin ones
c.execute("DELETE FROM users WHERE id > 5")
conn.commit()

c.execute("SELECT id, username, email FROM users")
print("Users:", c.fetchall())

c.execute("SELECT COUNT(*) FROM holdings")
print("Holdings:", c.fetchone())

c.execute("SELECT COUNT(*) FROM transactions")
print("Transactions:", c.fetchone())

conn.close()
print("\nDatabase cleaned! Register fresh as Anand.")