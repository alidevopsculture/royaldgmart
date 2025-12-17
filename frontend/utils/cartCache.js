let cartCache = null;
let lastFetch = 0;
const CACHE_DURATION = 5000; // 5 seconds

export const getCachedCart = async (sessionId, fetchFunction) => {
  const now = Date.now();
  
  if (cartCache && (now - lastFetch) < CACHE_DURATION) {
    return cartCache;
  }
  
  const result = await fetchFunction(sessionId);
  cartCache = result;
  lastFetch = now;
  return result;
};
