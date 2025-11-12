export type OrderType = 'market' | 'limit' | 'stop';

export interface TradeResult {
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  total: number;
  time: string;
}

export class StockModel {
  private _price: number;
  private _bid: number;
  private _ask: number;
  private _high: number;
  private _low: number;
  private _volume: number;
  private listeners: Array<() => void> = [];

  constructor(initial = 875.4) {
    this._price = initial;
    this._bid = parseFloat((initial - 0.05).toFixed(2));
    this._ask = parseFloat((initial + 0.05).toFixed(2));
    this._high = initial + 7;
    this._low = initial - 7;
    this._volume = 28_476_500;
  }

  // Getters
  get price() { return this._price }
  get bid() { return this._bid }
  get ask() { return this._ask }
  get high() { return this._high }
  get low() { return this._low }
  get volume() { return this._volume }

  // Subscribe to updates (simple pub/sub for demo)
  subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private emit() {
    this.listeners.forEach(cb => cb());
  }

  // Price simulation tick — call periodically externally
  tick() {
    const change = (Math.random() - 0.5) * 5;
    const newPrice = parseFloat((this._price + change).toFixed(2));
    this._price = newPrice;
    this._bid = parseFloat((newPrice - 0.05).toFixed(2));
    this._ask = parseFloat((newPrice + 0.05).toFixed(2));
    this._high = Math.max(this._high, newPrice);
    this._low = Math.min(this._low, newPrice);
    this._volume += Math.floor(Math.random() * 10000);
    this.emit();
  }

  // Execute trade (simple local simulation)
  executeTrade(type: 'BUY' | 'SELL', shares: number, orderType: OrderType, limitPrice?: number): TradeResult {
    let executionPrice = type === 'BUY' ? this._ask : this._bid;
    if (orderType === 'limit' && typeof limitPrice === 'number') {
      executionPrice = limitPrice;
    }
    const total = parseFloat((executionPrice * shares).toFixed(2));
    const result: TradeResult = { type, shares, price: executionPrice, total, time: new Date().toLocaleTimeString() };
    // For demo: do not mutate model holdings here; the UI/portfolio will manage holdings.
    return result;
  }
}
