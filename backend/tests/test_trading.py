import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, generate_token, hash_password
from database import db
from models import User, Holding, Transaction

def test_trading():
    app.app_context().push()
    
    print("=== Test 1: Create Test User ===")
    User.query.delete()
    Transaction.query.delete()
    Holding.query.delete()
    db.session.commit()
    
    user = User(
        username="testuser",
        email="test@example.com",
        password_hash=hash_password("password123"),
        wallet_balance=100000.0
    )
    db.session.add(user)
    db.session.commit()
    
    for h in [
        {"symbol": "RELIANCE", "qty": 5, "avgPrice": 1362},
        {"symbol": "TCS", "qty": 3, "avgPrice": 2538},
    ]:
        holding = Holding(user_id=user.id, symbol=h["symbol"], quantity=h["qty"], avg_price=h["avgPrice"])
        db.session.add(holding)
    db.session.commit()
    
    print(f"Created user: {user.username}, wallet: ₹{user.wallet_balance}")
    
    print("\n=== Test 2: Buy Stock (ICICI) ===")
    token = generate_token(user.id, user.email)
    headers = {"Authorization": f"Bearer {token}"}
    
    with app.test_client() as client:
        resp = client.post("/api/buy", 
            json={"symbol": "ICICI", "qty": 5},
            headers=headers
        )
        result = resp.get_json()
        print(f"BUY response: {resp.status_code}")
        print(f"Result: {result}")
        
        db.session.expire_all()
        user = User.query.filter_by(email="test@example.com").first()
        print(f"Balance after BUY: ₹{user.wallet_balance}")
        
        holdings = Holding.query.filter_by(user_id=user.id).all()
        print(f"Holdings: {[(h.symbol, h.quantity, h.avg_price) for h in holdings]}")
        
        txs = Transaction.query.filter_by(user_id=user.id).all()
        print(f"Transactions so far: {len(txs)}")
        for t in txs:
            print(f"  {t.type} {t.symbol} x{t.quantity} @ ₹{t.price} = ₹{t.total}")
    
    print("\n=== Test 3: Sell Stock (RELIANCE) ===")
    with app.test_client() as client:
        resp = client.post("/api/sell",
            json={"symbol": "RELIANCE", "qty": 2},
            headers=headers
        )
        result = resp.get_json()
        print(f"SELL response: {resp.status_code}")
        print(f"Result: {result}")
        
        db.session.expire_all()
        user = User.query.filter_by(email="test@example.com").first()
        print(f"Balance after SELL: ₹{user.wallet_balance}")
        
        holdings = Holding.query.filter_by(user_id=user.id).all()
        print(f"Holdings: {[(h.symbol, h.quantity) for h in holdings]}")
    
    print("\n=== Test 4: Get Transactions ===")
    with app.test_client() as client:
        resp = client.get("/api/transactions", headers=headers)
        result = resp.get_json()
        print(f"Total transactions: {len(result.get('transactions', []))}")
        for t in result.get('transactions', []):
            print(f"  {t['type']} {t['symbol']} x{t['qty']} @ ₹{t['price']} = ₹{t['total']}")
    
    print("\n=== Test 5: Portfolio ===")
    with app.test_client() as client:
        resp = client.get("/api/portfolio", headers=headers)
        result = resp.get_json()
        print(f"Wallet: ₹{result.get('wallet')}")
        print(f"Holdings:")
        for h in result.get('holdings', []):
            print(f"  {h['symbol']}: {h['qty']} shares, current: ₹{h['currentPrice']}, P/L: ₹{h['pnl']}")
    
    print("\n=== ALL TRADING TESTS COMPLETED ===")

if __name__ == "__main__":
    test_trading()