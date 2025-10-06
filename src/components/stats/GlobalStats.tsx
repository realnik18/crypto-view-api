import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { coinGeckoAPI } from '@/lib/api';
import { formatCurrency, formatPercentage } from '@/lib/format';
import { Card } from '@/components/ui/card';

export function GlobalStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['global-stats'],
    queryFn: () => coinGeckoAPI.getGlobalData(),
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!data?.data) return null;

  const stats = [
    {
      label: 'Total Market Cap',
      value: formatCurrency(data.data.total_market_cap.usd, 2),
      change: data.data.market_cap_change_percentage_24h_usd,
      icon: DollarSign,
      gradient: 'gradient-primary',
    },
    {
      label: 'Total Volume (24h)',
      value: formatCurrency(data.data.total_volume.usd, 2),
      icon: Activity,
      gradient: 'gradient-success',
    },
    {
      label: 'Active Cryptocurrencies',
      value: data.data.active_cryptocurrencies.toLocaleString(),
      icon: TrendingUp,
    },
    {
      label: 'Markets',
      value: data.data.markets.toLocaleString(),
      icon: Activity,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.change !== undefined && stat.change >= 0;

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-strong p-6 hover:bg-card/80 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.gradient || 'bg-secondary'}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                {stat.change !== undefined && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span>{formatPercentage(Math.abs(stat.change))}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
