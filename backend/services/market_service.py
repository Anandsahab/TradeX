import yfinance as yf
import time
import logging
from datetime import datetime, timedelta
from threading import Lock

logger = logging.getLogger(__name__)

class MarketDataService:
    def __init__(self, cache_ttl=60):
        self.cache = {}
        self.cache_ttl = cache_ttl
        self.lock = Lock()
        self.last_fetch = {}
        
        self.stock_symbols = {
            "RELIANCE": "RELIANCE.NS",
            "TCS": "TCS.NS",
            "INFY": "INFY.NS",
            "HDFC": "HDFCBANK.NS",
            "WIPRO": "WIPRO.NS",
            "ICICI": "ICICIBANK.NS",
            "MARUTI": "MARUTI.NS",
            "BAJFINANCE": "BAJFINANCE.NS",
            "ADANI": "ADANIENT.NS",
            "SBIN": "SBIN.NS",
            "AXISBANK": "AXISBANK.NS",
            "KOTAKBANK": "KOTAKBANK.NS",
            "HINDUNILVR": "HINDUNILVR.NS",
            "ITC": "ITC.NS",
            "TITAN": "TITAN.NS",
        }
        
        self.stock_names = {
            "RELIANCE": "Reliance Industries",
            "TCS": "Tata Consultancy Services",
            "INFY": "Infosys Ltd",
            "HDFC": "HDFC Bank",
            "WIPRO": "Wipro Ltd",
            "ICICI": "ICICI Bank",
            "MARUTI": "Maruti Suzuki India",
            "BAJFINANCE": "Bajaj Finance Ltd",
            "ADANI": "Adani Enterprises",
            "SBIN": "State Bank of India",
            "AXISBANK": "Axis Bank Ltd",
            "KOTAKBANK": "Kotak Mahindra Bank",
            "HINDUNILVR": "Hindustan Unilever",
            "ITC": "ITC Ltd",
            "TITAN": "Titan Company",
        }
        
        self.stock_sectors = {
            "RELIANCE": "Energy",
            "TCS": "IT",
            "INFY": "IT",
            "HDFC": "Finance",
            "WIPRO": "IT",
            "ICICI": "Finance",
            "MARUTI": "Auto",
            "BAJFINANCE": "Finance",
            "ADANI": "Conglomerate",
            "SBIN": "Finance",
            "AXISBANK": "Finance",
            "KOTAKBANK": "Finance",
            "HINDUNILVR": "Consumer",
            "ITC": "Consumer",
            "TITAN": "Consumer",
        }
    
    def _is_cache_valid(self, symbol):
        if symbol not in self.cache:
            return False
        if symbol not in self.last_fetch:
            return False
        elapsed = (datetime.now() - self.last_fetch[symbol]).total_seconds()
        return elapsed < self.cache_ttl
    
    def _fetch_from_yfinance(self, symbols):
        if not symbols:
            return {}
        
        yf_symbols = [self.stock_symbols.get(s, s + ".NS") for s in symbols]
        
        try:
            tickers = yf.Tickers(" ".join(yf_symbols))
            results = {}
            
            for symbol in symbols:
                yf_symbol = self.stock_symbols.get(symbol, symbol + ".NS")
                try:
                    ticker = tickers.tickers.get(yf_symbol)
                    if ticker and ticker.info:
                        info = ticker.info
                        price = info.get('currentPrice') or info.get('regularMarketPreviousClose') or info.get('previousClose')
                        change = info.get('regularMarketChange') or info.get('change') or 0
                        change_pct = info.get('regularMarketChangePercent') or info.get('changePercent') or 0
                        
                        if price:
                            results[symbol] = {
                                "price": round(price, 2),
                                "change": round(change, 2) if change else 0,
                                "changePercent": round(change_pct, 2) if change_pct else 0,
                                "name": self.stock_names.get(symbol, symbol),
                                "sector": self.stock_sectors.get(symbol, "Other")
                            }
                        else:
                            logger.warning("No price data for %s", symbol)
                            results[symbol] = None
                    else:
                        logger.warning("No info for %s", symbol)
                        results[symbol] = None
                except Exception as e:
                    logger.error("Error fetching %s: %s", symbol, e)
                    results[symbol] = None
            
            return results
        except Exception as e:
            logger.error("yfinance error: %s", e)
            return {}
    
    def get_stock_price(self, symbol, fresh=False):
        with self.lock:
            if not fresh and self._is_cache_valid(symbol):
                return self.cache.get(symbol)
            
            result = self._fetch_from_yfinance([symbol])
            if result.get(symbol):
                self.cache[symbol] = result[symbol]
                self.last_fetch[symbol] = datetime.now()
                return self.cache[symbol]
            
            return self.cache.get(symbol)
    
    def get_all_stocks(self, fresh=False):
        with self.lock:
            if not fresh:
                all_cached = all(self._is_cache_valid(s) for s in self.stock_symbols.keys())
                if all_cached and self.cache:
                    cached_stocks = []
                    for symbol in self.stock_symbols.keys():
                        if symbol in self.cache:
                            stock = self.cache[symbol].copy()
                            stock["symbol"] = symbol
                            cached_stocks.append(stock)
                    if cached_stocks:
                        return self._add_sparkline_to_stocks(cached_stocks)
            
            results = self._fetch_from_yfinance(list(self.stock_symbols.keys()))
            
            for symbol, data in results.items():
                if data:
                    self.cache[symbol] = data
                    self.last_fetch[symbol] = datetime.now()
            
            stocks = []
            for symbol in self.stock_symbols.keys():
                if symbol in self.cache and self.cache[symbol]:
                    stock = self.cache[symbol].copy()
                    stock["symbol"] = symbol
                    stocks.append(stock)
                else:
                    stocks.append({
                        "symbol": symbol,
                        "name": self.stock_names.get(symbol, symbol),
                        "sector": self.stock_sectors.get(symbol, "Other"),
                        "price": 0,
                        "change": 0,
                        "changePercent": 0
                    })
            
            return self._add_sparkline_to_stocks(stocks)
    
    def get_fresh_price_for_trade(self, symbol):
        return self.get_stock_price(symbol, fresh=True)
    
    def _add_sparkline_to_stocks(self, stocks):
        import random
        for stock in stocks:
            if stock.get("price") and stock["price"] > 0:
                base = stock["price"]
                stock["sparkline"] = [
                    round(base * (0.995 + random.uniform(-0.01, 0.01) * (i / 30)), 2)
                    for i in range(30)
                ]
            else:
                stock["sparkline"] = [0] * 30
        return stocks
    
    def get_stock_info(self, symbol):
        stock = self.get_stock_price(symbol)
        if stock:
            return {
                "symbol": symbol,
                "name": stock.get("name", symbol),
                "sector": stock.get("sector", "Other"),
                "price": stock.get("price", 0),
                "change": stock.get("change", 0),
                "changePercent": stock.get("changePercent", 0)
            }
        return None


market_service = MarketDataService(cache_ttl=60)
