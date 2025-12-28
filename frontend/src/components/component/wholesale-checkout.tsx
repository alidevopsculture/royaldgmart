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
import { ShoppingBag, User, CreditCard, MapPin, Phone, Mail, Truck, Banknote } from 'lucide-react';
import { getUserData } from '@/actions/auth';
import { getAllCarts } from '@/actions/cart';
import { createRazorpayOrderClient, verifyRazorpayPaymentClient } from '@/actions/payment-client';
import { getCartIdentifier, hasCartItems } from '@/lib/cart-utils';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function WholesaleCheckout() {
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<any>(null);
  const [wholesaleSettings, setWholesaleSettings] = useState<any>(null);
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
        setFormData(prev => ({
          ...prev,
          firstName: fullUserData.firstName || '',
          lastName: fullUserData.lastName || '',
          email: fullUserData.email || '',
          phone: fullUserData.phone || '',
          address: fullUserData.address || '',
          city: fullUserData.city || '',
          state: fullUserData.state || '',
          zipCode: fullUserData.zipCode || '',
          country: fullUserData.country || 'India'
        }));
        
        const cartIdentifier = await getCartIdentifier(userData);
        const cartData = await getAllCarts(cartIdentifier);
        
        console.log('Cart data received:', cartData);
        
        // Check if cartData exists and has products
        if (!cartData || !cartData.products || cartData.products.length === 0) {
          console.log('No cart data or empty cart, redirecting...');
          toast.error('Your wholesale cart is empty');
          router.push('/wholesale-cart');
          return;
        }
        
        // Filter only wholesale products
        const wholesaleProducts = cartData.products.filter((item: any) => {
          if (!item || !item.product) {
            console.log('Skipping invalid item:', item);
            return false;
          }
          return item.product.category === 'WHOLESALE';
        });
        
        console.log('Wholesale products found:', wholesaleProducts.length);
        
        if (wholesaleProducts.length === 0) {
          console.log('No wholesale products in cart, redirecting...');
          toast.error('Your wholesale cart is empty');
          router.push('/wholesale-cart');
          return;
        }
        
        setCart({ ...cartData, products: wholesaleProducts });
        
        // Fetch wholesale settings
        const settingsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wholesale-settings`);
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          setWholesaleSettings(settings);
        }
      } catch (err: any) {
        console.error('Error initializing wholesale checkout:', err);
        toast.error('Failed to load wholesale checkout');
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRazorpayPayment = async () => {
    try {
      setOrderLoading(true);
      
      // First create the wholesale order in your database
      const { createWholesaleOrderClient } = await import('@/actions/wholesale-orders-client');
      const orderResult = await createWholesaleOrderClient(formData, 'razorpay', null);
      
      if (!orderResult || !orderResult.orderId) {
        throw new Error('Failed to create wholesale order');
      }

      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrderClient(total);
      
      const options = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Royal Digital Mart - Wholesale',
        description: 'Wholesale Order Payment',
        order_id: razorpayOrder.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            await verifyRazorpayPaymentClient(response, orderResult.orderId);
            toast.success('Wholesale payment successful!');
            router.push(`/wholesale-order-confirmation?orderId=${orderResult.orderId}&total=${total.toFixed(2)}`);
          } catch (error: any) {
            toast.error(error.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#f59e0b',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      
    } catch (error: any) {
      console.error('Razorpay wholesale payment error:', error);
      toast.error(error.message || 'Payment failed');
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
    
    // If Razorpay payment, handle it separately
    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
      return;
    }

    setOrderLoading(true);
    try {
      const { createWholesaleOrderClient } = await import('@/actions/wholesale-orders-client');
      const result = await createWholesaleOrderClient(formData, paymentMethod, null);
      toast.success('Wholesale order placed successfully!');
      router.push(`/wholesale-order-confirmation?orderId=${result.orderId}&total=${total.toFixed(2)}`);
    } catch (error: any) {
      console.error('Wholesale order error:', error);
      toast.error(error.message || 'Failed to place wholesale order');
    } finally {
      setOrderLoading(false);
    }
  };

  const calculateSubtotal = () => {
    if (!cart) return 0;
    return cart.products.reduce((total: number, item: any) => total + item.totalPrice, 0);
  };

  const calculateDiscount = (subtotal: number) => {
    if (!wholesaleSettings) return subtotal * 0.1; // fallback
    return (subtotal * wholesaleSettings.wholesaleDiscount) / 100;
  };

  const calculateShipping = () => {
    if (!wholesaleSettings) return 100; // fallback
    return wholesaleSettings.shippingCharges;
  };

  const calculateTax = (discountedSubtotal: number) => {
    if (!wholesaleSettings) return discountedSubtotal * 0.18; // fallback
    return (discountedSubtotal * wholesaleSettings.taxRate) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount(subtotal);
    const discountedSubtotal = subtotal - discount;
    const shipping = calculateShipping();
    const tax = calculateTax(discountedSubtotal);
    return discountedSubtotal + shipping + tax;
  };

  // Use cart calculations if available, otherwise calculate manually
  const getCalculations = () => {
    if (cart?.calculations) {
      return {
        subtotal: cart.calculations.subtotal,
        discount: cart.calculations.discount,
        discountedSubtotal: cart.calculations.subtotal - cart.calculations.discount,
        shipping: 100, // Fixed shipping for wholesale
        tax: cart.calculations.tax,
        total: cart.calculations.total + 100 // Add shipping to cart total
      };
    }
    
    // Fallback calculations
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount(subtotal);
    const discountedSubtotal = subtotal - discount;
    const shipping = calculateShipping();
    const tax = calculateTax(discountedSubtotal);
    const total = discountedSubtotal + shipping + tax;
    
    return { subtotal, discount, discountedSubtotal, shipping, tax, total };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 rounded-full animate-spin border-t-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wholesale checkout...</p>
        </div>
      </div>
    );
  }

  const calculations = getCalculations();
  const { subtotal, discount, discountedSubtotal, shipping, tax, total } = calculations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-900 to-orange-600 bg-clip-text text-transparent">
            Wholesale Checkout
          </h1>
          <p className="text-gray-600 mt-2">Complete your wholesale order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Wholesale Shipping Information
                </CardTitle>
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

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="cod"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-amber-600"
                    />
                    <label htmlFor="cod" className="flex items-center gap-2 cursor-pointer">
                      <Banknote className="h-4 w-4" />
                      Cash on Delivery (COD)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="razorpay"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-amber-600"
                    />
                    <label htmlFor="razorpay" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      Razorpay (Cards, UPI, Wallets)
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm sticky top-4">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Wholesale Order Summary
                </CardTitle>
                <CardDescription className="text-orange-100">
                  {cart?.products.length} wholesale item(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {cart?.products.map((item: any) => (
                    <div key={`${item._id}-${item.size}`} className="flex items-center space-x-3">
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
                          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                            {item.quantity}x
                          </Badge>
                          <Badge variant="outline" className="text-xs border-amber-300">
                            WHOLESALE
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ₹{item.totalPrice.toFixed(2)}
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
                  <div className="flex justify-between text-green-600">
                    <span>Wholesale Discount ({cart?.calculations?.discountPercentage || wholesaleSettings?.wholesaleDiscount || 10}%)</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>After Discount</span>
                    <span>₹{discountedSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({cart?.calculations?.taxPercentage || wholesaleSettings?.taxRate || 18}%)</span>
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
                  disabled={orderLoading}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {orderLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Placing Wholesale Order...
                    </div>
                  ) : paymentMethod === 'razorpay' ? (
                    `Pay with Razorpay - ₹${total.toFixed(2)}`
                  ) : (
                    `Place Wholesale Order - ₹${total.toFixed(2)}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}