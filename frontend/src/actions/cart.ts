// Cache for cart data
let cartCache: any = null;
let lastFetch = 0;
const CACHE_DURATION = 3000; // 3 seconds

// Clear cart cache when cart is modified
const clearCartCache = () => {
    cartCache = null;
    lastFetch = 0;
};

// Generate guest session ID
export const generateGuestSessionId = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/guest-cart/session`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (res.status > 201) {
            throw new Error('Failed to generate session ID');
        }

        const result = await res.json();
        return result.sessionId;
    } catch (error: any) {
        console.error('[ERROR] generateGuestSessionId:', error?.message || error);
        throw error;
    }
}

// Add product to cart (guest or user) - Client side
export const addProductToCart = async ({
    userId, 
    sessionId, 
    quantity, 
    productId, 
    size
}: {
    userId?: string, 
    sessionId?: string, 
    quantity: number, 
    productId: string, 
    size?: string
}) => {
    try {
        let url: string;
        
        if (userId) {
            // User cart
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${userId}/add`;
        } else if (sessionId) {
            // Guest cart
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/guest-cart/${sessionId}/add`;
        } else {
            throw new Error('Either userId or sessionId is required');
        }

        const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
                product: productId,
                quantity: quantity,
                size: size
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (res.status > 201) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || res.statusText || 'Failed to add product to cart');
        } else {
            const result = await res.json();
            clearCartCache(); // Clear cache when cart is modified
            return { success: true, data: result };
        }
    } catch (error: any) {
        console.error('[ERROR] addProductToCart:', error?.message || error);
        return { success: false, error: error.message };
    }
}

// Get cart (user or guest)
export const getAllCarts = async ({userId, sessionId}: {userId?: string, sessionId?: string}) => {
    try {
        const cacheKey = userId || sessionId;
        const now = Date.now();
        
        // Return cached data if available and fresh
        if (cartCache && cartCache.key === cacheKey && (now - lastFetch) < CACHE_DURATION) {
            return cartCache.data;
        }

        let url: string;
        
        if (userId) {
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${userId}`;
        } else if (sessionId) {
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/guest-cart/${sessionId}`;
        } else {
            throw new Error('Either userId or sessionId is required');
        }

        const res = await fetch(url, {
            method: "GET",
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (res.status > 201) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || res.statusText || 'Failed to fetch cart');
        } else {
            const result = await res.json();
            
            // Cache the result
            cartCache = { key: cacheKey, data: result };
            lastFetch = now;
            
            return result;
        }
    } catch (error: any) {
        console.error('[ERROR] getAllCarts:', error?.message || error);
        return {
            _id: '',
            user: userId,
            sessionId: sessionId,
            products: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
}

// Update cart item (user or guest)
export const updateCartItem = async ({
    userId, 
    sessionId, 
    productId, 
    quantity
}: {
    userId?: string, 
    sessionId?: string, 
    productId: string, 
    quantity: number
}) => {
    try {
        let url: string;
        
        if (userId) {
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${userId}/update`;
        } else if (sessionId) {
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/guest-cart/${sessionId}/update`;
        } else {
            throw new Error('Either userId or sessionId is required');
        }

        const res = await fetch(url, {
            method: "PUT",
            body: JSON.stringify({
                productId: productId,
                quantity: quantity
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (res.status > 201) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || res.statusText || 'Failed to update cart item');
        } else {
            const result = await res.json();
            clearCartCache(); // Clear cache when cart is modified
            return { success: true, data: result };
        }
    } catch (error: any) {
        console.error('[ERROR] updateCartItem:', error?.message || error);
        return { success: false, error: error.message };
    }
}

// Remove from cart (user or guest)
export const removeFromCart = async ({
    userId, 
    sessionId, 
    productId
}: {
    userId?: string, 
    sessionId?: string, 
    productId: string
}) => {
    try {
        let url: string;
        
        if (userId) {
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${userId}/remove/${productId}`;
        } else if (sessionId) {
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/guest-cart/${sessionId}/remove/${productId}`;
        } else {
            throw new Error('Either userId or sessionId is required');
        }

        const res = await fetch(url, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (res.status > 201) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || res.statusText || 'Failed to remove item from cart');
        } else {
            const result = await res.json();
            clearCartCache(); // Clear cache when cart is modified
            return { success: true, data: result };
        }
    } catch (error: any) {
        console.error('[ERROR] removeFromCart:', error?.message || error);
        return { success: false, error: error.message };
    }
}

export const clearCart = async ({
    userId, 
    sessionId
}: {
    userId?: string, 
    sessionId?: string
}) => {
    try {
        let url: string;
        
        if (userId) {
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${userId}/clear`;
        } else if (sessionId) {
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/guest-cart/${sessionId}/clear`;
        } else {
            throw new Error('Either userId or sessionId is required');
        }

        const res = await fetch(url, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (res.status > 201) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || res.statusText || 'Failed to clear cart');
        } else {
            const result = await res.json();
            return { success: true, data: result };
        }
    } catch (error: any) {
        console.error('[ERROR] clearCart:', error?.message || error);
        return { success: false, error: error.message };
    }
}

export const transferGuestCartToUser = async (sessionId: string, userId: string) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/guest-cart/${sessionId}/transfer`, {
            method: "POST",
            body: JSON.stringify({
                userId: userId
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (res.status > 201) {
            const errorData = await res.json().catch(() => ({}));
            // Don't throw error for "no cart found" - this is expected
            if (errorData.message && errorData.message.includes('No guest cart found')) {
                return { success: true, data: null };
            }
            throw new Error(errorData.message || res.statusText || 'Failed to transfer cart');
        } else {
            const result = await res.json();
            return { success: true, data: result };
        }
    } catch (error: any) {
        console.error('[ERROR] transferGuestCartToUser:', error?.message || error);
        return { success: false, error: error.message };
    }
}
// Add product to wholesale cart
export const addProductToWholesaleCart = async ({
    userId, 
    sessionId, 
    quantity, 
    productId, 
    size
}: {
    userId?: string, 
    sessionId?: string, 
    quantity: number, 
    productId: string, 
    size?: string
}) => {
    try {
        let url: string;
        
        if (userId) {
            // User wholesale cart
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/wholesale-cart/${userId}/add`;
        } else if (sessionId) {
            // Guest wholesale cart
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/guest-wholesale-cart/${sessionId}/add`;
        } else {
            throw new Error('Either userId or sessionId is required');
        }

        // Get token from cookie
        const token = typeof document !== 'undefined' 
            ? document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
            : undefined;

        const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
                product: productId,
                quantity: quantity,
                size: size
            }),
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            cache: 'no-store'
        });

        if (res.status > 201) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || res.statusText || 'Failed to add product to wholesale cart');
        } else {
            const result = await res.json();
            return { success: true, data: result };
        }
    } catch (error: any) {
        console.error('[ERROR] addProductToWholesaleCart:', error?.message || error);
        return { success: false, error: error.message };
    }
}

// Get wholesale cart
export const getWholesaleCart = async ({userId, sessionId}: {userId?: string, sessionId?: string}) => {
    try {
        let url: string;
        
        if (userId) {
            // User wholesale cart
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/wholesale-cart/${userId}`;
        } else if (sessionId) {
            // Guest wholesale cart
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/guest-wholesale-cart/${sessionId}`;
        } else {
            throw new Error('Either userId or sessionId is required');
        }

        // Get token from cookie
        const token = typeof document !== 'undefined' 
            ? document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
            : undefined;

        const res = await fetch(url, {
            method: "GET",
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        });

        if (res.status > 201) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || res.statusText || 'Failed to fetch wholesale cart');
        } else {
            const result = await res.json();
            return result;
        }
    } catch (error: any) {
        console.error('[ERROR] getWholesaleCart:', error?.message || error);
        // Return empty cart structure instead of error for better UX
        return {
            _id: '',
            user: userId,
            sessionId: sessionId,
            products: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
}
