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
import { ShoppingBag, User, CreditCard, MapPin, Phone, Mail, Truck, Banknote, Upload, Copy, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [upiIdCopied, setUpiIdCopied] = useState(false);
  const [showUpiDetails, setShowUpiDetails] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setLoading(true);
        
        // Test API connection
        try {
          const testResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/test-auth`, {
            credentials: 'include'
          });
          console.log('API connection test:', testResponse.status);
        } catch (error) {
          console.error('API connection failed:', error);
          toast.error('Cannot connect to server. Please check if the backend is running.');
        }
        
        const userData = await getUserData();
        
        if (!userData) {
          router.push('/auth');
          return;
        }
        
        // Fetch complete profile data
        const { getUserProfile } = await import('@/actions/profile');
        const profileResult = await getUserProfile();
        
        let fullUserData = userData;
        if (profileResult.success && profileResult.user) {
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
        const cartData = await getAllCarts(cartIdentifier);
        
        // Filter out wholesale products for regular checkout
        const regularProducts = cartData.products?.filter((item: any) => 
          item.product && item.product.category !== 'WHOLESALE'
        ) || [];
        
        if (regularProducts.length === 0) {
          toast.error('Your cart is empty');
          router.push('/cart');
          return;
        }
        
        setCart({ ...cartData, products: regularProducts });
      } catch (err: any) {
        console.error('Error initializing checkout:', err);
        toast.error('Failed to load checkout');
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

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setPaymentScreenshot(file);
      toast.success('Screenshot uploaded successfully!');
    }
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText('7266849104-3@ybl');
      setUpiIdCopied(true);
      toast.success('UPI ID copied to clipboard!');
      setTimeout(() => setUpiIdCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy UPI ID');
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      setOrderLoading(true);
      
      // First create the order in your database
      const { createOrder } = await import('@/actions/order');
      const orderResult = await createOrder(formData, 'razorpay', null);
      
      if (!orderResult || !orderResult.orderId) {
        throw new Error('Failed to create order');
      }

      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrderClient(total);
      
      const options = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Royal Digital Mart',
        description: 'Order Payment',
        image: '/favicon.ico', // Your logo URL
        order_id: razorpayOrder.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            await verifyRazorpayPaymentClient(response, orderResult.orderId);
            toast.success('Payment successful!');
            router.push(`/order-confirmation?orderId=${orderResult.orderId}&total=${total.toFixed(2)}`);
          } catch (error: any) {
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
            toast.error('Payment cancelled');
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      
    } catch (error: any) {
      console.error('Razorpay payment error:', error);
      toast.error(error.message || 'Payment failed');
    } finally {
      setOrderLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    console.log('Button clicked! Payment method:', paymentMethod, 'Show UPI details:', showUpiDetails);
    
    // If Razorpay payment, handle it separately
    if (paymentMethod === 'razorpay') {
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
      
      await handleRazorpayPayment();
      return;
    }
    
    // If UPI payment and not showing details yet, show UPI payment details
    if (paymentMethod === 'upi' && !showUpiDetails) {
      console.log('Showing UPI details...');
      setShowUpiDetails(true);
      toast.success('Please complete UPI payment and upload screenshot');
      return;
    }

    // Always validate required fields since they're needed for order
    console.log('Current form data:', formData);
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.zipCode) {
      console.log('Missing fields:', {
        firstName: !formData.firstName,
        lastName: !formData.lastName,
        email: !formData.email,
        phone: !formData.phone,
        address: !formData.address,
        city: !formData.city,
        zipCode: !formData.zipCode
      });
      toast.error('Please fill all required fields');
      if (showUpiDetails) {
        setShowUpiDetails(false);
      }
      return;
    }

    // If UPI payment and showing details, check for screenshot
    if (paymentMethod === 'upi' && showUpiDetails && !paymentScreenshot) {
      toast.error('Please upload payment screenshot for UPI payment');
      return;
    }

    // Check if cart has items
    if (!cart || !cart.products || cart.products.length === 0) {
      toast.error('Your cart is empty');
      router.push('/cart');
      return;
    }

    setOrderLoading(true);
    try {
      const { createOrder } = await import('@/actions/order');
      console.log('Form data being sent:', formData);
      console.log('Placing order with:', {
        formData,
        paymentMethod,
        showUpiDetails,
        hasScreenshot: !!paymentScreenshot,
        cartItems: cart.products.length
      });
      
      const result = await createOrder(formData, paymentMethod, paymentScreenshot);
      
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
    if (!cart) return 0;
    return cart.products.reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateShipping = () => 50; // Fixed shipping cost
  const calculateTax = (subtotal: number) => subtotal * 0.18; // 18% GST

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
          {/* UPI Payment Details Modal */}
          {showUpiDetails && paymentMethod === 'upi' && (
            <div className="lg:col-span-3 mb-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Complete UPI Payment
                  </CardTitle>
                  <CardDescription className="text-green-100">
                    Pay ₹{total.toFixed(2)} using UPI and upload payment screenshot
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left side - UPI ID and QR Code */}
                    <div className="space-y-4">
                      {/* UPI ID */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">UPI ID:</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input 
                            value="7266849104-3@ybl" 
                            readOnly 
                            className="bg-gray-50 font-mono text-sm"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={copyUpiId}
                            className="flex items-center gap-1"
                          >
                            {upiIdCopied ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            {upiIdCopied ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                      </div>
                      
                      {/* QR Code */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Scan QR Code:</Label>
                        <div className="flex justify-center">
                          <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                            <Image
                              src="/images/upi_qr.jpeg"
                              alt="UPI QR Code"
                              width={200}
                              height={200}
                              className="rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side - Screenshot Upload and Instructions */}
                    <div className="space-y-4">
                      {/* Screenshot Upload */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Upload Payment Screenshot: *
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotUpload}
                            className="hidden"
                            id="screenshot-upload"
                          />
                          <label htmlFor="screenshot-upload" className="cursor-pointer">
                            <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                            <p className="text-sm text-gray-600 mb-2">
                              {paymentScreenshot ? (
                                <span className="text-green-600 font-medium">
                                  ✓ {paymentScreenshot.name}
                                </span>
                              ) : (
                                'Click to upload payment screenshot'
                              )}
                            </p>
                            <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                          </label>
                        </div>
                      </div>
                      
                      {/* Instructions */}
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Payment Instructions:</h4>
                        <ol className="text-sm text-blue-700 space-y-1">
                          <li>1. Pay <strong>₹{total.toFixed(2)}</strong> to UPI ID: <strong>7266849104-3@ybl</strong></li>
                          <li>2. Or scan the QR code with any UPI app</li>
                          <li>3. Take a screenshot of payment confirmation</li>
                          <li>4. Upload the screenshot above</li>
                          <li>5. Click "Complete Order" to finish</li>
                        </ol>
                      </div>
                      
                      {/* Back Button */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowUpiDetails(false)
                          setPaymentScreenshot(null)
                        }}
                        className="w-full"
                      >
                        ← Back to Payment Selection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Shipping & Billing Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
                <CardDescription className="text-indigo-100">
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
            {!showUpiDetails && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                  <CardDescription className="text-green-100">
                    Choose your preferred payment option
                  </CardDescription>
                </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4">
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
                      paymentMethod === 'upi' 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <div className="text-center">
                      <Phone className={`h-8 w-8 mx-auto mb-2 ${
                        paymentMethod === 'upi' ? 'text-green-600' : 'text-gray-600'
                      }`} />
                      <p className={`font-semibold ${
                        paymentMethod === 'upi' ? 'text-green-900' : 'text-gray-900'
                      }`}>UPI Payment</p>
                      <p className={`text-sm ${
                        paymentMethod === 'upi' ? 'text-green-600' : 'text-gray-600'
                      }`}>PhonePe, GPay, Paytm</p>
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
                
                {paymentMethod === 'upi' && !showUpiDetails && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      📱 Click "Place Order" to proceed with UPI payment. You'll get payment details in the next step.
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
            )}
          </div>

          {/* Order Summary */}
          <div className={showUpiDetails && paymentMethod === 'upi' ? 'lg:col-span-3' : ''}>
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm sticky top-4">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Order Summary
                </CardTitle>
                <CardDescription className="text-purple-100">
                  {cart?.products.length} item(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {cart?.products.filter(item => item.product).map((item) => (
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
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
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
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {orderLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Placing Order...
                    </div>
                  ) : paymentMethod === 'upi' && !showUpiDetails ? (
                    `Proceed to UPI Payment - ₹${total.toFixed(2)}`
                  ) : paymentMethod === 'upi' && showUpiDetails ? (
                    `Complete Order - ₹${total.toFixed(2)}`
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