from flask import Flask, jsonify, request, session
from flask_cors import CORS
from datetime import datetime
import json
import os
import hashlib

app = Flask(__name__)
app.secret_key = 'tradesimiq-secret-key-2024'
CORS(app, supports_credentials=True)

# Simple file-based user storage
USERS_FILE = 'users.json'

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

users_db = load_users()

STOCKS = [
    {"symbol": "RELIANCE", "name": "Reliance Industries", "sector": "Energy", "price": 2847.6, "change": 1.24},
    {"symbol": "TCS", "name": "Tata Consultancy", "sector": "IT", "price": 3912.4, "change": -0.87},
    {"symbol": "INFY", "name": "Infosys Ltd", "sector": "IT", "price": 1678.9, "change": 0.43},
    {"symbol": "HDFC", "name": "HDFC Bank", "sector": "Finance", "price": 1654.3, "change": 0.91},
    {"symbol": "ZOMATO", "name": "Zomato Ltd", "sector": "Consumer", "price": 214.7, "change": 3.12},
    {"symbol": "WIPRO", "name": "Wipro Ltd", "sector": "IT", "price": 467.2, "change": -1.53},
    {"symbol": "ICICI", "name": "ICICI Bank", "sector": "Finance", "price": 1089.4, "change": 0.72},
    {"symbol": "MARUTI", "name": "Maruti Suzuki", "sector": "Auto", "price": 9876.5, "change": -0.34},
    {"symbol": "PAYTM", "name": "One97 Communications", "sector": "Fintech", "price": 678.3, "change": 2.45},
    {"symbol": "NYKAA", "name": "FSN E-Commerce", "sector": "Consumer", "price": 187.4, "change": -2.11},
    {"symbol": "BAJFINANCE", "name": "Bajaj Finance", "sector": "Finance", "price": 7234.5, "change": 1.08},
    {"symbol": "ADANI", "name": "Adani Enterprises", "sector": "Conglomerate", "price": 2567.8, "change": -0.67},
]

INITIAL_HOLDINGS = [
    {"symbol": "RELIANCE", "qty": 5, "avgPrice": 2780},
    {"symbol": "TCS", "qty": 3, "avgPrice": 3950},
    {"symbol": "HDFC", "qty": 8, "avgPrice": 1620},
    {"symbol": "WIPRO", "qty": 4, "avgPrice": 480},
    {"symbol": "PAYTM", "qty": 2, "avgPrice": 650},
    {"symbol": "ADANI", "qty": 1, "avgPrice": 2600},
]

user_data = {
    "wallet": 100000,
    "holdings": INITIAL_HOLDINGS,
    "transactions": []
}

# ─── AUTH ROUTES ────────────────────────────────────────────────────────────────

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
    
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    
    global users_db
    users_db = load_users()
    
    if email in users_db:
        return jsonify({"error": "Email already registered"}), 400
    
    for user in users_db.values():
        if user.get('username') == username:
            return jsonify({"error": "Username already taken"}), 400
    
    user_id = str(len(users_db) + 1)
    users_db[email] = {
        "id": user_id,
        "username": username,
        "email": email,
        "password": hash_password(password),
        "created_at": datetime.now().isoformat()
    }
    save_users(users_db)
    
    session['user_id'] = user_id
    session['email'] = email
    
    return jsonify({
        "success": True,
        "user": {"id": user_id, "username": username, "email": email}
    })

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    global users_db
    users_db = load_users()
    
    user = users_db.get(email)
    if not user or user['password'] != hash_password(password):
        return jsonify({"error": "Invalid email or password"}), 400
    
    session['user_id'] = user['id']
    session['email'] = email
    
    return jsonify({
        "success": True,
        "user": {"id": user['id'], "username": user['username'], "email": user['email']}
    })

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"success": True})

@app.route('/api/me', methods=['GET'])
def get_current_user():
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    global users_db
    users_db = load_users()
    user = users_db.get(session['email'])
    
    if not user:
        session.clear()
        return jsonify({"error": "User not found"}), 401
    
    return jsonify({
        "user": {"id": user['id'], "username": user['username'], "email": user['email']}
    })

@app.route('/api/profile', methods=['PUT'])
def update_profile():
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.json
    global users_db
    users_db = load_users()
    
    user = users_db.get(session['email'])
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if 'username' in data and data['username'].strip():
        for u in users_db.values():
            if u.get('username') == data['username'] and u['email'] != session['email']:
                return jsonify({"error": "Username already taken"}), 400
        user['username'] = data['username'].strip()
    
    if 'password' in data and data['password']:
        if len(data['password']) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        user['password'] = hash_password(data['password'])
    
    users_db[session['email']] = user
    save_users(users_db)
    
    return jsonify({
        "success": True,
        "user": {"id": user['id'], "username": user['username'], "email": user['email']}
    })

def generate_sparkline(base_price):
    return [round(base_price * (0.92 + (i/30) * 0.16), 2) for i in range(30)]

@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    stock_map = {}
    sparklines = {}
    for stock in STOCKS:
        stock_map[stock["symbol"]] = stock
        sparklines[stock["symbol"]] = generate_sparkline(stock["price"])
    return jsonify({
        "stocks": STOCKS,
        "stockMap": stock_map,
        "sparklines": sparklines
    })

@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    portfolio_value = sum(
        user_data["holdings"].get(h["symbol"], {}).get("price", 0) * h.get("qty", 0)
        for h in user_data["holdings"]
    )
    for h in user_data["holdings"]:
        stock = next((s for s in STOCKS if s["symbol"] == h["symbol"]), None)
        if stock:
            h["currentPrice"] = stock["price"]
            h["currentValue"] = stock["price"] * h["qty"]
            h["pnl"] = (stock["price"] - h["avgPrice"]) * h["qty"]
            h["pnlPercent"] = ((stock["price"] - h["avgPrice"]) / h["avgPrice"]) * 100
    
    return jsonify({
        "wallet": user_data["wallet"],
        "holdings": user_data["holdings"],
        "portfolioValue": sum(h["currentValue"] for h in user_data["holdings"]),
        "totalPnl": sum(h["pnl"] for h in user_data["holdings"])
    })

