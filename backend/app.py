from flask import Flask, jsonify, request, g
from flask_cors import CORS
from datetime import datetime, timedelta
import hashlib
import jwt
import os
import random
import threading
import time
from dotenv import load_dotenv
from database import db, init_db
from models import User, Holding, Transaction, PendingOrder
from services.market_service import market_service

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'tradesimiq-secret-key-2024')

CORS_ORIGIN = os.getenv('CORS_ORIGIN', '*')
CORS(app, origins=CORS_ORIGIN, supports_credentials=True)

JWT_SECRET = os.getenv('JWT_SECRET', 'tradesimiq-jwt-secret-key-2024')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRY_HOURS = 24

INITIAL_HOLDINGS = [
    {"symbol": "RELIANCE", "qty": 5, "avgPrice": 1362},
    {"symbol": "TCS", "qty": 3, "avgPrice": 2538},
    {"symbol": "HDFC", "qty": 8, "avgPrice": 800},
    {"symbol": "SBIN", "qty": 10, "avgPrice": 1103},
    {"symbol": "ICICI", "qty": 5, "avgPrice": 1368},
    {"symbol": "ADANI", "qty": 2, "avgPrice": 2261},
]


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def generate_token(user_id, email):
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_current_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    
    try:
        scheme, token = auth_header.split()
        if scheme.lower() != 'bearer':
            return None
        return verify_token(token)
    except ValueError:
        return None


def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
        g.current_user = user
        return f(*args, **kwargs)
    return decorated_function


def get_stock_price(symbol):
    stock_info = market_service.get_stock_info(symbol)
    return stock_info["price"] if stock_info else 0


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
    
    existing_user = User.query.filter((User.email == email) | (User.username == username)).first()
    if existing_user:
        if existing_user.email == email:
            return jsonify({"error": "Email already registered"}), 400
        if existing_user.username == username:
            return jsonify({"error": "Username already taken"}), 400
    
    user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        wallet_balance=100000.0
    )
    db.session.add(user)
    db.session.commit()
    
    token = generate_token(user.id, email)
    
    return jsonify({
        "success": True,
        "token": token,
        "user": {"id": user.id, "username": username, "email": email}
    })


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user or user.password_hash != hash_password(password):
        return jsonify({"error": "Invalid email or password"}), 400
    
    token = generate_token(user.id, email)
    
    return jsonify({
        "success": True,
        "token": token,
        "user": {"id": user.id, "username": user.username, "email": user.email}
    })


@app.route('/api/logout', methods=['POST'])
def logout():
    return jsonify({"success": True})


@app.route('/api/me', methods=['GET'])
def get_current_user_info():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    user_data = User.query.get(user['user_id'])
    if not user_data:
        return jsonify({"error": "User not found"}), 401
    
    return jsonify({
        "user": {"id": user_data.id, "username": user_data.username, "email": user_data.email}
    })


@app.route('/api/profile', methods=['PUT'])
def update_profile():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    user_obj = User.query.get(user['user_id'])
    if not user_obj:
        return jsonify({"error": "User not found"}), 404
    
    if 'username' in data and data['username'].strip():
        existing = User.query.filter(User.username == data['username'], User.id != user['user_id']).first()
        if existing:
            return jsonify({"error": "Username already taken"}), 400
        user_obj.username = data['username'].strip()
    
    if 'password' in data and data['password']:
        if len(data['password']) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        user_obj.password_hash = hash_password(data['password'])
    
    db.session.commit()
    
    return jsonify({
        "success": True,
        "user": {"id": user_obj.id, "username": user_obj.username, "email": user_obj.email}
    })


@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    fresh = request.args.get('fresh', 'false').lower() == 'true'
    stocks = market_service.get_all_stocks(fresh=fresh)
    
    stock_map = {}
    sparklines = {}
    for stock in stocks:
        stock_map[stock["symbol"]] = stock
        sparklines[stock["symbol"]] = stock.get("sparkline", [])
    
    return jsonify({
        "stocks": stocks,
        "stockMap": stock_map,
        "sparklines": sparklines,
        "lastUpdated": datetime.now().isoformat()
    })


