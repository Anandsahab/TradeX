"""Test script to verify production-safe order execution"""
import sys
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, script_dir)
os.chdir(script_dir)

import time
from app import app, check_and_execute_orders, db
from models import User, Holding, PendingOrder, Transaction
from services.market_service import market_service

def fresh_query(model, order_id):
    """Fresh query bypassing session cache"""
    db.session.expire_all()
    return model.query.filter_by(id=order_id).first()

def test_production_safety():
    with app.app_context():
        user = User.query.filter_by(email="test_safety@example.com").first()
        if not user:
            print("Creating test user...")
            from werkzeug.security import generate_password_hash
            user = User(
                username="test_safety",
                email="test_safety@example.com",
                password_hash=generate_password_hash("test123"),
                wallet_balance=100000
            )
            db.session.add(user)
            db.session.commit()
            print(f"Created user")
        else:
            user.wallet_balance = 100000
            db.session.commit()
            print(f"Using existing user with 100000 balance")
        
        # Clean all test data
        PendingOrder.query.filter_by(user_id=user.id).delete()
        Holding.query.filter_by(user_id=user.id).delete()
        Transaction.query.filter_by(user_id=user.id).delete()
        db.session.commit()
        
        stock_info = market_service.get_stock_price("RELIANCE", fresh=True)
        current_price = stock_info['price']
        print(f"RELIANCE current price: {current_price}")
        
        print("\n" + "=" * 60)
        print("TEST 1: Double Execution Prevention")
        print("=" * 60)
        print("Creating order with status EXECUTING to verify skip...")
        
        order = PendingOrder(
            user_id=user.id,
            order_type='LIMIT',
            side='BUY',
            symbol='RELIANCE',
            quantity=1,
            target_price=current_price,
            status='EXECUTING'
        )
        db.session.add(order)
        db.session.commit()
        order_id = order.id
        
        check_and_execute_orders()
        
        order = fresh_query(PendingOrder, order_id)
        print(f"Order status after scheduler run: {order.status}")
        print(f"Expected: EXECUTING (not modified)")
        assert order.status == 'EXECUTING', "Order should remain EXECUTING"
        print("PASS: Double execution prevented")
        
        db.session.delete(order)
        db.session.commit()
        
        print("\n" + "=" * 60)
        print("TEST 2: Insufficient Balance Handling")
        print("=" * 60)
        user = fresh_query(User, user.id)
        user.wallet_balance = 10
        db.session.commit()
        print(f"User balance set to 10")
        
        order = PendingOrder(
            user_id=user.id,
            order_type='LIMIT',
            side='BUY',
            symbol='RELIANCE',
            quantity=100,
            target_price=current_price,
            status='PENDING'
        )
        db.session.add(order)
        db.session.commit()
        order_id = order.id
        print(f"Order: BUY 100 @ {current_price} = total {100 * current_price}")
        
        check_and_execute_orders()
        
        order = fresh_query(PendingOrder, order_id)
        print(f"Order status: {order.status}")
        print(f"Error message: {order.execution_error}")
        assert order.status == 'FAILED', f"Order should be FAILED, got {order.status}"
        assert 'balance' in order.execution_error.lower(), "Error should mention balance"
        print("PASS: Insufficient balance handled correctly")
        
        db.session.delete(order)
        db.session.commit()
        
        print("\n" + "=" * 60)
        print("TEST 3: Insufficient Holdings Handling")
        print("=" * 60)
        user = fresh_query(User, user.id)
        user.wallet_balance = 1000000
        db.session.commit()
        print(f"User balance restored to 1000000 (no holdings)")
        
        order = PendingOrder(
            user_id=user.id,
            order_type='LIMIT',
            side='SELL',
            symbol='RELIANCE',
            quantity=100,
            target_price=current_price,
            status='PENDING'
        )
        db.session.add(order)
        db.session.commit()
        order_id = order.id
        print(f"Order: SELL 100 @ {current_price} (no holdings)")
        
        check_and_execute_orders()
        
        order = fresh_query(PendingOrder, order_id)
        print(f"Order status: {order.status}")
        print(f"Error message: {order.execution_error}")
        assert order.status == 'FAILED', f"Order should be FAILED, got {order.status}"
        assert 'holdings' in order.execution_error.lower(), "Error should mention holdings"
        print("PASS: Insufficient holdings handled correctly")
        
        db.session.delete(order)
        db.session.commit()
        
        print("\n" + "=" * 60)
        print("TEST 4: Successful Execution")
        print("=" * 60)
        
        user = fresh_query(User, user.id)
        user.wallet_balance = 100000
        db.session.commit()
        print(f"User balance reset to 100000")
        
        order = PendingOrder(
            user_id=user.id,
            order_type='LIMIT',
            side='BUY',
            symbol='RELIANCE',
            quantity=1,
            target_price=current_price,
            status='PENDING'
        )
        db.session.add(order)
        db.session.commit()
        order_id = order.id
        
        check_and_execute_orders()
        
        order = fresh_query(PendingOrder, order_id)
        user = fresh_query(User, user.id)
        
        print(f"Order status: {order.status}")
        print(f"Wallet balance: {user.wallet_balance}")
        assert order.status == 'EXECUTED', f"Order should be EXECUTED, got {order.status}"
        print("PASS: Successful execution")
        
        holding = Holding.query.filter_by(user_id=user.id, symbol='RELIANCE').first()
        assert holding is not None, "Holding should exist"
        assert holding.quantity == 1, "Holding quantity should be 1"
        print("PASS: Holdings updated correctly")
        
        db.session.delete(order)
        db.session.commit()
        
        print("\n" + "=" * 60)
        print("TEST 5: SELL Execution")
        print("=" * 60)
        
        order = PendingOrder(
            user_id=user.id,
            order_type='LIMIT',
            side='SELL',
            symbol='RELIANCE',
            quantity=1,
            target_price=current_price,
            status='PENDING'
        )
        db.session.add(order)
        db.session.commit()
        order_id = order.id
        
        check_and_execute_orders()
        
        order = fresh_query(PendingOrder, order_id)
        user = fresh_query(User, user.id)
        holding = Holding.query.filter_by(user_id=user.id, symbol='RELIANCE').first()
        
        print(f"Order status: {order.status}")
        print(f"Wallet balance: {user.wallet_balance}")
        print(f"Holding: {holding}")
        assert order.status == 'EXECUTED', f"Order should be EXECUTED, got {order.status}"
        print("PASS: SELL execution")
        
        db.session.delete(order)
        db.session.commit()
        
        print("\n" + "=" * 60)
        print("FINAL STATE")
        print("=" * 60)
        user = fresh_query(User, user.id)
        holdings = Holding.query.filter_by(user_id=user.id).all()
        orders = PendingOrder.query.filter_by(user_id=user.id).all()
        
        print(f"Wallet balance: {user.wallet_balance}")
        print(f"Holdings: {[(h.symbol, h.quantity) for h in holdings]}")
        print(f"Orders: {[(o.order_type, o.side, o.status) for o in orders]}")
        
        print("\n" + "=" * 60)
        print("ALL TESTS PASSED!")
        print("=" * 60)

if __name__ == '__main__':
    init_db = __import__('database', fromlist=['init_db']).init_db
    init_db(app)
    test_production_safety()