from datetime import datetime
from database import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    wallet_balance = db.Column(db.Float, default=100000.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    holdings = db.relationship('Holding', backref='user', lazy=True, cascade='all, delete-orphan')
    transactions = db.relationship('Transaction', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'wallet_balance': self.wallet_balance,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Holding(db.Model):
    __tablename__ = 'holdings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    avg_price = db.Column(db.Float, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'symbol': self.symbol,
            'qty': self.quantity,
            'avgPrice': self.avg_price
        }


class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(10), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    total = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'symbol': self.symbol,
            'qty': self.quantity,
            'price': self.price,
            'total': self.total,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }


class PendingOrder(db.Model):
    __tablename__ = 'pending_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    order_type = db.Column(db.String(10), nullable=False)  # LIMIT or STOP
    side = db.Column(db.String(10), nullable=False)  # BUY or SELL
    symbol = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    target_price = db.Column(db.Float, nullable=False)  # Limit price or stop price
    status = db.Column(db.String(20), default='PENDING')  # PENDING, EXECUTING, EXECUTED, CANCELLED, EXPIRED, FAILED
    execution_error = db.Column(db.String(500), nullable=True)  # Store error message if execution fails
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    executed_at = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'orderType': self.order_type,
            'side': self.side,
            'symbol': self.symbol,
            'quantity': self.quantity,
            'targetPrice': self.target_price,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'executedAt': self.executed_at.isoformat() if self.executed_at else None,
            'error': self.execution_error
        }