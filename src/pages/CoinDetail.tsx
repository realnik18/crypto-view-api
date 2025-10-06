import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { coinGeckoAPI } from '@/lib/api';
import { formatPrice, formatCurrency, formatPercentage, formatNumber, getPercentageColor } from '@/lib/format';
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/localStorage';
import { PriceChart } from '@/components/charts/PriceChart';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function CoinDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inWatchlist, setInWatchlist] = useState(isInWatchlist(id || ''));

  const { data: coin, isLoading } = useQuery({
    queryKey: ['coin', id],
    queryFn: () => coinGeckoAPI.getCoinDetail(id!),
    enabled: !!id,
    refetchInterval: 60000,
  });

  const toggleWatchlist = () => {
    if (!id) return;
    if (inWatchlist) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist(id);
    }
    setInWatchlist(!inWatchlist);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-12 bg-muted rounded w-1/3"></div>
        <div className="h-96 bg-muted rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Coin not found</h2>
        <Button onClick={() => navigate('/')}>Back to Overview</Button>
      </div>
    );
  }

  const stats = [
    { label: 'Market Cap', value: formatCurrency(coin.market_cap) },
    { label: 'Volume (24h)', value: formatCurrency(coin.total_volume) },
    { label: 'Circulating Supply', value: formatNumber(coin.circulating_supply, 0) },
    { label: 'Max Supply', value: coin.max_supply ? formatNumber(coin.max_supply, 0) : 'N/A' },
    { label: 'All-Time High', value: formatPrice(coin.ath) },
    { label: 'All-Time Low', value: formatPrice(coin.atl) },
  ];

  return (
    <>
      <Helmet>
        <title>{coin.name} ({coin.symbol.toUpperCase()}) Price & Stats | CryptoView</title>
        <meta name="description" content={`View real-time price, market cap, volume, and statistics for ${coin.name} (${coin.symbol.toUpperCase()})`} />
      </Helmet>

      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img src={coin.image} alt={`${coin.name} logo`} className="h-16 w-16 rounded-full" />
                <div>
                  <h1 className="text-4xl font-bold">{coin.name}</h1>
                  <p className="text-xl text-muted-foreground uppercase">{coin.symbol}</p>
                </div>
              </div>

              <Button
                variant={inWatchlist ? 'default' : 'outline'}
                onClick={toggleWatchlist}
                className={inWatchlist ? 'gradient-primary' : ''}
              >
                <Star className={`h-4 w-4 mr-2 ${inWatchlist ? 'fill-current' : ''}`} />
                {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </Button>
            </div>

            {/* Price info */}
            <div className="mt-6">
              <div className="text-5xl font-bold mb-2">{formatPrice(coin.current_price)}</div>
              <div className={`flex items-center gap-2 text-2xl font-medium ${getPercentageColor(coin.price_change_percentage_24h)}`}>
                {coin.price_change_percentage_24h >= 0 ? (
                  <TrendingUp className="h-6 w-6" />
                ) : (
                  <TrendingDown className="h-6 w-6" />
                )}
                <span>{formatPercentage(coin.price_change_percentage_24h)} (24h)</span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="mb-8">
            <PriceChart coinId={coin.id} />
          </div>

          {/* Stats Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Market Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass p-6">
                    <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* News Placeholder */}
          <Card className="glass-strong p-8">
            <h2 className="text-2xl font-bold mb-4">Latest News</h2>
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">News integration coming soon</p>
              <p className="text-sm">Stay tuned for the latest {coin.name} updates</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
