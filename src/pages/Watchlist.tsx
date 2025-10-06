import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Star, Trash2 } from 'lucide-react';
import { coinGeckoAPI, type Coin } from '@/lib/api';
import { getWatchlist, removeFromWatchlist } from '@/lib/localStorage';
import { formatPrice, formatPercentage, getPercentageColor } from '@/lib/format';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Watchlist() {
  const navigate = useNavigate();
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);

  useEffect(() => {
    setWatchlistIds(getWatchlist().map(item => item.id));
  }, []);

  const { data: allCoins, isLoading } = useQuery({
    queryKey: ['markets'],
    queryFn: () => coinGeckoAPI.getMarkets(1, 100),
    refetchInterval: 60000,
  });

  const watchlistCoins = allCoins?.filter(coin => watchlistIds.includes(coin.id)) || [];

  const handleRemove = (coinId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromWatchlist(coinId);
    setWatchlistIds(prev => prev.filter(id => id !== coinId));
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-4xl font-bold mb-8">Watchlist</h1>
        <Card className="glass-strong p-6 animate-pulse">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Watchlist | CryptoView</title>
        <meta name="description" content="Track your favorite cryptocurrencies in your personal watchlist." />
      </Helmet>

      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Watchlist
          </h1>
          <p className="text-muted-foreground">
            {watchlistCoins.length} {watchlistCoins.length === 1 ? 'cryptocurrency' : 'cryptocurrencies'} tracked
          </p>
        </div>

        {watchlistCoins.length === 0 ? (
          <Card className="glass-strong p-12 text-center">
            <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your watchlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start tracking cryptocurrencies by clicking the star icon on the Overview page
            </p>
            <Button onClick={() => navigate('/')} className="gradient-primary">
              Browse Markets
            </Button>
          </Card>
        ) : (
          <Card className="glass-strong overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4">#</th>
                    <th className="text-left p-4">Name</th>
                    <th className="text-right p-4">Price</th>
                    <th className="text-right p-4">24h %</th>
                    <th className="text-right p-4">Market Cap</th>
                    <th className="text-right p-4 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {watchlistCoins.map((coin, index) => (
                    <motion.tr
                      key={coin.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/coin/${coin.id}`)}
                      className="border-b border-border/30 hover:bg-card/50 cursor-pointer transition-colors"
                    >
                      <td className="p-4 text-muted-foreground">{coin.market_cap_rank}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={coin.image} alt={`${coin.name} logo`} className="h-8 w-8 rounded-full" />
                          <div>
                            <div className="font-medium">{coin.name}</div>
                            <div className="text-sm text-muted-foreground uppercase">{coin.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium">{formatPrice(coin.current_price)}</td>
                      <td className={`p-4 text-right font-medium ${getPercentageColor(coin.price_change_percentage_24h)}`}>
                        {formatPercentage(coin.price_change_percentage_24h)}
                      </td>
                      <td className="p-4 text-right">${coin.market_cap.toLocaleString()}</td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleRemove(coin.id, e)}
                          aria-label="Remove from watchlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