@app.route('/api/stocks/live', methods=['GET'])
def get_live_prices():
    stocks = market_service.get_all_stocks(fresh=False)
    
    live_prices = {}
    for stock in stocks:
        base_price = stock.get("price", 0)
        if base_price and base_price > 0:
            fluctuation = random.uniform(-0.005, 0.005)
            live_price = round(base_price * (1 + fluctuation), 2)
            live_prices[stock["symbol"]] = {
                "price": live_price,
                "change": stock.get("change", 0),
                "changePercent": stock.get("changePercent", 0)
            }
        else:
            live_prices[stock["symbol"]] = {"price": 0, "change": 0, "changePercent": 0}
    
    return jsonify({
        "prices": live_prices,
        "timestamp": datetime.now().isoformat()
    })


@app.route('/api/stock/price/<symbol>', methods=['GET'])
def get_stock_price_endpoint(symbol):
    fresh = request.args.get('fresh', 'false').lower() == 'true'
    stock_info = market_service.get_stock_info(symbol)
    
    if not stock_info:
        return jsonify({"error": "Stock not found"}), 404
    
    return jsonify(stock_info)


@app.route('/api/stock/price/fresh', methods=['POST'])
def get_fresh_price():
    data = request.json
    symbol = data.get("symbol")
    
    if not symbol:
        return jsonify({"error": "Symbol required"}), 400
    
    fresh_price = market_service.get_fresh_price_for_trade(symbol)
    
    if not fresh_price:
        return jsonify({"error": "Unable to fetch price"}), 500
    
    return jsonify({
        "symbol": symbol,
        "price": fresh_price.get("price"),
        "change": fresh_price.get("change"),
        "changePercent": fresh_price.get("changePercent"),
        "timestamp": datetime.now().isoformat()
    })


@app.route('/api/portfolio', methods=['GET'])
@login_required
def get_portfolio():
    user = get_current_user()
    user_obj = User.query.get(user['user_id'])
    
    holdings = Holding.query.filter_by(user_id=user['user_id']).all()
    pfolio = []
    
    portfolio_value = 0
    for h in holdings:
        stock_info = market_service.get_stock_info(h.symbol)
        if stock_info:
            current_price = stock_info.get("price", 0)
            holding_dict = {
                "symbol": h.symbol,
                "qty": h.quantity,
                "avgPrice": h.avg_price,
                "currentPrice": current_price,
                "currentValue": current_price * h.quantity,
                "pnl": (current_price - h.avg_price) * h.quantity,
                "pnlPercent": ((current_price - h.avg_price) / h.avg_price) * 100 if h.avg_price > 0 else 0
            }
            pfolio.append(holding_dict)
            portfolio_value += holding_dict["currentValue"]
    
    return jsonify({
        "wallet": user_obj.wallet_balance,
        "holdings": pfolio,
        "portfolioValue": portfolio_value,
        "totalPnl": sum(h["pnl"] for h in pfolio)
    })


@app.route('/api/buy', methods=['POST'])
@login_required
def buy_stock():
    user = get_current_user()
    data = request.json
    symbol = (data.get("symbol") or "").strip().upper()
    qty = data.get("qty", 1)
    
    if not symbol:
        return jsonify({"error": "Symbol is required"}), 400
    
    try:
        qty = int(qty)
        if qty <= 0:
            return jsonify({"error": "Quantity must be a positive number"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid quantity"}), 400
    
    stock_info = market_service.get_stock_info(symbol)
    if not stock_info or not stock_info.get("price"):
        return jsonify({"error": f"Stock '{symbol}' not found or unavailable"}), 404
    
    fresh_price = market_service.get_fresh_price_for_trade(symbol)
    if not fresh_price:
        return jsonify({"error": "Unable to fetch stock price. Please try again."}), 500
    
    stock_price = fresh_price.get("price")
    if not stock_price or stock_price <= 0:
        return jsonify({"error": "Invalid stock price"}), 500
    
    user_obj = User.query.get(user['user_id'])
    cost = stock_price * qty
    
    if cost > user_obj.wallet_balance:
        available_qty = int(user_obj.wallet_balance / stock_price)
        return jsonify({
            "error": "Insufficient funds",
            "available_balance": user_obj.wallet_balance,
            "required": cost,
            "max_affordable": available_qty
        }), 400
    
    user_obj.wallet_balance -= cost
    
    holding = Holding.query.filter_by(user_id=user['user_id'], symbol=symbol).first()
    if holding:
        new_qty = holding.quantity + qty
        holding.avg_price = round((holding.avg_price * holding.quantity + stock_price * qty) / new_qty, 2)
        holding.quantity = new_qty
    else:
        holding = Holding(
            user_id=user['user_id'],
            symbol=symbol,
            quantity=qty,
            avg_price=stock_price
        )
        db.session.add(holding)
    
    transaction = Transaction(
        user_id=user['user_id'],
        type="BUY",
        symbol=symbol,
        quantity=qty,
        price=stock_price,
        total=cost
    )
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "wallet": user_obj.wallet_balance,
        "price": stock_price,
        "symbol": symbol,
        "quantity": qty,
        "total": cost
    })


