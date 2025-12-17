// Clean up corrupted guest cart
export const cleanupGuestCart = async (sessionId: string) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/guest-cart/${sessionId}/cleanup`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to cleanup cart');
        }

        const result = await res.json();
        return { success: true, data: result };
    } catch (error: any) {
        console.error('Error cleaning up cart:', error);
        return { success: false, error: error.message };
    }
}

// Client-side cart functions
export const addProductToCartClient = async ({
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
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${userId}/add`;
        } else if (sessionId) {
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
            credentials: 'include'
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to add product to cart');
        }

        const result = await res.json();
        return { success: true, data: result };
    } catch (error: any) {
        console.error('Error adding product to cart:', error);
        return { success: false, error: error.message };
    }
}