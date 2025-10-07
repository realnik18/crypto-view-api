// CoinGecko API client via backend proxy (bypasses CORS and rate limits)
import { supabase } from "@/integrations/supabase/client";

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
    market_cap: { usd: number };
    total_volume: { usd: number };
    ath: { usd: number };
    atl: { usd: number };
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
    const { data, error } = await supabase.functions.invoke('crypto-proxy', {
      body: { endpoint }
    });
    
    if (error) {
      console.error('API proxy error:', error);
      throw new Error(`API Error: ${error.message}`);
    }
    
    if (data?.error) {
      throw new Error(`API Error: ${data.error}`);
    }
    
    return data as T;
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
    const d = await this.fetch<CoinDetail>(
      `/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`
    );

    // Normalize to Coin shape for consistency across the app
    const cd: CoinDetail = {
      id: d.id,
      symbol: d.symbol,
      name: d.name,
      image: d.image?.large || d.image?.small || d.image?.thumb || '',
      current_price: d.market_data?.current_price?.usd ?? 0,
      market_cap: d.market_data?.market_cap?.usd ?? 0,
      market_cap_rank: d.market_cap_rank ?? 0,
      fully_diluted_valuation: d.market_data?.fully_diluted_valuation?.usd ?? null,
      total_volume: d.market_data?.total_volume?.usd ?? 0,
      high_24h: d.market_data?.high_24h?.usd ?? 0,
      low_24h: d.market_data?.low_24h?.usd ?? 0,
      price_change_24h: d.market_data?.price_change_24h_in_currency?.usd ?? 0,
      price_change_percentage_24h: d.market_data?.price_change_percentage_24h ?? 0,
      market_cap_change_24h: d.market_data?.market_cap_change_24h ?? 0,
      market_cap_change_percentage_24h: d.market_data?.market_cap_change_percentage_24h ?? 0,
      circulating_supply: d.market_data?.circulating_supply ?? 0,
      total_supply: d.market_data?.total_supply ?? null,
      max_supply: d.market_data?.max_supply ?? null,
      ath: d.market_data?.ath?.usd ?? 0,
      ath_change_percentage: d.market_data?.ath_change_percentage?.usd ?? 0,
      ath_date: d.market_data?.ath_date?.usd ?? d.genesis_date ?? '',
      atl: d.market_data?.atl?.usd ?? 0,
      atl_change_percentage: d.market_data?.atl_change_percentage?.usd ?? 0,
      atl_date: d.market_data?.atl_date?.usd ?? '',
      sparkline_in_7d: d.market_data?.sparkline_7d?.price ? { price: d.market_data.sparkline_7d.price } : undefined,
      description: d.description,
      links: d.links,
      market_data: d.market_data,
    } as CoinDetail;

    return cd;
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
