import { Helmet } from 'react-helmet';
import { GlobalStats } from '@/components/stats/GlobalStats';
import { MarketsTable } from '@/components/tables/MarketsTable';

export default function Overview() {
  return (
    <>
      <Helmet>
        <title>Crypto Market Overview | CryptoView</title>
        <meta name="description" content="View real-time cryptocurrency market data, prices, and statistics for top digital assets." />
      </Helmet>

      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Market Overview
          </h1>
          <p className="text-muted-foreground">
            Real-time data for the top 100 cryptocurrencies by market cap
          </p>
        </div>

        <GlobalStats />
        <MarketsTable />
      </div>
    </>
  );
}
