import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

export default function Portfolio() {
  return (
    <>
      <Helmet>
        <title>Portfolio | CryptoView</title>
        <meta name="description" content="Track your cryptocurrency portfolio performance and holdings." />
      </Helmet>

      <div>
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Portfolio
        </h1>

        <Card className="glass-strong p-12 text-center">
          <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Portfolio Coming Soon</h2>
          <p className="text-muted-foreground">
            Track your holdings, P/L, and allocation charts
          </p>
        </Card>
      </div>
    </>
  );
}
