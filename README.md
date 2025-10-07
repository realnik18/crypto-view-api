# CryptoView - Real-time Cryptocurrency Dashboard

A modern, responsive cryptocurrency dashboard built with React and TypeScript that provides real-time market data, interactive charts, and portfolio tracking capabilities.

🌐 **Live Demo**: [https://crypto-view-api.vercel.app/](https://crypto-view-api.vercel.app/)

## Features

- 📊 **Real-time Market Data**: Live cryptocurrency prices and market statistics
- 📈 **Interactive Charts**: Beautiful price charts with multiple timeframes (24h, 7d, 30d)
- ⭐ **Watchlist**: Track your favorite cryptocurrencies
- 🔍 **Search & Sort**: Find and organize cryptocurrencies by various metrics
- 📱 **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Glass morphism design with smooth animations
- ♿ **Accessible**: Built with accessibility best practices

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **API**: CoinGecko API via Supabase Edge Functions
- **Backend**: Supabase Edge Functions (proxy)
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ and npm installed
- Git
- Supabase account (for API proxy)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crypto-view-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file with your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:8080](http://localhost:8080) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── charts/         # Chart components
│   ├── stats/          # Statistics components
│   ├── tables/         # Table components
│   └── ui/             # Base UI components (shadcn/ui)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and API client
├── pages/              # Page components
└── main.tsx           # Application entry point
```

## API Integration

This project uses the CoinGecko API (free tier) to fetch real-time cryptocurrency data. The API client is implemented in `src/lib/api.ts` with proper error handling and TypeScript interfaces. A Supabase Edge Function is used as a proxy to handle CORS and rate limiting.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Data provided by [CoinGecko API](https://www.coingecko.com/en/api)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
