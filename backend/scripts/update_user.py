import sqlite3

conn = sqlite3.connect('backend/tradex.db')
c = conn.cursor()

# Delete any existing Anand
c.execute("DELETE FROM transactions WHERE user_id IN (SELECT id FROM users WHERE username='Anand')")
c.execute("DELETE FROM holdings WHERE user_id IN (SELECT id FROM users WHERE username='Anand')")
c.execute("DELETE FROM users WHERE username='Anand'")
conn.commit()

# Get chaitannya's id
c.execute("SELECT id, username, email FROM users WHERE email LIKE '%chaitannya%'")
print("Current users:", c.fetchall())

conn.close()