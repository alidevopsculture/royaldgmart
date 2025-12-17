"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Calendar, IndianRupee, Truck, Phone } from 'lucide-react';
import { getUserData } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';

export function MyWholesaleOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userData = await getUserData();
        if (!userData) {
          router.push('/auth');
          return;
        }
        setUser(userData);

        const { fetchUserWholesaleOrdersClient } = await import('@/actions/wholesale-orders-client');
        const result = await fetchUserWholesaleOrdersClient();
        
        if (result.success) {
          setOrders(result.orders);
        } else {
          toast.error('Failed to fetch wholesale orders');
        }
      } catch (error) {
        console.error('Error fetching wholesale orders:', error);
        toast.error('Failed to load wholesale orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            My Wholesale Orders
          </h1>
          <p className="text-gray-600 mt-2">Track and manage your wholesale orders</p>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No wholesale orders yet</h3>
              <p className="text-gray-500 mb-6">Start shopping wholesale products to see your orders here.</p>
              <Button onClick={() => router.push('/wholesale')}>
                Browse Wholesale Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order._id} className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order._id.slice(-8)}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Products */}
                    <div className="lg:col-span-2">
                      <h4 className="font-semibold text-gray-900 mb-3">Products</h4>
                      <div className="space-y-3">
                        {order.products.map((item: any, index: number) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            {item.product?.images?.[0] && (
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.name}
                                width={60}
                                height={60}
                                className="rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{item.product?.name}</h5>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} × ₹{item.purchasePrice} = ₹{item.totalPrice}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Order Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span>₹{order.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-₹{order.discount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping:</span>
                          <span>₹{order.shipping}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax:</span>
                          <span>₹{order.tax}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span className="text-blue-600">₹{order.total}</span>
                        </div>
                        
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Phone className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-900">Payment</span>
                          </div>
                          <p className="text-sm text-blue-800">
                            {order.paymentMethod.toUpperCase()} - {order.paymentStatus}
                          </p>
                        </div>

                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Truck className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-gray-900">Shipping</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {order.shippingDetails.firstName} {order.shippingDetails.lastName}<br />
                            {order.shippingDetails.address}<br />
                            {order.shippingDetails.city}, {order.shippingDetails.zipCode}
                          </p>
                        </div>

                        <Button 
                          variant="outline" 
                          className="w-full mt-4"
                          onClick={() => router.push(`/wholesale-shipping?orderId=${order._id}`)}
                        >
                          Shipping
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
