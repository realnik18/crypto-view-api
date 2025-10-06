// CoinGecko API client (free tier, real-time data)
const BASE_URL = 'https://api.coingecko.com/api/v3';

export interface GlobalData {
  data: {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { [key: string]: number };
    market_cap_change_percentage_24h_usd: number;
  };
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  sparkline_in_7d?: { price: number[] };
}

export interface CoinDetail extends Coin {
  description?: { en: string };
  links?: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    facebook_username: string;
    telegram_channel_identifier: string;
  };
  market_data?: {
    price_change_percentage_7d: number;
    price_change_percentage_14d: number;
    price_change_percentage_30d: number;
    price_change_percentage_60d: number;
    price_change_percentage_200d: number;
    price_change_percentage_1y: number;
  };
}

export interface MarketChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

class CoinGeckoAPI {
  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getGlobalData(): Promise<GlobalData> {
    return this.fetch<GlobalData>('/global');
  }

  async getMarkets(page = 1, perPage = 100): Promise<Coin[]> {
    return this.fetch<Coin[]>(
      `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h`
    );
  }

  async getCoinDetail(id: string): Promise<CoinDetail> {
    return this.fetch<CoinDetail>(
      `/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`
    );
  }

  async getMarketChart(id: string, days: number = 7): Promise<MarketChartData> {
    return this.fetch<MarketChartData>(
      `/coins/${id}/market_chart?vs_currency=usd&days=${days}`
    );
  }

  async searchCoins(query: string): Promise<{ coins: Array<{ id: string; name: string; symbol: string; large: string }> }> {
    return this.fetch(`/search?query=${encodeURIComponent(query)}`);
  }
}

export const coinGeckoAPI = new CoinGeckoAPI();
