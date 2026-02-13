const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const CACHE_TTL = 60_000; // 60 seconds

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function getTopCoins(limit: number = 20) {
  const cacheKey = `top_coins_${limit}`;
  const cached = getCached<unknown[]>(cacheKey);
  if (cached) return cached;

  const url = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`;
  const data = await fetchJSON<unknown[]>(url);

  setCache(cacheKey, data);
  return data;
}

export async function getCoinPrice(
  ids: string
): Promise<Record<string, { usd: number; usd_24h_change?: number }>> {
  const cacheKey = `price_${ids}`;
  const cached = getCached<Record<string, { usd: number; usd_24h_change?: number }>>(cacheKey);
  if (cached) return cached;

  const url = `${COINGECKO_BASE}/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true`;
  const data = await fetchJSON<Record<string, { usd: number; usd_24h_change?: number }>>(url);

  setCache(cacheKey, data);
  return data;
}

interface CoinChartData {
  prices: { timestamp: number; date: string; price: number }[];
  marketCaps: { timestamp: number; date: string; marketCap: number }[];
  volumes: { timestamp: number; date: string; volume: number }[];
}

export async function getCoinChart(id: string, days: number = 7): Promise<CoinChartData> {
  const cacheKey = `chart_${id}_${days}`;
  const cached = getCached<CoinChartData>(cacheKey);
  if (cached) return cached;

  const url = `${COINGECKO_BASE}/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`;
  // Add simplified error handling or fallback
  let data;
  try {
    data = await fetchJSON<{ prices: number[][]; market_caps: number[][]; total_volumes: number[][] }>(url);
  } catch (e) {
    console.error(`Failed to fetch chart for ${id}:`, e);
    return { prices: [], marketCaps: [], volumes: [] };
  }

  const formatted: CoinChartData = {
    prices: data.prices.map(([timestamp, price]) => ({
      timestamp,
      date: new Date(timestamp).toISOString(),
      price,
    })),
    marketCaps: data.market_caps.map(([timestamp, cap]) => ({
      timestamp,
      date: new Date(timestamp).toISOString(),
      marketCap: cap,
    })),
    volumes: data.total_volumes.map(([timestamp, volume]) => ({
      timestamp,
      date: new Date(timestamp).toISOString(),
      volume,
    })),
  };

  setCache(cacheKey, formatted);
  return formatted;
}

export async function getTrending() {
  const cacheKey = "trending";
  const cached = getCached<unknown>(cacheKey);
  if (cached) return cached;

  const url = `${COINGECKO_BASE}/search/trending`;
  const data = await fetchJSON<{ coins: unknown[] }>(url);

  setCache(cacheKey, data.coins || []);
  return data.coins || [];
}

export async function getCoinTickers(id: string) {
  const cacheKey = `tickers_${id}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  // Use a simpler endpoint or handle errors gracefully as tickes can be heavy
  const url = `${COINGECKO_BASE}/coins/${id}/tickers?depth=true`;
  try {
    const data = await fetchJSON<{ tickers: any[] }>(url);
    setCache(cacheKey, data.tickers || []);
    return data.tickers || [];
  } catch (e) {
    console.error(`Failed to fetch tickers for ${id}`, e);
    return [];
  }
}
