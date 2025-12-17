'use client'

/**
 * Clear all caches and force refresh
 */
export const clearAllCaches = () => {
  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userOrders')
    localStorage.removeItem('userWholesaleOrders')
    localStorage.removeItem('adminOrderUpdates')
    localStorage.removeItem('adminWholesaleUpdates')
    localStorage.removeItem('orderUpdates')
    localStorage.removeItem('adminOrdersSync')
    localStorage.removeItem('adminWholesaleSync')
    localStorage.removeItem('userOrdersSync')
    localStorage.removeItem('adminDeleteSync')
  }
}

/**
 * Force page refresh after auth changes
 */
export const forceRefreshAfterAuth = () => {
  clearAllCaches()
  window.location.reload()
}