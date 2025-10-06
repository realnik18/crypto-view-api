/**
 * LocalStorage utilities for watchlist and portfolio
 */

export interface WatchlistItem {
  id: string;
  addedAt: number;
}

export interface PortfolioTransaction {
  id: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  date: number;
  notes?: string;
}

const WATCHLIST_KEY = 'crypto-dashboard-watchlist';
const PORTFOLIO_KEY = 'crypto-dashboard-portfolio';

// Watchlist
export function getWatchlist(): WatchlistItem[] {
  try {
    const data = localStorage.getItem(WATCHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToWatchlist(coinId: string): void {
  const watchlist = getWatchlist();
  if (!watchlist.find((item) => item.id === coinId)) {
    watchlist.push({ id: coinId, addedAt: Date.now() });
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }
}

export function removeFromWatchlist(coinId: string): void {
  const watchlist = getWatchlist().filter((item) => item.id !== coinId);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
}

export function isInWatchlist(coinId: string): boolean {
  return getWatchlist().some((item) => item.id === coinId);
}

// Portfolio
export function getPortfolio(): PortfolioTransaction[] {
  try {
    const data = localStorage.getItem(PORTFOLIO_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addTransaction(transaction: Omit<PortfolioTransaction, 'id'>): void {
  const portfolio = getPortfolio();
  const newTransaction: PortfolioTransaction = {
    ...transaction,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  portfolio.push(newTransaction);
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
}

export function removeTransaction(transactionId: string): void {
  const portfolio = getPortfolio().filter((t) => t.id !== transactionId);
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
}

export function clearPortfolio(): void {
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify([]));
}
