'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllCarts, removeFromCart } from "@/actions/cart"
import { getUserData } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { Cart, CartItem } from "@/types/cart"
import { getCartIdentifier, getCartItemCount, hasCartItems, getValidCartItems } from "@/lib/cart-utils"

export default function CartPage() {
  const [cartData, setCartData] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getUserData();
        setUser(userData);
        
        // Get cart identifier based on user status
        const cartIdentifier = await getCartIdentifier(userData);
        setIsGuest(cartIdentifier.isGuest);
        
        console.log('Cart identifier:', cartIdentifier);
        
        let cart: Cart = await getAllCarts(cartIdentifier);
        console.log('Fetched cart:', cart);
        console.log('Raw cart products:', cart?.products);
        console.log('Cart products count:', cart?.products?.length || 0);
        
        // Filter out wholesale products from regular cart
        const regularCart = {
          ...cart,
          products: cart.products?.filter((item: any) => 
            item.product && item.product.category !== 'WHOLESALE'
          ) || []
        };
        cart = regularCart;
        
        // If cart has items but they're invalid, try to clean up
        if (cart.products && cart.products.length > 0) {
          const validItems = cart.products.filter(item => 
            item.product && item.product._id && item.product.name
          );
          
          console.log('Valid items:', validItems.length, 'Total items:', cart.products.length);
          
          if (validItems.length !== cart.products.length && cartIdentifier.sessionId) {
            // Try to cleanup corrupted guest cart
            try {
              const { cleanupGuestCart } = await import('@/actions/cart-client');
              const cleanupResult = await cleanupGuestCart(cartIdentifier.sessionId);
              if (cleanupResult.success) {
                cart = cleanupResult.data.cart;
                console.log('Cleaned cart:', cart);
              }
            } catch (error) {
              console.error('Failed to cleanup cart:', error);
            }
          }
        }
        
        setCartData(cart);
      } catch (error) {
        console.error("Error fetching cart data:", error);
        toast.error("Failed to load cart data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRemoveItem = async (productId: string) => {
    try {
      const cartIdentifier = await getCartIdentifier(user);
      const result = await removeFromCart({ ...cartIdentifier, productId });
      
      if (result.success) {
        // Update cart data after removal
        const updatedCart = await getAllCarts(cartIdentifier);
        // Filter out wholesale products
        const regularCart = {
          ...updatedCart,
          products: updatedCart.products?.filter((item: any) => 
            item.product && item.product.category !== 'WHOLESALE'
          ) || []
        };
        setCartData(regularCart);
        toast.success("Item removed from cart");
        
        // Mobile toast for mobile devices
        if (window.innerWidth < 1024) {
          window.dispatchEvent(new CustomEvent('mobileToast', {
            detail: {
              type: 'success',
              message: 'Item removed from cart',
              icon: null
            }
          }));
        }
        
        // Dispatch a custom event to notify navbar to update cart count
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        toast.error(result.error || "Failed to remove item from cart");
        
        // Mobile toast for mobile devices
        if (window.innerWidth < 1024) {
          window.dispatchEvent(new CustomEvent('mobileToast', {
            detail: {
              type: 'error',
              message: 'Failed to remove item',
              icon: null
            }
          }));
        }
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item from cart");
      
      // Mobile toast for mobile devices
      if (window.innerWidth < 1024) {
        window.dispatchEvent(new CustomEvent('mobileToast', {
          detail: {
            type: 'error',
            message: 'Failed to remove item',
            icon: null
          }
        }));
      }
    }
  };

  const handleProceedToCheckout = () => {
    if (isGuest) {
      // For guest users, redirect to auth page with checkout return URL
      router.push('/auth?redirect=checkout&message=login-required');
    } else {
      // For authenticated users, go directly to checkout
      router.push('/checkout');
    }
  };

  const calculateGrandTotal = () => {
    if (!cartData?.products) return 0;
    return cartData.products.reduce((total: number, item: CartItem) => total + item.totalPrice, 0);
  };

  const calculateShipping = () => {
    if (!cartData?.products || cartData.products.length === 0) return 0;
    const firstProduct = cartData.products[0]?.product;
    // Use 0 if shippingCharges is explicitly set to 0, otherwise use 50 as fallback only if undefined
    return firstProduct?.shippingCharges !== undefined ? firstProduct.shippingCharges : 50;
  };
  
  const calculateTax = (subtotal: number) => {
    if (!cartData?.products || cartData.products.length === 0) return 0;
    const firstProduct = cartData.products[0]?.product;
    // Use 0 if taxRate is explicitly set to 0, otherwise use 18 as fallback only if undefined
    const taxRate = firstProduct?.taxRate !== undefined ? firstProduct.taxRate : 18;
    return (subtotal * taxRate) / 100;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const validCartItems = getValidCartItems(cartData);

  if (!cartData?.products || validCartItems.length === 0) {
    return (
      <section className="bg-muted py-12 px-6 md:px-12">
        <div className="max-w-[1500px] mx-auto">
          <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Your cart is empty</p>
            <p className="mt-2">Add some products to your cart to see them here</p>
          </div>
        </div>
      </section>
    );
  }

  const grandTotal = calculateGrandTotal();

  return (
    <section className="bg-muted py-12 px-6 md:px-12">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Cart ({validCartItems.length} items)</h2>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Refresh Cart
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {validCartItems.map((item: CartItem) => (
                <Card key={`${item.product._id}-${item.size}`} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden">
                          <Image
                            src={item.product?.images?.[0] || "/placeholder.svg"}
                            alt={item.product?.name || 'Product'}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex-grow text-center sm:text-left">
                        <h3 className="text-base sm:text-lg font-semibold">{item.product.name}</h3>
                        {item.size && (
                          <p className="text-sm text-muted-foreground mt-1">Size: {item.size}</p>
                        )}
                        <p className="text-base sm:text-lg font-bold mt-2">₹{item.purchasePrice.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground mt-1">Quantity: {item.quantity}</p>
                        <p className="text-base sm:text-lg font-bold mt-2">Total: ₹{item.totalPrice.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex-shrink-0 w-full sm:w-auto">
                        <Button 
                          variant="destructive" 
                          onClick={() => handleRemoveItem(item.product._id)}
                          className="w-full sm:w-auto"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{calculateShipping() === 0 ? 'Free Shipping' : `₹${calculateShipping().toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({cartData?.products?.[0]?.product?.taxRate !== undefined ? cartData.products[0].product.taxRate : 18}%)</span>
                  <span>₹{calculateTax(grandTotal).toFixed(2)}</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{(grandTotal + calculateShipping() + calculateTax(grandTotal)).toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold" 
                  size="lg"
                  onClick={handleProceedToCheckout}
                >
                  {isGuest ? 'Login to Checkout' : 'Proceed to Checkout'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}