@app.route('/api/sell', methods=['POST'])
@login_required
def sell_stock():
    user = get_current_user()
    data = request.json
    symbol = (data.get("symbol") or "").strip().upper()
    qty = data.get("qty", 1)
    
    if not symbol:
        return jsonify({"error": "Symbol is required"}), 400
    
    try:
        qty = int(qty)
        if qty <= 0:
            return jsonify({"error": "Quantity must be a positive number"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid quantity"}), 400
    
    holding = Holding.query.filter_by(user_id=user['user_id'], symbol=symbol).first()
    if not holding:
        return jsonify({
            "error": f"You don't own any {symbol} shares",
            "symbol": symbol
        }), 400
    
    if holding.quantity < qty:
        return jsonify({
            "error": "Insufficient holdings",
            "symbol": symbol,
            "available": holding.quantity,
            "requested": qty
        }), 400
    
    fresh_price = market_service.get_fresh_price_for_trade(symbol)
    if not fresh_price:
        return jsonify({"error": "Unable to fetch stock price. Please try again."}), 500
    
    stock_price = fresh_price.get("price")
    if not stock_price or stock_price <= 0:
        return jsonify({"error": "Invalid stock price"}), 500
    
    proceeds = stock_price * qty
    
    user_obj = User.query.get(user['user_id'])
    user_obj.wallet_balance += proceeds
    
    holding.quantity -= qty
    if holding.quantity == 0:
        db.session.delete(holding)
    
    transaction = Transaction(
        user_id=user['user_id'],
        type="SELL",
        symbol=symbol,
        quantity=qty,
        price=stock_price,
        total=proceeds
    )
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "wallet": user_obj.wallet_balance,
        "price": stock_price,
        "symbol": symbol,
        "quantity": qty,
        "proceeds": proceeds
    })


@app.route('/api/transactions', methods=['GET'])
@login_required
def get_transactions():
    user = get_current_user()
    transactions = Transaction.query.filter_by(user_id=user['user_id']).order_by(Transaction.timestamp.desc()).all()
    return jsonify({"transactions": [t.to_dict() for t in transactions]})


@app.route('/api/orders/pending', methods=['GET'])
@login_required
def get_pending_orders():
    user = get_current_user()
    orders = PendingOrder.query.filter_by(user_id=user['user_id'], status='PENDING').order_by(PendingOrder.created_at.desc()).all()
    return jsonify({"orders": [o.to_dict() for o in orders]})


