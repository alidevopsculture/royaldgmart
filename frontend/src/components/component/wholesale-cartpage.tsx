'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllCarts, removeFromCart } from "@/actions/cart"
import { getUserData } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { Cart, CartItem } from "@/types/cart"
import { getCartIdentifier } from "@/lib/cart-utils"

export default function WholesaleCartPage() {
  const [cartData, setCartData] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getUserData();
        setUser(userData);
        
        const cartIdentifier = await getCartIdentifier(userData);
        setIsGuest(cartIdentifier.isGuest);
        
        const cart: Cart = await getAllCarts(cartIdentifier);
        // Filter only wholesale products
        const wholesaleCart = {
          ...cart,
          products: cart.products?.filter((item: CartItem) => 
            item.product && item.product.category === 'WHOLESALE'
          ) || []
        };
        setCartData(wholesaleCart);
      } catch (error) {
        console.error("Error fetching wholesale cart data:", error);
        toast.error("Failed to load wholesale cart data");
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
        const updatedCart = await getAllCarts(cartIdentifier);
        const wholesaleCart = {
          ...updatedCart,
          products: updatedCart.products?.filter((item: CartItem) => 
            item.product && item.product.category === 'WHOLESALE'
          ) || []
        };
        setCartData(wholesaleCart);
        toast.success("Item removed from wholesale cart");
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        toast.error(result.error || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  const calculateGrandTotal = () => {
    if (!cartData?.products) return 0;
    return cartData.products.reduce((total: number, item: CartItem) => total + item.totalPrice, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!cartData?.products || cartData.products.length === 0) {
    return (
      <section className="bg-muted py-12 px-6 md:px-12">
        <div className="max-w-[1500px] mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-amber-600">Wholesale Only Cart</h2>
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Your wholesale cart is empty</p>
            <p className="mt-2">Add wholesale products to see them here</p>
          </div>
        </div>
      </section>
    );
  }

  const grandTotal = calculateGrandTotal();

  return (
    <section className="bg-muted py-12 px-6 md:px-12">
      <div className="max-w-[1500px] mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-amber-600">Wholesale Only Cart ({cartData.products.length} items)</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cartData.products.map((item: CartItem) => (
                <Card key={`${item.product._id}-${item.size}`} className="overflow-hidden border-amber-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <div className="relative w-32 h-32 rounded-md overflow-hidden">
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
                      
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold">{item.product.name}</h3>
                        {item.size && (
                          <p className="text-sm text-muted-foreground mt-1">Size: {item.size}</p>
                        )}
                        <p className="text-lg font-bold mt-2 text-amber-600">₹{item.purchasePrice.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground mt-1">Quantity: {item.quantity}</p>
                        <p className="text-lg font-bold mt-2">Total: ₹{item.totalPrice.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <Button 
                          variant="destructive" 
                          onClick={() => handleRemoveItem(item.product._id)}
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
          
          <div className="lg:col-span-1">
            <Card className="border-amber-200">
              <CardHeader className="bg-amber-50">
                <CardTitle className="text-amber-600">Wholesale Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartData?.calculations ? (
                  <>
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{cartData.calculations.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wholesale Discount ({cartData.calculations.discountPercentage}%)</span>
                      <span className="text-green-600">-₹{cartData.calculations.discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>After Discount</span>
                      <span>₹{(cartData.calculations.subtotal - cartData.calculations.discount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST ({cartData.calculations.taxPercentage}%)</span>
                      <span>₹{cartData.calculations.tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-amber-600">₹{cartData.calculations.total.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wholesale Discount (10%)</span>
                      <span className="text-green-600">-₹{(grandTotal * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>After Discount</span>
                      <span>₹{(grandTotal * 0.9).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%)</span>
                      <span>₹{((grandTotal * 0.9) * 0.18).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-amber-600">₹{(grandTotal * 0.9 + (grandTotal * 0.9) * 0.18 + 100).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700" 
                  size="lg"
                  onClick={() => router.push(isGuest ? '/auth?redirect=wholesale-checkout&message=login-required' : '/wholesale-checkout')}
                >
                  {isGuest ? 'Login for Wholesale Checkout' : 'Proceed to Wholesale Checkout'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
