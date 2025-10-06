import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { coinGeckoAPI } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/format';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type TimeRange = '24h' | '7d' | '30d';

const timeRangeConfig: Record<TimeRange, { days: number; label: string }> = {
  '24h': { days: 1, label: '24 Hours' },
  '7d': { days: 7, label: '7 Days' },
  '30d': { days: 30, label: '30 Days' },
};

interface PriceChartProps {
  coinId: string;
}

export function PriceChart({ coinId }: PriceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const { data, isLoading } = useQuery({
    queryKey: ['market-chart', coinId, timeRange],
    queryFn: () => coinGeckoAPI.getMarketChart(coinId, timeRangeConfig[timeRange].days),
    refetchInterval: 60000,
  });

  const chartData = data?.prices.map(([timestamp, price]) => ({
    timestamp,
    price,
    date: formatDate(timestamp),
  })) || [];

  const priceChange = chartData.length > 1 
    ? ((chartData[chartData.length - 1].price - chartData[0].price) / chartData[0].price) * 100
    : 0;

  const isPositive = priceChange >= 0;

  return (
    <Card className="glass-strong p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Price Chart</h2>
          <div className="flex gap-2">
            {(Object.keys(timeRangeConfig) as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? 'gradient-primary' : ''}
              >
                {timeRangeConfig[range].label}
              </Button>
            ))}
          </div>
        </div>

        {!isLoading && chartData.length > 1 && (
          <div className={`text-3xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  if (timeRange === '24h') {
                    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  }
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => formatPrice(value)}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                width={80}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="glass-strong p-3 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground mb-1">{data.date}</p>
                      <p className="text-lg font-bold">{formatPrice(data.price)}</p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </Card>
  );
}