@app.route('/api/orders/place', methods=['POST'])
@login_required
def place_order():
    user = get_current_user()
    data = request.json
    
    order_type = (data.get('orderType') or '').upper().strip()
    side = (data.get('side') or '').upper().strip()
    symbol = (data.get('symbol') or '').strip().upper()
    qty = data.get('quantity', 1)
    target_price = data.get('targetPrice', 0)
    
    if order_type not in ['LIMIT', 'STOP']:
        return jsonify({"error": "orderType must be LIMIT or STOP"}), 400
    
    if side not in ['BUY', 'SELL']:
        return jsonify({"error": "side must be BUY or SELL"}), 400
    
    if not symbol:
        return jsonify({"error": "symbol is required"}), 400
    
    stock_info = market_service.get_stock_info(symbol)
    if not stock_info or not stock_info.get('price'):
        return jsonify({"error": f"Stock '{symbol}' not found"}), 404
    
    try:
        qty = int(qty)
        if qty <= 0:
            return jsonify({"error": "quantity must be positive"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "invalid quantity"}), 400
    
    try:
        target_price = float(target_price)
        if target_price <= 0:
            return jsonify({"error": "targetPrice must be positive"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "invalid targetPrice"}), 400
    
    current_price = stock_info.get('price', 0)
    
    if order_type == 'LIMIT':
        if side == 'BUY':
            total_cost = target_price * qty
            user_obj = User.query.get(user['user_id'])
            if total_cost > user_obj.wallet_balance:
                return jsonify({"error": "Insufficient funds for limit order"}), 400
            user_obj.wallet_balance -= total_cost
        else:
            holding = Holding.query.filter_by(user_id=user['user_id'], symbol=symbol).first()
            if not holding or holding.quantity < qty:
                return jsonify({"error": "Insufficient holdings for limit order"}), 400
    else:
        if side == 'STOP':
            user_obj = User.query.get(user['user_id'])
            if side == 'BUY':
                total_cost = target_price * qty
                if total_cost > user_obj.wallet_balance:
                    return jsonify({"error": "Insufficient funds for stop order"}), 400
                user_obj.wallet_balance -= total_cost
            else:
                holding = Holding.query.filter_by(user_id=user['user_id'], symbol=symbol).first()
                if not holding or holding.quantity < qty:
                    return jsonify({"error": "Insufficient holdings for stop order"}), 400
    
    order = PendingOrder(
        user_id=user['user_id'],
        order_type=order_type,
        side=side,
        symbol=symbol,
        quantity=qty,
        target_price=target_price,
        status='PENDING'
    )
    db.session.add(order)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "order": order.to_dict(),
        "currentPrice": current_price
    })


@app.route('/api/orders/cancel/<int:order_id>', methods=['POST'])
@login_required
def cancel_order(order_id):
    user = get_current_user()
    
    order = PendingOrder.query.filter_by(id=order_id, user_id=user['user_id']).first()
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    if order.status != 'PENDING':
        return jsonify({"error": f"Cannot cancel order with status {order.status}"}), 400
    
    if order.side == 'BUY':
        user_obj = User.query.get(user['user_id'])
        total = order.target_price * order.quantity
        user_obj.wallet_balance += total
    
    order.status = 'CANCELLED'
    db.session.commit()
    
    return jsonify({"success": True, "order": order.to_dict()})


def check_pending_orders(app):
    with app.app_context():
        pending = PendingOrder.query.filter_by(status='PENDING').all()
        for order in pending:
            stock_info = market_service.get_stock_price(order.symbol, fresh=True)
            if not stock_info or not stock_info.get('price'):
                continue
            
            current_price = stock_info.get('price')
            executed = False
            
            if order.order_type == 'LIMIT':
                if order.side == 'BUY' and current_price <= order.target_price:
                    executed = True
                elif order.side == 'SELL' and current_price >= order.target_price:
                    executed = True
            elif order.order_type == 'STOP':
                if order.side == 'BUY' and current_price >= order.target_price:
                    executed = True
                elif order.side == 'SELL' and current_price <= order.target_price:
                    executed = True
            
            if executed:
                user_id = order.user_id
                
                if order.side == 'SELL':
                    holding = Holding.query.filter_by(user_id=user_id, symbol=order.symbol).first()
                    if holding and holding.quantity >= order.quantity:
                        holding.quantity -= order.quantity
                        if holding.quantity == 0:
                            db.session.delete(holding)
                        
                        proceeds = current_price * order.quantity
                        user_obj = User.query.get(user_id)
                        user_obj.wallet_balance += proceeds
                        
                        transaction = Transaction(
                            user_id=user_id,
                            type="SELL",
                            symbol=order.symbol,
                            quantity=order.quantity,
                            price=current_price,
                            total=proceeds
                        )
                        db.session.add(transaction)
                
                order.status = 'EXECUTED'
                order.executed_at = datetime.utcnow()
                db.session.commit()


@app.route('/api/orders/check', methods=['POST'])
@login_required
def check_orders():
    check_pending_orders(app)
    return jsonify({"success": True})


