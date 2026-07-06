import sqlite3

conn = sqlite3.connect('backend/tradex.db')
c = conn.cursor()

# Delete chaitanya's data (user_id = 1)
print("Deleting chaitanya's data...")
c.execute("DELETE FROM transactions WHERE user_id = 1")
print(f"  Deleted {c.rowcount} transactions")
c.execute("DELETE FROM holdings WHERE user_id = 1")
print(f"  Deleted {c.rowcount} holdings")
c.execute("DELETE FROM users WHERE id = 1")
print(f"  Deleted {c.rowcount} user")

conn.commit()
print("\nChaitanya's profile has been deleted. Re-register to start fresh!")
conn.close()