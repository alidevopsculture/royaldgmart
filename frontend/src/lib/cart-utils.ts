'use client';

import { generateGuestSessionId } from "@/actions/cart";

/**
 * Generate a simple UUID compatible with all browsers
 */
const generateSimpleUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const GUEST_SESSION_KEY = 'guest_cart_session';

/**
 * Get or create guest session ID from localStorage
 */
export const getOrCreateGuestSession = async (): Promise<string> => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return '';
  }

  // Try to get existing session from localStorage
  let sessionId = localStorage.getItem(GUEST_SESSION_KEY);
  console.log('Existing session ID from localStorage:', sessionId);
  
  if (!sessionId) {
    try {
      // Generate new session ID from server
      sessionId = await generateGuestSessionId();
      console.log('Generated new session ID:', sessionId);
      if (sessionId) {
        localStorage.setItem(GUEST_SESSION_KEY, sessionId);
      }
    } catch (error) {
      console.error('Failed to generate guest session:', error);
      // Fallback: generate a simple UUID client-side
      sessionId = generateSimpleUUID();
      console.log('Fallback session ID:', sessionId);
      localStorage.setItem(GUEST_SESSION_KEY, sessionId);
    }
  }
  
  const finalSessionId = sessionId || generateSimpleUUID();
  console.log('Final session ID:', finalSessionId);
  return finalSessionId;
};

/**
 * Clear guest session from localStorage
 */
export const clearGuestSession = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_SESSION_KEY);
  }
};

/**
 * Get current guest session ID without creating a new one
 */
export const getCurrentGuestSession = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(GUEST_SESSION_KEY);
};

/**
 * Check if user is guest (no authentication)
 */
export const isGuestUser = (user: any): boolean => {
  return !user || !user.id;
};

/**
 * Get cart identifier based on user status
 */
export const getCartIdentifier = async (user: any): Promise<{
  userId?: string;
  sessionId?: string;
  isGuest: boolean;
}> => {
  if (user && user.id) {
    // Authenticated user
    return {
      userId: user.id,
      isGuest: false
    };
  } else {
    // Guest user
    const sessionId = await getOrCreateGuestSession();
    return {
      sessionId,
      isGuest: true
    };
  }
};

/**
 * Format cart count for display
 */
export const getCartItemCount = (cart: any): number => {
  if (!cart || !cart.products) return 0;
  
  // Only count valid cart items (same logic as cart page)
  const validItems = getValidCartItems(cart);
  
  return validItems.reduce((total: number, item: any) => {
    return total + (item.quantity || 0);
  }, 0);
};

/**
 * Calculate cart total
 */
export const getCartTotal = (cart: any): number => {
  if (!cart || !cart.products) return 0;
  
  return cart.products.reduce((total: number, item: any) => {
    return total + (item.totalPrice || 0);
  }, 0);
};

/**
 * Check if cart has items
 */
export const hasCartItems = (cart: any): boolean => {
  return cart && cart.products && cart.products.length > 0;
};

/**
 * Filter out cart items with null/invalid products
 */
export const getValidCartItems = (cart: any): any[] => {
  if (!cart || !cart.products) return [];
  
  return cart.products.filter((item: any) => 
    item && 
    item.product && 
    item.product._id && 
    item.product.name
  );
};

/**
 * Get cart with only valid items
 */
export const getValidCart = (cart: any): any => {
  if (!cart) return null;
  
  return {
    ...cart,
    products: getValidCartItems(cart)
  };
};

/**
 * Debug cart state - logs cart info for troubleshooting
 */
export const debugCartState = (cart: any, context: string = ''): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Cart Debug${context ? ` - ${context}` : ''}]:`, {
      hasCart: !!cart,
      totalProducts: cart?.products?.length || 0,
      validProducts: getValidCartItems(cart).length,
      cartItemCount: getCartItemCount(cart),
      cart: cart
    });
  }
};