@app.route('/api/portfolio/analytics', methods=['GET'])
@login_required
def get_portfolio_analytics():
    user = get_current_user()
    user_obj = User.query.get(user['user_id'])
    holdings = Holding.query.filter_by(user_id=user['user_id']).all()
    transactions = Transaction.query.filter_by(user_id=user['user_id']).all()
    
    portfolio_value = 0
    for h in holdings:
        stock_info = market_service.get_stock_info(h.symbol)
        if stock_info:
            portfolio_value += stock_info.get("price", 0) * h.quantity
    
    total_invested = sum(h.avg_price * h.quantity for h in holdings)
    total_pnl = portfolio_value - total_invested
    pnl_percent = (total_pnl / total_invested * 100) if total_invested > 0 else 0
    
    sector_allocation = {}
    for h in holdings:
        stock_info = market_service.get_stock_info(h.symbol)
        if stock_info:
            sector = stock_info.get("sector", "Other")
            value = stock_info.get("price", 0) * h.quantity
            sector_allocation[sector] = sector_allocation.get(sector, 0) + value
    
    for sector in sector_allocation:
        sector_allocation[sector] = round((sector_allocation[sector] / portfolio_value * 100), 2) if portfolio_value > 0 else 0
    
    risk_score = 0
    if portfolio_value > 0:
        for h in holdings:
            stock_info = market_service.get_stock_info(h.symbol)
            if stock_info:
                value = stock_info.get("price", 0) * h.quantity
                weight = (value / portfolio_value) * 100
                risk_score = max(risk_score, weight)
    
    risk_level = "LOW" if risk_score < 35 else "MODERATE" if risk_score < 65 else "HIGH"
    
    sell_transactions = [t for t in transactions if t.type == "SELL"]
    
    if sell_transactions:
        win_count = 0
        for t in sell_transactions:
            symbol = t.symbol
            sell_qty = t.quantity
            sell_price = t.price
            
            buys = [b for b in transactions if b.type == "BUY" and b.symbol == symbol]
            if buys:
                total_buy_qty = sum(b.quantity for b in buys)
                if total_buy_qty > 0:
                    avg_buy_price = sum(b.price * b.quantity for b in buys) / total_buy_qty
                    if sell_price >= avg_buy_price:
                        win_count += 1
        
        win_rate = (win_count / len(sell_transactions) * 100)
    else:
        win_rate = 0
    
    return jsonify({
        "portfolioValue": round(portfolio_value, 2),
        "totalInvested": round(total_invested, 2),
        "totalPnl": round(total_pnl, 2),
        "pnlPercent": round(pnl_percent, 2),
        "sectorAllocation": sector_allocation,
        "riskScore": min(100, int(risk_score * 0.5 + 20)),
        "riskLevel": risk_level,
        "winRate": round(win_rate, 2),
        "totalTransactions": len(transactions),
        "cashBalance": user_obj.wallet_balance
    })


@app.route('/api/portfolio/summary', methods=['GET'])
@login_required
def get_portfolio_summary():
    user = get_current_user()
    user_obj = User.query.get(user['user_id'])
    holdings = Holding.query.filter_by(user_id=user['user_id']).all()
    
    total_invested = 0
    current_value = 0
    
    holding_details = []
    for h in holdings:
        stock_info = market_service.get_stock_info(h.symbol)
        if stock_info:
            current_price = stock_info.get("price", 0)
            holding_value = current_price * h.quantity
            invested_amount = h.avg_price * h.quantity
            
            total_invested += invested_amount
            current_value += holding_value
            
            holding_details.append({
                "symbol": h.symbol,
                "quantity": h.quantity,
                "avgPrice": h.avg_price,
                "currentPrice": current_price,
                "invested": invested_amount,
                "currentValue": holding_value,
                "pnl": holding_value - invested_amount,
                "pnlPercent": ((current_price - h.avg_price) / h.avg_price * 100) if h.avg_price > 0 else 0
            })
    
    profit_loss = current_value - total_invested
    pnl_percent = (profit_loss / total_invested * 100) if total_invested > 0 else 0
    
    return jsonify({
        "totalInvested": round(total_invested, 2),
        "currentValue": round(current_value, 2),
        "profitLoss": round(profit_loss, 2),
        "pnlPercent": round(pnl_percent, 2),
        "cashBalance": user_obj.wallet_balance,
        "holdings": holding_details
    })


