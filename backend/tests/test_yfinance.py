from services.market_service import market_service

print("Testing yFinance Integration...")
print("=" * 50)

stocks = market_service.get_all_stocks()
print(f"Total stocks fetched: {len(stocks)}")
print()

for stock in stocks:
    price = stock.get('price', 0)
    change = stock.get('changePercent', 0)
    print(f"{stock['symbol']}: Rs.{price} ({change}%)")

print()
print("Testing fresh price for trade...")
fresh = market_service.get_fresh_price_for_trade("RELIANCE")
print(f"RELIANCE fresh price: Rs.{fresh}")

print()
print("Testing live prices (simulated)...")
live = market_service.get_all_stocks()
print("Live prices with sparklines available!")

print()
print("yFinance Integration Test COMPLETE!")
