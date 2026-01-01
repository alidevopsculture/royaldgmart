let cartCache = new Map();
let lastFetch = new Map();
const CACHE_DURATION = 30000; // 30 seconds

export const getCachedCart = async (sessionId, fetchFunction) => {
  const now = Date.now();
  const cacheKey = sessionId || 'default';
  
  const cachedData = cartCache.get(cacheKey);
  const lastFetchTime = lastFetch.get(cacheKey) || 0;
  
  if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedData;
  }
  
  try {
    const result = await fetchFunction(sessionId);
    cartCache.set(cacheKey, result);
    lastFetch.set(cacheKey, now);
    return result;
  } catch (error) {
    console.error('Cart fetch error:', error);
    // Return cached data if available, even if stale
    return cachedData || { products: [] };
  }
};

export const clearCartCache = (sessionId) => {
  const cacheKey = sessionId || 'default';
  cartCache.delete(cacheKey);
  lastFetch.delete(cacheKey);
};

export const updateCartCache = (sessionId, cartData) => {
  const cacheKey = sessionId || 'default';
  cartCache.set(cacheKey, cartData);
  lastFetch.set(cacheKey, Date.now());
};
