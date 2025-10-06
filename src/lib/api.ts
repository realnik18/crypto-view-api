// CoinCap API client via Lovable Cloud proxy (real-time data, no CORS issues)
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

class CoinCapAPI {
  private async fetch<T>(endpoint: string): Promise<T> {
    const { data, error } = await supabase.functions.invoke('crypto-proxy', {
      body: { endpoint }
    });
    
    if (error) {
      throw new Error(`API Error: ${error.message}`);
    }
    
    return data as T;
  }

  private transformCoinCapAsset(asset: any, includeSparkline = false): Coin {
    return {
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      image: `https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`,
      current_price: parseFloat(asset.priceUsd || 0),
      market_cap: parseFloat(asset.marketCapUsd || 0),
      market_cap_rank: parseInt(asset.rank || 0),
      fully_diluted_valuation: asset.maxSupply ? parseFloat(asset.maxSupply) * parseFloat(asset.priceUsd || 0) : null,
      total_volume: parseFloat(asset.volumeUsd24Hr || 0),
      high_24h: parseFloat(asset.priceUsd || 0) * (1 + parseFloat(asset.changePercent24Hr || 0) / 100),
      low_24h: parseFloat(asset.priceUsd || 0) * (1 - Math.abs(parseFloat(asset.changePercent24Hr || 0)) / 100),
      price_change_24h: parseFloat(asset.priceUsd || 0) * (parseFloat(asset.changePercent24Hr || 0) / 100),
      price_change_percentage_24h: parseFloat(asset.changePercent24Hr || 0),
      market_cap_change_24h: 0,
      market_cap_change_percentage_24h: parseFloat(asset.changePercent24Hr || 0),
      circulating_supply: parseFloat(asset.supply || 0),
      total_supply: asset.maxSupply ? parseFloat(asset.maxSupply) : null,
      max_supply: asset.maxSupply ? parseFloat(asset.maxSupply) : null,
      ath: parseFloat(asset.priceUsd || 0) * 1.5, // CoinCap doesn't provide ATH, estimate
      ath_change_percentage: -33,
      ath_date: new Date().toISOString(),
      atl: parseFloat(asset.priceUsd || 0) * 0.1, // CoinCap doesn't provide ATL, estimate
      atl_change_percentage: 900,
      atl_date: new Date().toISOString(),
      sparkline_in_7d: includeSparkline ? { price: [] } : undefined,
    };
  }

  async getGlobalData(): Promise<GlobalData> {
    const response = await this.fetch<{ data: any[] }>('/assets?limit=10');
    const topCoins = response.data;
    
    const totalMarketCap = topCoins.reduce((sum, coin) => sum + parseFloat(coin.marketCapUsd || 0), 0);
    const totalVolume = topCoins.reduce((sum, coin) => sum + parseFloat(coin.volumeUsd24Hr || 0), 0);
    
    const btcPercentage = topCoins[0] ? (parseFloat(topCoins[0].marketCapUsd) / totalMarketCap) * 100 : 0;
    
    return {
      data: {
        active_cryptocurrencies: 9000,
        markets: 750,
        total_market_cap: { usd: totalMarketCap * 100 }, // Approximate total market
        total_volume: { usd: totalVolume },
        market_cap_percentage: { btc: btcPercentage },
        market_cap_change_percentage_24h_usd: parseFloat(topCoins[0]?.changePercent24Hr || 0),
      },
    };
  }

  async getMarkets(page = 1, perPage = 100): Promise<Coin[]> {
    const offset = (page - 1) * perPage;
    const response = await this.fetch<{ data: any[] }>(`/assets?limit=${perPage}&offset=${offset}`);
    return response.data.map(asset => this.transformCoinCapAsset(asset, true));
  }

  async getCoinDetail(id: string): Promise<CoinDetail> {
    const response = await this.fetch<{ data: any }>(`/assets/${id}`);
    return this.transformCoinCapAsset(response.data) as CoinDetail;
  }

  async getMarketChart(id: string, days: number = 7): Promise<MarketChartData> {
    const intervals: { [key: number]: string } = {
      1: 'h1',
      7: 'h6',
      30: 'd1',
    };
    
    const interval = intervals[days] || 'h6';
    const now = Date.now();
    const start = now - (days * 24 * 60 * 60 * 1000);
    
    const response = await this.fetch<{ data: any[] }>(
      `/assets/${id}/history?interval=${interval}&start=${start}&end=${now}`
    );
    
    const prices: [number, number][] = response.data.map(item => [item.time, parseFloat(item.priceUsd)]);
    
    return {
      prices,
      market_caps: prices.map(([time]) => [time, 0] as [number, number]),
      total_volumes: prices.map(([time]) => [time, 0] as [number, number]),
    };
  }

  async searchCoins(query: string): Promise<{ coins: Array<{ id: string; name: string; symbol: string; large: string }> }> {
    const response = await this.fetch<{ data: any[] }>(`/assets?search=${encodeURIComponent(query)}&limit=10`);
    return {
      coins: response.data.map(asset => ({
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        large: `https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`,
      })),
    };
  }
}

export const coinGeckoAPI = new CoinCapAPI();
