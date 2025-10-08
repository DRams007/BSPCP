// Performance optimizations for authentication system
// This helps reduce API calls and improve performance for multiple concurrent admin users

const CACHE_KEYS = {
  ADMIN_PROFILE: 'admin_profile_cache',
  DASHBOARD_STATS: 'dashboard_stats_cache',
} as const;

const CACHE_DURATION = {
  ADMIN_PROFILE: 5 * 60 * 1000, // 5 minutes
  DASHBOARD_STATS: 2 * 60 * 1000, // 2 minutes
} as const;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class AuthCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  // Store data in cache
  set<T>(key: string, data: T, duration: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration,
    });
  }

  // Retrieve data from cache if not expired
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Clear cache by key
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
const authCache = new AuthCache();

// Periodic cleanup
setInterval(() => {
  authCache.cleanup();
}, 10 * 60 * 1000); // Clean up every 10 minutes

// Cache wrapper functions
export const getCachedAdminProfile = () => authCache.get(CACHE_KEYS.ADMIN_PROFILE);
export const setCachedAdminProfile = (data: any) => authCache.set(CACHE_KEYS.ADMIN_PROFILE, data, CACHE_DURATION.ADMIN_PROFILE);

export const getCachedDashboardStats = () => authCache.get(CACHE_KEYS.DASHBOARD_STATS);
export const setCachedDashboardStats = (data: any) => authCache.set(CACHE_KEYS.DASHBOARD_STATS, data, CACHE_DURATION.DASHBOARD_STATS);

export const clearAuthCache = (key?: string) => authCache.clear(key);

export const getCacheStats = () => authCache.getStats();

// Performance monitoring
class AuthPerformanceMonitor {
  private metrics: Map<string, { count: number; totalTime: number; avgTime: number }> = new Map();

  startTimer(operation: string): () => void {
    const start = performance.now();
    return () => {
      const end = performance.now();
      const duration = end - start;

      const existing = this.metrics.get(operation) || { count: 0, totalTime: 0, avgTime: 0 };
      const newCount = existing.count + 1;
      const newTotalTime = existing.totalTime + duration;
      const newAvgTime = newTotalTime / newCount;

      this.metrics.set(operation, {
        count: newCount,
        totalTime: newTotalTime,
        avgTime: newAvgTime,
      });
    };
  }

  getMetrics() {
    return Object.fromEntries(this.metrics.entries());
  }

  reset() {
    this.metrics.clear();
  }
}

export const authPerformanceMonitor = new AuthPerformanceMonitor();

// Optimized API fetch with cache
export const cachedFetch = async (
  url: string,
  options: RequestInit = {},
  cacheKey?: string,
  cacheDuration?: number
): Promise<any> => {
  const timer = authPerformanceMonitor.startTimer(`fetch_${url}`);

  // Check cache first if cache key provided
  if (cacheKey) {
    const cached = authCache.get(cacheKey);
    if (cached) {
      timer();
      return cached;
    }
  }

  // Fetch from network
  const response = await fetch(url, { ...options, cache: 'no-cache' });
  const data = await response.json();

  // Cache the result if cache key provided
  if (cacheKey && cacheDuration && response.ok) {
    authCache.set(cacheKey, data, cacheDuration);
  }

  timer();
  return data;
};

// Debounced API calls to reduce server load
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
};

// Token refresh queue to prevent multiple simultaneous refreshes
class TokenRefreshQueue {
  private queue: Array<(token: string | null) => void> = [];
  private isRefreshing = false;

  async enqueue(refreshFn: () => Promise<string | null>): Promise<string | null> {
    return new Promise((resolve) => {
      this.queue.push(resolve);

      if (!this.isRefreshing) {
        this.processQueue(refreshFn);
      }
    });
  }

  private async processQueue(refreshFn: () => Promise<string | null>) {
    if (this.isRefreshing || this.queue.length === 0) return;

    this.isRefreshing = true;
    const token = await refreshFn();
    this.isRefreshing = false;

    // Resolve all queued promises with the token
    while (this.queue.length > 0) {
      const resolve = this.queue.shift()!;
      resolve(token);
    }
  }
}

export const tokenRefreshQueue = new TokenRefreshQueue();