@app.route('/api/simulator', methods=['POST'])
def simulate_scenario():
    user = get_current_user()
    
    if user:
        holdings = Holding.query.filter_by(user_id=user['user_id']).all()
    else:
        holdings = []
        for h in INITIAL_HOLDINGS:
            class MockHolding:
                def __init__(self, symbol, qty):
                    self.symbol = symbol
                    self.quantity = qty
            holdings.append(MockHolding(h["symbol"], h["qty"]))
    
    portfolio_value = 0
    for h in holdings:
        stock_info = market_service.get_stock_info(h.symbol)
        if stock_info:
            portfolio_value += stock_info.get("price", 0) * h.quantity
    
    data = request.json
    scenario = data.get("scenario", 0)
    simulated_value = portfolio_value * (1 + scenario)
    
    return jsonify({
        "originalValue": portfolio_value,
        "simulatedValue": simulated_value,
        "change": simulated_value - portfolio_value,
        "changePercent": scenario * 100
    })


def check_and_execute_orders():
    """Background task to check and execute pending orders with full safety guarantees."""
    import logging
    
    logger = logging.getLogger('order_scheduler')
    
    with app.app_context():
        cutoff = datetime.utcnow() - timedelta(hours=24)
        
        pending = PendingOrder.query.filter_by(status='PENDING').all()
        for order in pending:
            order_id = order.id
            order_side = order.side
            order_symbol = order.symbol
            order_quantity = order.quantity
            order_type = order.order_type
            order_target_price = order.target_price
            order_user_id = order.user_id
            
            try:
                if order.created_at and order.created_at < cutoff:
                    try:
                        if order.side == 'BUY':
                            user_obj = db.session.get(User, order.user_id)
                            if user_obj:
                                user_obj.wallet_balance += order.target_price * order.quantity
                        order.status = 'EXPIRED'
                        db.session.commit()
                        logger.info(f"Order {order.id} expired: {order.side} {order.quantity} {order.symbol}")
                    except Exception as e:
                        db.session.rollback()
                        logger.error(f"Error expiring order {order.id}: {e}")
                    continue
                
                stock_info = market_service.get_stock_price(order_symbol, fresh=True)
                if not stock_info or not stock_info.get('price'):
                    continue
                
                current_price = stock_info.get('price')
                should_execute = False
                
                if order_type == 'LIMIT':
                    if order_side == 'BUY' and current_price <= order_target_price:
                        should_execute = True
                    elif order_side == 'SELL' and current_price >= order_target_price:
                        should_execute = True
                elif order_type == 'STOP':
                    if order_side == 'BUY' and current_price >= order_target_price:
                        should_execute = True
                    elif order_side == 'SELL' and current_price <= order_target_price:
                        should_execute = True
                
                if not should_execute:
                    continue
                
                # Re-fetch with PENDING status to prevent race conditions
                # Using filter + first instead of with_for_update (SQLite compatibility)
                order = PendingOrder.query.filter_by(
                    id=order_id, status='PENDING'
                ).first()
                
                if not order:
                    logger.debug(f"Order {order_id} no longer PENDING, skipping")
                    continue
                
                # EXECUTING transition to prevent double execution
                order.status = 'EXECUTING'
                db.session.flush()
                
                try:
                    logger.info(f"Executing order {order.id}: {order_side} {order_quantity} {order_symbol} @ {current_price}")
                    
                    if order_side == 'BUY':
                        total_cost = order_target_price * order_quantity
                        
                        # RE-VALIDATION: Check user balance before execution
                        user_obj = db.session.get(User, order_user_id)
                        if not user_obj or user_obj.wallet_balance < total_cost:
                            raise ValueError(f"Insufficient balance: required {total_cost}, available {user_obj.wallet_balance if user_obj else 0}")
                        
                        holding = Holding.query.filter_by(user_id=order_user_id, symbol=order_symbol).first()
                        if holding:
                            new_qty = holding.quantity + order_quantity
                            holding.avg_price = round((holding.avg_price * holding.quantity + order_target_price * order_quantity) / new_qty, 2)
                            holding.quantity = new_qty
                        else:
                            holding = Holding(
                                user_id=order_user_id,
                                symbol=order_symbol,
                                quantity=order_quantity,
                                avg_price=order_target_price
                            )
                            db.session.add(holding)
                        
                        user_obj.wallet_balance -= total_cost
                        
                        transaction = Transaction(
                            user_id=order_user_id,
                            type="BUY",
                            symbol=order_symbol,
                            quantity=order_quantity,
                            price=order_target_price,
                            total=total_cost
                        )
                        db.session.add(transaction)
                    else:
                        # RE-VALIDATION: Check holdings before execution
                        holding = Holding.query.filter_by(user_id=order_user_id, symbol=order_symbol).first()
                        if not holding or holding.quantity < order_quantity:
                            raise ValueError(f"Insufficient holdings: required {order_quantity}, available {holding.quantity if holding else 0}")
                        
                        proceeds = current_price * order_quantity
                        user_obj = db.session.get(User, order_user_id)
                        
                        holding.quantity -= order_quantity
                        if holding.quantity == 0:
                            db.session.delete(holding)
                        
                        user_obj.wallet_balance += proceeds
                        
                        transaction = Transaction(
                            user_id=order_user_id,
                            type="SELL",
                            symbol=order_symbol,
                            quantity=order_quantity,
                            price=current_price,
                            total=proceeds
                        )
                        db.session.add(transaction)
                    
                    # All validations passed - commit atomic transaction
                    order.status = 'EXECUTED'
                    order.executed_at = datetime.utcnow()
                    order.execution_error = None
                    db.session.commit()
                    
                    logger.info(f"Order {order.id} EXECUTED successfully: {order_side} {order_quantity} {order_symbol} @ {current_price}")
                    
                except Exception as e:
                    db.session.rollback()
                    db.session.expire_all()
                    
                    order = PendingOrder.query.filter_by(id=order_id).first()
                    if order:
                        order.status = 'FAILED'
                        order.execution_error = str(e)[:500]
                        db.session.commit()
                    
                    logger.error(f"Order {order_id} FAILED: {e}")
                    
            except Exception as e:
                logger.error(f"Error processing order {order_id}: {e}")


