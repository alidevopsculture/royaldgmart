'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, User, CreditCard, MapPin, Phone, Mail, Truck, Banknote, AlertCircle, X } from 'lucide-react';
import { getUserData } from '@/actions/auth';
import { getAllCarts, transferGuestCartToUser } from '@/actions/cart';
import { createRazorpayOrderClient, verifyRazorpayPaymentClient } from '@/actions/payment-client';
import { getCartIdentifier, hasCartItems, clearGuestSession, getCurrentGuestSession } from '@/lib/cart-utils';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    shippingCharges?: number;
    taxRate?: number;
  };
  quantity: number;
  size: string | null;
  purchasePrice: number;
  totalPrice: number;
}

interface Cart {
  _id: string;
  user?: string;
  sessionId?: string;
  products: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export default function Checkout() {
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const router = useRouter();

  useEffect(() => {
    // Load Razorpay script with better mobile support
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (typeof (window as any).Razorpay !== 'undefined') {
          resolve(true);
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        
        let loaded = false;
        const cleanup = () => {
          script.onload = null;
          script.onerror = null;
        };
        
        script.onload = () => {
          if (!loaded) {
            loaded = true;
            cleanup();
            console.log('Razorpay SDK loaded');
            resolve(true);
          }
        };
        
        script.onerror = () => {
          if (!loaded) {
            loaded = true;
            cleanup();
            console.error('Razorpay SDK failed to load');
            resolve(false);
          }
        };
        
        // Timeout fallback
        setTimeout(() => {
          if (!loaded) {
            loaded = true;
            cleanup();
            resolve(false);
          }
        }, 10000);
        
        document.head.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setLoading(true);
        
        const userData = await getUserData();
        
        if (!userData) {
          router.push('/auth');
          return;
        }
        
        // Fetch complete profile data
        const { getUserProfile } = await import('@/actions/profile');
        const profileResult = await getUserProfile();
        
        let fullUserData = userData;
        if (profileResult && profileResult.success && profileResult.user) {
          fullUserData = profileResult.user;
        }
        
        setUser(fullUserData);
        setFormData({
          firstName: fullUserData.firstName || '',
          lastName: fullUserData.lastName || '',
          email: fullUserData.email || '',
          phone: fullUserData.phone || '',
          address: fullUserData.address || '',
          city: fullUserData.city || '',
          state: fullUserData.state || '',
          zipCode: fullUserData.zipCode || '',
          country: fullUserData.country || 'India'
        });
        
        const guestSessionId = getCurrentGuestSession();
        if (guestSessionId) {
          try {
            await transferGuestCartToUser(guestSessionId, userData.id);
            clearGuestSession();
          } catch (error) {
            console.error('Failed to transfer guest cart:', error);
          }
        }
        
        const cartIdentifier = await getCartIdentifier(userData);
        
        // Add a small delay to ensure cart is updated after Buy Now
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const cartData = await getAllCarts(cartIdentifier);
        
        console.log('Cart data received:', cartData);
        
        // Check if cartData exists and has products
        if (!cartData || !cartData.products || cartData.products.length === 0) {
          console.log('No cart data or empty cart, redirecting...');
          toast.error('Your cart is empty');
          router.push('/cart');
          return;
        }
        
        // Filter out wholesale products for regular checkout
        const regularProducts = cartData.products.filter((item: any) => {
          if (!item || !item.product) {
            console.log('Skipping invalid item:', item);
            return false;
          }
          return item.product.category !== 'WHOLESALE';
        });
        
        console.log('Regular products found:', regularProducts.length);
        
        if (regularProducts.length === 0) {
          console.log('No regular products in cart, redirecting...');
          toast.error('Your cart is empty');
          router.push('/cart');
          return;
        }
        
        setCart({ ...cartData, products: regularProducts });
        
        // Test API connection after cart is validated
        try {
          const testResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/test-auth`, {
            credentials: 'include'
          });
          if (testResponse) {
            console.log('API connection test:', testResponse.status);
          }
        } catch (error) {
          console.error('API connection failed:', error);
          toast.error('Cannot connect to server. Please check if the backend is running.');
        }
        
      } catch (err: any) {
        console.error('Error initializing checkout:', err);
        toast.error('Failed to load checkout');
        router.push('/cart');
      } finally {
        setLoading(false);
      }
    };

    // Listen for profile updates
    const handleProfileUpdate = () => {
      console.log('Profile updated, refreshing checkout data');
      initializeCheckout();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    initializeCheckout();
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [router]);

  const handleRemoveItem = async (productId: string) => {
    try {
      const { removeFromCart } = await import('@/actions/cart');
      
      const result = await removeFromCart({
        userId: user?.id,
        sessionId: !user?.id ? await getCartIdentifier(user).then(ci => ci.sessionId) : undefined,
        productId
      });
      
      if (result.success) {
        // Refresh cart data immediately
        const cartIdentifier = await getCartIdentifier(user);
        const updatedCartData = await getAllCarts(cartIdentifier);
        const regularProducts = updatedCartData.products.filter((item: any) => 
          item.product && item.product.category !== 'WHOLESALE'
        );
        
        if (regularProducts.length === 0) {
          toast.success('Item removed from cart');
          router.push('/cart');
          return;
        }
        
        setCart({ ...updatedCartData, products: regularProducts });
        toast.success('Item removed from cart');
      } else {
        toast.error('Failed to remove item');
      }
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error('Error removing item');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRazorpayPayment = async () => {
    try {
      setOrderLoading(true);
      
      // Validate cart before proceeding
      if (!cart || !cart.products || cart.products.length === 0) {
        throw new Error('Cart is empty');
      }
      
      // First create the order in your database
      const { createOrder } = await import('@/actions/order');
      const orderResult = await createOrder(formData, 'razorpay', null);
      
      if (!orderResult || !orderResult.orderId) {
        throw new Error('Failed to create order');
      }

      // Create Razorpay order with proper error handling
      const razorpayOrder = await createRazorpayOrderClient(total);
      
      if (!razorpayOrder || !razorpayOrder.orderId) {
        throw new Error('Failed to create Razorpay order');
      }
      
      const options = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Royal Digital Mart',
        description: 'Order Payment',
        image: '/favicon.ico',
        order_id: razorpayOrder.orderId,
        handler: async function (response: any) {
          try {
            if (!response) {
              throw new Error('Payment response is empty');
            }
            // Verify payment
            const verificationResult = await verifyRazorpayPaymentClient(response, orderResult.orderId);
            if (verificationResult && verificationResult.success) {
              toast.success('Payment successful!');
              router.push(`/order-confirmation?orderId=${orderResult.orderId}&total=${total.toFixed(2)}`);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error: any) {
            console.error('Payment handler error:', error);
            toast.error(error.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: formData.address,
          city: formData.city
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: function() {
            if (pollInterval) clearInterval(pollInterval);
            console.log('Payment modal dismissed');
            toast.error('Payment cancelled');
          },
          escape: false,
          backdropclose: false,
          confirm_close: true
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        timeout: 300
      };

      // Better Razorpay loading check with fallback
      let pollInterval: NodeJS.Timeout;
      
      const initRazorpay = () => {
        if (typeof (window as any).Razorpay === 'undefined') {
          toast.error('Payment service unavailable. Please use Cash on Delivery or try again later.');
          setPaymentMethod('cod');
          return;
        }
        
        try {
          const razorpay = new (window as any).Razorpay(options);
          
          razorpay.on('payment.failed', function (response: any) {
            if (pollInterval) clearInterval(pollInterval);
            console.error('Payment failed:', response.error);
            toast.error('Payment failed. Please try again or use Cash on Delivery.');
          });
          
          // Start polling when modal opens
          razorpay.on('payment.submit', function() {
            pollInterval = setInterval(async () => {
              try {
                const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
                const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderResult.orderId}/status`, {
                  headers: { 'Authorization': `Bearer ${token}` },
                  credentials: 'include'
                });
                
                if (statusResponse.ok) {
                  const statusData = await statusResponse.json();
                  if (statusData.paymentStatus === 'completed') {
                    clearInterval(pollInterval);
                    razorpay.close();
                    toast.success('Payment successful!');
                    router.push(`/order-confirmation?orderId=${orderResult.orderId}&total=${total.toFixed(2)}`);
                  }
                }
              } catch (error) {
                console.error('Status polling error:', error);
              }
            }, 3000);
          });
          
          razorpay.open();
        } catch (error) {
          console.error('Razorpay initialization error:', error);
          toast.error('Payment service error. Please use Cash on Delivery.');
          setPaymentMethod('cod');
        }
      };
      
      initRazorpay();
      
    } catch (error: any) {
      console.error('Razorpay payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    // Validate required fields first
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.zipCode) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // Check if cart has items
    if (!cart || !cart.products || cart.products.length === 0) {
      toast.error('Your cart is empty');
      router.push('/cart');
      return;
    }
    
    // If Razorpay payment, handle it separately
    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
      return;
    }

    setOrderLoading(true);
    try {
      const { createOrder } = await import('@/actions/order');
      const result = await createOrder(formData, paymentMethod, null);
      
      if (result && result.orderId) {
        toast.success('Order placed successfully!');
        router.push(`/order-confirmation?orderId=${result.orderId}&total=${total.toFixed(2)}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Order creation error:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  const calculateSubtotal = () => {
    if (!cart || !cart.products || cart.products.length === 0) {
      console.log('No cart or products for subtotal calculation');
      return 0;
    }
    const subtotal = cart.products.reduce((total, item) => {
      if (!item.product) {
        console.log('Skipping item without product:', item);
        return total;
      }
      return total + (item.totalPrice || 0);
    }, 0);
    console.log('Calculated subtotal:', subtotal);
    return subtotal;
  };

  const calculateShipping = () => {
    if (!cart || !cart.products || cart.products.length === 0) return 0;
    const firstProduct = cart.products[0]?.product;
    console.log('First product for shipping:', firstProduct);
    console.log('Shipping charges:', firstProduct?.shippingCharges);
    // Use 0 if shippingCharges is explicitly set to 0, otherwise use 50 as fallback only if undefined
    return firstProduct?.shippingCharges !== undefined ? firstProduct.shippingCharges : 50;
  };
  
  const calculateTax = (subtotal: number) => {
    if (!cart || !cart.products || cart.products.length === 0) return 0;
    const firstProduct = cart.products[0]?.product;
    console.log('First product for tax:', firstProduct);
    console.log('Tax rate:', firstProduct?.taxRate);
    // Use 0 if taxRate is explicitly set to 0, otherwise use 18 as fallback only if undefined
    const taxRate = firstProduct?.taxRate !== undefined ? firstProduct.taxRate : 18;
    return (subtotal * taxRate) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const tax = calculateTax(subtotal);
    return subtotal + shipping + tax;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const shipping = calculateShipping();
  const tax = calculateTax(subtotal);
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Checkout
          </h1>
          <p className="text-gray-600 mt-2">Complete your order securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping & Billing Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
                <CardDescription className="text-orange-100">
                  Where should we deliver your order?
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">PIN Code *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
                <CardDescription className="text-orange-100">
                  Choose your preferred payment option
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'razorpay' 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    onClick={() => setPaymentMethod('razorpay')}
                  >
                    <div className="text-center">
                      <CreditCard className={`h-8 w-8 mx-auto mb-2 ${
                        paymentMethod === 'razorpay' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                      <p className={`font-semibold ${
                        paymentMethod === 'razorpay' ? 'text-blue-900' : 'text-gray-900'
                      }`}>Razorpay</p>
                      <p className={`text-sm ${
                        paymentMethod === 'razorpay' ? 'text-blue-600' : 'text-gray-600'
                      }`}>Cards, UPI, Wallets</p>
                    </div>
                  </div>
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'cod' 
                        ? 'border-orange-400 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className="text-center">
                      <Banknote className={`h-8 w-8 mx-auto mb-2 ${
                        paymentMethod === 'cod' ? 'text-orange-600' : 'text-gray-600'
                      }`} />
                      <p className={`font-semibold ${
                        paymentMethod === 'cod' ? 'text-orange-900' : 'text-gray-900'
                      }`}>Cash on Delivery</p>
                      <p className={`text-sm ${
                        paymentMethod === 'cod' ? 'text-orange-600' : 'text-gray-600'
                      }`}>Pay when delivered</p>
                    </div>
                  </div>
                </div>
                {paymentMethod === 'cod' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      💰 Pay cash when your order is delivered to your doorstep. No advance payment required!
                    </p>
                  </div>
                )}
                
                {paymentMethod === 'razorpay' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💳 Secure payment with Cards, UPI, Net Banking & Wallets via Razorpay
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm sticky top-4">
              <CardHeader className="bg-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Order Summary
                </CardTitle>
                <CardDescription className="text-orange-100">
                  {cart?.products.length} item(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {cart?.products.filter(item => item.product).map((item, index) => (
                    <div key={`${item._id}-${item.size || 'no-size'}-${index}`} className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                        {item.product?.images?.[0] && (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name || 'Product'}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.product?.name || 'Unknown Product'}
                        </h4>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.quantity}x
                          </Badge>
                          {item.size && (
                            <Badge variant="outline" className="text-xs">
                              {item.size}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{item.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free Shipping' : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({cart?.products?.[0]?.product?.taxRate !== undefined ? cart.products[0].product.taxRate : 18}%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button 
                  onClick={handlePlaceOrder}
                  disabled={orderLoading || !cart || cart.products.length === 0}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {orderLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Placing Order...
                    </div>
                  ) : paymentMethod === 'razorpay' ? (
                    `Pay with Razorpay - ₹${total.toFixed(2)}`
                  ) : (
                    `Place Order - ₹${total.toFixed(2)}`
                  )}
                </Button>
                {(!cart || cart.products.length === 0) && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Your cart is empty
                  </p>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}