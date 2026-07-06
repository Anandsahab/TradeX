from services.market_service import market_service
import random
import json

stocks = market_service.get_all_stocks()
live_prices = {}

for stock in stocks:
    base_price = stock.get('price', 0)
    if base_price and base_price > 0:
        fluctuation = random.uniform(-0.002, 0.002)
        live_price = round(base_price * (1 + fluctuation), 2)
        live_prices[stock['symbol']] = {
            'price': live_price, 
            'change': stock.get('change', 0), 
            'changePercent': stock.get('changePercent', 0)
        }
        print(f"{stock['symbol']}: Base={base_price}, Live={live_price}, Fluctuation={fluctuation*100:.2f}%")

print("\nLive prices JSON:")
print(json.dumps(live_prices, indent=2))
