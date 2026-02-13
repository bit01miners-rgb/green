import { useQuery } from "@tanstack/react-query";

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

export interface CoinChart {
  prices: { timestamp: number; date: string; price: number }[];
  marketCaps: { timestamp: number; date: string; marketCap: number }[];
  volumes: { timestamp: number; date: string; volume: number }[];
}

export function useTopCoins(limit = 20) {
  return useQuery<any, Error, CoinData[]>({
    queryKey: ["/api/trading/market/overview", limit],
    staleTime: 60 * 1000,
    select: (data) => data.topCoins,
  });
}

export function useCoinChart(coinId: string, days = 7) {
  return useQuery<any, Error, CoinChart>({
    queryKey: [`/api/trading/market/${coinId}?days=${days}`],
    enabled: !!coinId,
    staleTime: 60 * 1000,
    select: (data) => data.chart,
  });
}

export function useWatchlist() {
  return useQuery({
    queryKey: ["/api/trading/watchlist"],
  });
}

export function usePortfolio() {
  return useQuery({
    queryKey: ["/api/trading/portfolio"],
  });
}
