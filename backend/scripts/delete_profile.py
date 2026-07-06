import sqlite3

conn = sqlite3.connect('backend/tradex.db')
c = conn.cursor()

# Get user id
c.execute("SELECT id, username, email FROM users WHERE email = 'chaitanyaanand5881@gmail.com'")
user = c.fetchone()
if user:
    user_id = user[0]
    print(f"Deleting user: {user[1]} (ID: {user_id})")

    # Delete transactions
    c.execute("DELETE FROM transactions WHERE user_id = ?", (user_id,))
    print(f"  Deleted {c.rowcount} transactions")

    # Delete holdings
    c.execute("DELETE FROM holdings WHERE user_id = ?", (user_id,))
    print(f"  Deleted {c.rowcount} holdings")

    # Delete user
    c.execute("DELETE FROM users WHERE id = ?", (user_id,))
    print(f"  Deleted {c.rowcount} user")

    conn.commit()
    print("\nProfile deleted! Register fresh when ready.")
else:
    print("User not found")

conn.close()