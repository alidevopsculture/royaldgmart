"use client"

import { useState, useMemo, JSX, SVGProps, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import toast from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function WholesaleReturns() {
  const [search, setSearch] = useState("")
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const getAuthHeaders = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  useEffect(() => {
    fetchWholesaleReturns()
  }, [])

  const fetchWholesaleReturns = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wholesale-orders/all`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const allOrders = await response.json()
      const returnOrders = Array.isArray(allOrders) ? allOrders.filter(order => 
        order.status === 'return_initiated' || order.status === 'return_approved' || order.status === 'returned'
      ) : []
      setOrders(returnOrders)
    } catch (error) {
      console.error('Error fetching wholesale returns:', error)
      toast.error('Failed to load wholesale returns')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wholesale-orders/admin/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status, sendEmail: true })
      })
      
      if (!response.ok) throw new Error('Failed to update status')
      
      const result = await response.json()
      if (result.success) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status } : order
          )
        )
        toast.success('Wholesale return status updated and email sent')
      }
    } catch (error) {
      toast.error('Error updating wholesale return status')
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) =>
      order._id.toLowerCase().includes(search.toLowerCase()) ||
      (order.shippingDetails?.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
      (order.shippingDetails?.lastName || '').toLowerCase().includes(search.toLowerCase())
    )
  }, [orders, search])

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Wholesale Return Orders</h1>
            <p className="text-gray-600 mt-1">Manage wholesale order returns</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-gray-900">{filteredOrders.length}</div>
            <div className="text-sm text-gray-500">Total Wholesale Returns</div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 p-6">
        <Input
          type="search"
          placeholder="Search wholesale returns..."
          className="w-full sm:w-64 lg:w-80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Return Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>#{order._id.slice(-8)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.shippingDetails?.firstName} {order.shippingDetails?.lastName}</div>
                          <div className="text-sm text-gray-500">{order.shippingDetails?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>₹{order.total?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          order.status === 'return_initiated' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'return_approved' ? 'bg-green-100 text-green-800' :
                          order.status === 'returned' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'return_initiated' ? 'Return Initiated' :
                           order.status === 'return_approved' ? 'Return Approved' :
                           order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-blue-600 hover:text-blue-800 underline text-sm">
                              View Reason
                            </button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Wholesale Return Reason</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="font-medium">Order: #{order._id.slice(-8)}</p>
                                <p className="text-sm text-gray-600">Customer: {order.shippingDetails?.firstName} {order.shippingDetails?.lastName}</p>
                              </div>
                              <div>
                                <p className="font-medium mb-2">Return Reason:</p>
                                <p className="text-sm bg-gray-50 p-3 rounded border">
                                  {order.returnReason || 'No specific reason provided'}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {order.status === 'return_initiated' && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(order._id, 'return_approved')}>
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(order._id, 'confirmed')}>
                                Reject
                              </Button>
                            </>
                          )}
                          {order.status === 'return_approved' && (
                            <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => handleStatusUpdate(order._id, 'returned')}>
                              Complete Return
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <p className="text-gray-500">No wholesale return orders found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}