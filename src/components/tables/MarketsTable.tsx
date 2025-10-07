import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowUpDown, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { coinGeckoAPI } from '@/lib/api';
import { formatPrice, formatCurrency, formatPercentage, getPercentageColor } from '@/lib/format';
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/localStorage';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type SortField = 'market_cap_rank' | 'name' | 'current_price' | 'price_change_percentage_24h' | 'market_cap' | 'total_volume';
type SortOrder = 'asc' | 'desc';

export function MarketsTable() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('market_cap_rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [watchlist, setWatchlist] = useState<string[]>(() => 
    JSON.parse(localStorage.getItem('crypto-dashboard-watchlist') || '[]').map((item: { id: string }) => item.id)
  );

  const { data: coins, isLoading } = useQuery({
    queryKey: ['markets'],
    queryFn: () => coinGeckoAPI.getMarkets(1, 100),
    refetchInterval: 60000,
  });

  const filteredAndSorted = useMemo(() => {
    if (!coins) return [];

    const filtered = coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(search.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(search.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortOrder === 'asc' ? 1 : -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * modifier;
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * modifier;
      }
      return 0;
    });
  }, [coins, search, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const toggleWatchlist = (coinId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWatchlist(coinId)) {
      removeFromWatchlist(coinId);
      setWatchlist(prev => prev.filter(id => id !== coinId));
    } else {
      addToWatchlist(coinId);
      setWatchlist(prev => [...prev, coinId]);
    }
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-2 py-1"
      aria-sort={sortField === field ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  if (isLoading) {
    return (
      <Card className="glass-strong p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-strong overflow-hidden">
      {/* Search */}
      <div className="p-6 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background/50"
            aria-label="Search cryptocurrencies"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Cryptocurrency markets">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left p-4 w-12"></th>
              <th className="text-left p-4"><SortButton field="market_cap_rank" label="#" /></th>
              <th className="text-left p-4"><SortButton field="name" label="Name" /></th>
              <th className="text-right p-4"><SortButton field="current_price" label="Price" /></th>
              <th className="text-right p-4"><SortButton field="price_change_percentage_24h" label="24h %" /></th>
              <th className="text-right p-4"><SortButton field="market_cap" label="Market Cap" /></th>
              <th className="text-right p-4"><SortButton field="total_volume" label="Volume (24h)" /></th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((coin, index) => (
              <motion.tr
                key={coin.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => navigate(`/coin/${coin.id}`)}
                className="border-b border-border/30 hover:bg-card/50 cursor-pointer transition-colors"
                role="row"
              >
                <td className="p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => toggleWatchlist(coin.id, e)}
                    aria-label={watchlist.includes(coin.id) ? 'Remove from watchlist' : 'Add to watchlist'}
                  >
                    <Star
                      className={`h-4 w-4 ${watchlist.includes(coin.id) ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                    />
                  </Button>
                </td>
                <td className="p-4 text-muted-foreground">{coin.market_cap_rank}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={coin.image}
                      alt={`${coin.name} logo`}
                      className="h-8 w-8 rounded-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
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
                <td className="p-4 text-right">{formatCurrency(coin.market_cap)}</td>
                <td className="p-4 text-right">{formatCurrency(coin.total_volume)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">
          No cryptocurrencies found matching "{search}"
        </div>
      )}
    </Card>
  );
}