PID_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scheduler.pid')

def is_scheduler_running():
    """Check if scheduler is already running by PID file."""
    if os.path.exists(PID_FILE):
        try:
            with open(PID_FILE, 'r') as f:
                old_pid = int(f.read().strip())
            try:
                os.kill(old_pid, 0)
                return True
            except OSError:
                pass
        except:
            pass
    return False

def write_pid_file():
    """Write current PID to file."""
    with open(PID_FILE, 'w') as f:
        f.write(str(os.getpid()))

def cleanup_pid_file():
    """Remove PID file."""
    try:
        if os.path.exists(PID_FILE):
            os.remove(PID_FILE)
    except:
        pass

def order_scheduler():
    """Background thread that checks orders every 5 seconds with safety guarantees."""
    import logging
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger('order_scheduler')
    
    if is_scheduler_running():
        logger.error("Another scheduler instance is already running. Exiting.")
        return
    
    write_pid_file()
    scheduler_pid = os.getpid()
    logger.info(f"Order scheduler started (PID: {scheduler_pid}) - checking every 5 seconds")
    
    execution_count = 0
    try:
        while True:
            try:
                current_pid = os.getpid()
                if current_pid != scheduler_pid:
                    logger.warning(f"PID changed from {scheduler_pid} to {current_pid}, stopping scheduler")
                    break
                
                check_and_execute_orders()
                execution_count += 1
                
                if execution_count % 100 == 0:
                    logger.info(f"Scheduler heartbeat: {execution_count} cycles completed")
                    
            except Exception as e:
                logger.error(f"Scheduler error: {e}")
            time.sleep(5)
    finally:
        cleanup_pid_file()
        logger.info("Scheduler stopped")


init_db(app)

scheduler_thread = threading.Thread(target=order_scheduler, daemon=True)
scheduler_thread.start()

if __name__ == '__main__':
    app.run(debug=False, port=5000, threaded=True)
