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
    { label: 'Market Cap', value: formatCurrency(coin.market_data?.market_cap?.usd || coin.market_cap) },
    { label: 'Volume (24h)', value: formatCurrency(coin.market_data?.total_volume?.usd || coin.total_volume) },
    { label: 'Circulating Supply', value: formatNumber(coin.circulating_supply, 0) },
    { label: 'Max Supply', value: formatNumber(coin.max_supply, 0) },
    { label: 'All-Time High', value: formatPrice(coin.market_data?.ath?.usd || coin.ath) },
    { label: 'All-Time Low', value: formatPrice(coin.market_data?.atl?.usd || coin.atl) },
  ];

  return (
    <>
      <Helmet>
        <title>{coin.name} ({coin.symbol.toUpperCase()}) Price & Stats | CryptoView</title>
        <meta name="description" content={`View real-time price, market cap, volume, and statistics for ${coin.name} (${coin.symbol.toUpperCase()})`} />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 -ml-2 hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Hero Section */}
          <Card className="glass-strong p-8 mb-8 border-border/50">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                  <img 
                    src={coin.image} 
                    alt={`${coin.name} logo`} 
                    className="relative h-20 w-20 rounded-full ring-2 ring-primary/30" 
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold">{coin.name}</h1>
                    <span className="text-xl text-muted-foreground uppercase font-medium px-3 py-1 bg-muted/50 rounded-full">
                      {coin.symbol}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {formatPrice(coin.current_price)}
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 mt-3 text-xl font-semibold ${getPercentageColor(coin.price_change_percentage_24h)}`}>
                    {coin.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    <span>{formatPercentage(coin.price_change_percentage_24h)} (24h)</span>
                  </div>
                </div>
              </div>

              <Button
                variant={inWatchlist ? 'default' : 'outline'}
                onClick={toggleWatchlist}
                size="lg"
                className={`${inWatchlist ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70' : 'hover:bg-muted/50'} transition-all duration-300`}
              >
                <Star className={`h-5 w-5 mr-2 ${inWatchlist ? 'fill-current' : ''}`} />
                {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </Button>
            </div>
          </Card>

          {/* Price Chart */}
          <div className="mb-8">
            <PriceChart coinId={coin.id} />
          </div>

          {/* Market Statistics */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Market Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Card className="glass group hover:glass-strong transition-all duration-300 hover:scale-105 hover:border-primary/30 p-6 border-border/50">
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                        {stat.value}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Performance */}
            <Card className="glass-strong p-8 border-border/50">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Price Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">24h High</span>
                  <span className="font-bold text-lg">{formatPrice(coin.high_24h)}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">24h Low</span>
                  <span className="font-bold text-lg">{formatPrice(coin.low_24h)}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">Price Change (24h)</span>
                  <span className={`font-bold text-lg ${getPercentageColor(coin.price_change_percentage_24h)}`}>
                    {formatPrice(coin.price_change_24h)}
                  </span>
                </div>
              </div>
            </Card>

            {/* About Section Placeholder */}
            <Card className="glass-strong p-8 border-border/50">
              <h3 className="text-2xl font-bold mb-6">About {coin.name}</h3>
              <div className="space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  Real-time market data and statistics for {coin.name} ({coin.symbol.toUpperCase()}).
                </p>
                <div className="pt-4 border-t border-border/30">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Market Cap Rank:</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-bold">
                      #{coin.market_cap_rank}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </>
  );
}