@app.route('/api/buy', methods=['POST'])
def buy_stock():
    data = request.json
    symbol = data.get("symbol")
    qty = int(data.get("qty", 1))
    
    stock = next((s for s in STOCKS if s["symbol"] == symbol), None)
    if not stock:
        return jsonify({"error": "Stock not found"}), 400
    
    cost = stock["price"] * qty
    
    if cost > user_data["wallet"]:
        return jsonify({"error": "Insufficient funds"}), 400
    
    user_data["wallet"] -= cost
    
    existing = next((h for h in user_data["holdings"] if h["symbol"] == symbol), None)
    if existing:
        new_qty = existing["qty"] + qty
        existing["avgPrice"] = round((existing["avgPrice"] * existing["qty"] + stock["price"] * qty) / new_qty, 2)
        existing["qty"] = new_qty
    else:
        user_data["holdings"].append({
            "symbol": symbol,
            "qty": qty,
            "avgPrice": stock["price"]
        })
    
    user_data["transactions"].append({
        "type": "BUY",
        "symbol": symbol,
        "qty": qty,
        "price": stock["price"],
        "total": cost,
        "timestamp": datetime.now().isoformat()
    })
    
    return jsonify({"success": True, "wallet": user_data["wallet"]})

@app.route('/api/sell', methods=['POST'])
def sell_stock():
    data = request.json
    symbol = data.get("symbol")
    qty = int(data.get("qty", 1))
    
    existing = next((h for h in user_data["holdings"] if h["symbol"] == symbol), None)
    if not existing or existing["qty"] < qty:
        return jsonify({"error": "Insufficient holdings"}), 400
    
    stock = next((s for s in STOCKS if s["symbol"] == symbol), None)
    proceeds = stock["price"] * qty
    
    user_data["wallet"] += proceeds
    existing["qty"] -= qty
    
    if existing["qty"] == 0:
        user_data["holdings"] = [h for h in user_data["holdings"] if h["symbol"] != symbol]
    
    user_data["transactions"].append({
        "type": "SELL",
        "symbol": symbol,
        "qty": qty,
        "price": stock["price"],
        "total": proceeds,
        "timestamp": datetime.now().isoformat()
    })
    
    return jsonify({"success": True, "wallet": user_data["wallet"]})

@app.route('/api/portfolio/analytics', methods=['GET'])
def get_portfolio_analytics():
    portfolio_value = sum(
        next((s["price"] for s in STOCKS if s["symbol"] == h["symbol"]), 0) * h.get("qty", 0)
        for h in user_data["holdings"]
    )
    
    total_invested = sum(h.get("avgPrice", 0) * h.get("qty", 0) for h in user_data["holdings"])
    total_pnl = portfolio_value - total_invested
    pnl_percent = (total_pnl / total_invested * 100) if total_invested > 0 else 0
    
    sector_allocation = {}
    for h in user_data["holdings"]:
        stock = next((s for s in STOCKS if s["symbol"] == h["symbol"]), None)
        if stock:
            sector = stock.get("sector", "Other")
            value = stock["price"] * h["qty"]
            sector_allocation[sector] = sector_allocation.get(sector, 0) + value
    
    for sector in sector_allocation:
        sector_allocation[sector] = round((sector_allocation[sector] / portfolio_value * 100), 2) if portfolio_value > 0 else 0
    
    risk_score = 0
    if portfolio_value > 0:
        for h in user_data["holdings"]:
            stock = next((s for s in STOCKS if s["symbol"] == h["symbol"]), None)
            if stock:
                value = stock["price"] * h["qty"]
                weight = (value / portfolio_value) * 100
                risk_score = max(risk_score, weight)
    
    risk_level = "LOW" if risk_score < 35 else "MODERATE" if risk_score < 65 else "HIGH"
    
    win_count = sum(1 for t in user_data["transactions"] if t["type"] == "SELL" and t.get("price", 0) > next((h["avgPrice"] for h in user_data["holdings"] if h["symbol"] == t["symbol"]), 0))
    total_sells = sum(1 for t in user_data["transactions"] if t["type"] == "SELL")
    win_rate = (win_count / total_sells * 100) if total_sells > 0 else 0
    
    return jsonify({
        "portfolioValue": round(portfolio_value, 2),
        "totalInvested": round(total_invested, 2),
        "totalPnl": round(total_pnl, 2),
        "pnlPercent": round(pnl_percent, 2),
        "sectorAllocation": sector_allocation,
        "riskScore": min(100, int(risk_score * 0.5 + 20)),
        "riskLevel": risk_level,
        "winRate": round(win_rate, 2),
        "totalTransactions": len(user_data["transactions"]),
        "cashBalance": user_data["wallet"]
    })

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    return jsonify({"transactions": user_data["transactions"]})

@app.route('/api/simulator', methods=['POST'])
def simulate_scenario():
    data = request.json
    scenario = data.get("scenario", 0)
    
    portfolio_value = sum(
        next((s["price"] for s in STOCKS if s["symbol"] == h["symbol"]), 0) * h["qty"]
        for h in user_data["holdings"]
    )
    
    simulated_value = portfolio_value * (1 + scenario)
    
    return jsonify({
        "originalValue": portfolio_value,
        "simulatedValue": simulated_value,
        "change": simulated_value - portfolio_value,
        "changePercent": scenario * 100
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)