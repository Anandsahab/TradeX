import sqlite3

conn = sqlite3.connect('backend/tradex.db')
c = conn.cursor()

# Find the user
c.execute("SELECT id, username, email FROM users WHERE email = 'chaitanyaanand5881@gmail.com' OR username = 'Anand'")
users = c.fetchall()
print("Found users:", users)

for user in users:
    user_id = user[0]
    print(f"\nDeleting user {user[1]} (ID: {user_id})")

    c.execute("DELETE FROM transactions WHERE user_id = ?", (user_id,))
    c.execute("DELETE FROM holdings WHERE user_id = ?", (user_id,))
    c.execute("DELETE FROM users WHERE id = ?", (user_id,))

conn.commit()
print("\nDone!")

conn.close()