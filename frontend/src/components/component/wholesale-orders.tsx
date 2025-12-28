"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import toast from "react-hot-toast"
import { cleanDropdownText } from "@/lib/text-utils"

export function WholesaleOrders() {
  const [search, setSearch] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortColumn, setSortColumn] = useState("_id")
  const [sortDirection, setSortDirection] = useState("desc")
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adminUpdates, setAdminUpdates] = useState<{[key: string]: {status: string, reason?: string}}>({})
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    // Load admin updates from localStorage
    const savedUpdates = localStorage.getItem('adminWholesaleUpdates')
    if (savedUpdates) {
      setAdminUpdates(JSON.parse(savedUpdates))
    }
    fetchOrders()
    
    // Listen for user profile updates
    const syncInterval = setInterval(() => {
      const syncData = localStorage.getItem('adminWholesaleSync')
      if (syncData) {
        const { timestamp, orderId, status, reason } = JSON.parse(syncData)
        // Only apply if it's a recent update (within last 5 seconds)
        if (Date.now() - timestamp < 5000) {
          setOrders(prev => {
            const updated = prev.map(order => {
              if (order._id === orderId) {
                return { 
                  ...order, 
                  status, 
                  cancelReason: status === 'cancelled' ? reason : order.cancelReason,
                  returnReason: status === 'returned' ? reason : order.returnReason
                }
              }
              return order
            })
            // Save updated orders back to localStorage
            localStorage.setItem('wholesaleOrders', JSON.stringify(updated))
            return updated
          })
          // Update admin updates as well
          const newAdminUpdates = { ...adminUpdates, [orderId]: { status, reason } }
          setAdminUpdates(newAdminUpdates)
          localStorage.setItem('adminWholesaleUpdates', JSON.stringify(newAdminUpdates))
          // Clear the sync data
          localStorage.removeItem('adminWholesaleSync')
          toast.success(`Order ${orderId.slice(-8)} ${status} by customer`)
        }
      }
    }, 1000)
    
    return () => clearInterval(syncInterval)
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      // Try API first
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/wholesale-orders`, {
        credentials: 'include'
      })
      
      let ordersData = []
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.orders) {
          ordersData = result.orders
        }
      }
      
      // If no API data, use localStorage or create mock data
      if (ordersData.length === 0) {
        const savedOrders = localStorage.getItem('wholesaleOrders')
        if (savedOrders) {
          ordersData = JSON.parse(savedOrders)
        } else {
          // Create initial mock data
          ordersData = [
            {
              _id: '68ebf1d9d76ca139cb651fb9',
              user: { username: 'alimurtaza007', email: 'iali.murtaza007@gmail.com' },
              shippingDetails: {
                firstName: 'Ali',
                lastName: 'Murtaza',
                email: 'iali.murtaza007@gmail.com',
                phone: '+1234567890'
              },
              total: 684.10,
              discount: 55.00,
              paymentMethod: 'cod',
              paymentStatus: 'pending',
              status: 'pending',
              createdAt: new Date().toISOString(),
              products: [{
                product: { name: 'asdfa', images: [] },
                quantity: 1,
                totalPrice: 550.00
              }]
            },
            {
              _id: 'cb6522a2',
              user: { username: 'alimurtaza007', email: 'iali.murtaza007@gmail.com' },
              shippingDetails: {
                firstName: 'Ali',
                lastName: 'Murtaza',
                email: 'iali.murtaza007@gmail.com',
                phone: '+1234567890'
              },
              total: 684.10,
              discount: 55.00,
              paymentMethod: 'cod',
              paymentStatus: 'pending',
              status: 'pending',
              createdAt: new Date().toISOString(),
              products: [{
                product: { name: 'asdfa', images: [] },
                quantity: 1,
                totalPrice: 550.00
              }]
            }
          ]
          localStorage.setItem('wholesaleOrders', JSON.stringify(ordersData))
        }
      }
      
      // Apply saved admin updates
      const updatedOrders = ordersData.map((order: any) => {
        const update = adminUpdates[order._id]
        if (update) {
          return {
            ...order,
            status: update.status,
            cancelReason: update.status === 'cancelled' ? update.reason : order.cancelReason,
            returnReason: update.status === 'returned' ? update.reason : order.returnReason
          }
        }
        return order
      })
      
      setOrders(updatedOrders)
    } catch (error) {
      console.error('Network error:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, status: string) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://www.royaldgmart.com'}/api/wholesale-orders/admin/${orderId}/status`
    console.log('Updating wholesale order status:', { orderId, status, apiUrl })
    
    try {
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      })
      
      console.log('Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const result = await response.json()
      console.log('Update result:', result)
      
      if (result.success) {
        // Update local state after successful API call
        setOrders(prevOrders => {
          const updatedOrders = prevOrders.map(order => 
            order._id === orderId ? { ...order, status } : order
          )
          localStorage.setItem('wholesaleOrders', JSON.stringify(updatedOrders))
          return updatedOrders
        })
        
        // Save admin updates
        const newUpdates = { ...adminUpdates, [orderId]: { status } }
        setAdminUpdates(newUpdates)
        localStorage.setItem('adminWholesaleUpdates', JSON.stringify(newUpdates))
        
        // Sync with user profile
        localStorage.setItem('userOrdersSync', JSON.stringify({ 
          timestamp: Date.now(), 
          orderId, 
          status,
          type: 'wholesale'
        }))
        
        toast.success('Wholesale order status updated')
      } else {
        toast.error(result.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Status update error:', error)
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this wholesale order?')) {
      return
    }
    
    // Remove from local state
    setOrders(prev => {
      const filtered = prev.filter(order => order._id !== orderId)
      localStorage.setItem('wholesaleOrders', JSON.stringify(filtered))
      return filtered
    })
    
    // Remove from admin updates
    const newUpdates = { ...adminUpdates }
    delete newUpdates[orderId]
    setAdminUpdates(newUpdates)
    localStorage.setItem('adminWholesaleUpdates', JSON.stringify(newUpdates))
    
    // Sync deletion with user profile
    localStorage.setItem('adminDeleteSync', JSON.stringify({ 
      timestamp: Date.now(), 
      orderId, 
      type: 'wholesale',
      action: 'delete'
    }))
    
    // Also remove from user wholesale orders localStorage
    const userOrders = localStorage.getItem('userWholesaleOrders')
    if (userOrders) {
      const userOrdersData = JSON.parse(userOrders)
      const filteredUserOrders = userOrdersData.filter((order: any) => order._id !== orderId)
      localStorage.setItem('userWholesaleOrders', JSON.stringify(filteredUserOrders))
    }
    
    // Try to sync with backend
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/wholesale-orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
    } catch (error) {
      console.log('Backend delete sync failed, using local storage')
    }
    
    toast.success('Wholesale order deleted')
  }

  const filteredOrders = useMemo(() => {
    let filtered = orders.filter((order) => {
      if (selectedStatus === "all") return true
      return order.status === selectedStatus
    })
    if (search) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(search.toLowerCase()) ||
          (order.user?.username || '').toLowerCase().includes(search.toLowerCase()),
      )
    }
    return filtered.sort((a:any, b:any) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1
      if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [orders, search, selectedStatus, sortColumn, sortDirection])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Wholesale Orders</h1>
            <p className="text-gray-600 mt-1">Manage wholesale customer orders</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={fetchOrders}
              variant="outline"
              size="sm"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-amber-600 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Refresh
            </Button>
            <div className="text-right">
              <div className="text-2xl font-semibold text-gray-900">{filteredOrders.length}</div>
              <div className="text-sm text-gray-500">Total Orders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <Input
              type="search"
              placeholder="Search wholesale orders..."
              className="w-full sm:w-64 lg:w-80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Status Filter
                </Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-xl border-white/20">
                  <DropdownMenuLabel>{cleanDropdownText('Filter by status')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={selectedStatus === "all"}
                    onCheckedChange={() => setSelectedStatus("all")}
                  >
                    {cleanDropdownText('All')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedStatus === "pending"}
                    onCheckedChange={() => setSelectedStatus("pending")}
                  >
                    {cleanDropdownText('Pending')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedStatus === "confirmed"}
                    onCheckedChange={() => setSelectedStatus("confirmed")}
                  >
                    {cleanDropdownText('Confirmed')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedStatus === "shipped"}
                    onCheckedChange={() => setSelectedStatus("shipped")}
                  >
                    {cleanDropdownText('Shipped')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedStatus === "delivered"}
                    onCheckedChange={() => setSelectedStatus("delivered")}
                  >
                    {cleanDropdownText('Delivered')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedStatus === "cancelled"}
                    onCheckedChange={() => setSelectedStatus("cancelled")}
                  >
                    {cleanDropdownText('Cancelled')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedStatus === "returned"}
                    onCheckedChange={() => setSelectedStatus("returned")}
                  >
                    {cleanDropdownText('Returned')}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-700">Loading wholesale orders...</p>
                    <p className="text-sm text-gray-500">Fetching the latest order data</p>
                  </div>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="cursor-pointer font-semibold text-gray-700" onClick={() => handleSort("_id")}>
                      Order ID
                      {sortColumn === "_id" && (
                        <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </TableHead>
                    <TableHead className="hidden md:table-cell font-semibold text-gray-700">Customer</TableHead>
                    <TableHead className="hidden lg:table-cell cursor-pointer font-semibold text-gray-700" onClick={() => handleSort("createdAt")}>
                      Date
                      {sortColumn === "createdAt" && (
                        <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </TableHead>
                    <TableHead className="cursor-pointer text-right font-semibold text-gray-700" onClick={() => handleSort("total")}>
                      Total
                      {sortColumn === "total" && (
                        <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </TableHead>
                    <TableHead className="hidden lg:table-cell font-semibold text-gray-700">Payment</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="hidden xl:table-cell font-semibold text-gray-700">Cancel/Return</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order._id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <span className="font-mono text-sm text-gray-900">
                            #W{order._id.slice(-8)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <div className="font-medium text-gray-900">{order.shippingDetails?.firstName} {order.shippingDetails?.lastName}</div>
                            <div className="text-sm text-gray-500">{order.shippingDetails?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-gray-600 text-sm">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="font-semibold text-gray-900">
                            ₹{order.total?.toFixed(2) || '0.00'}
                          </div>
                          {order.discount > 0 && (
                            <div className="text-xs text-amber-600">
                              -{order.discount}% discount
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {order.paymentMethod === 'cod' ? 'COD' :
                               order.paymentMethod === 'card' ? 'Card' :
                               order.paymentMethod === 'upi' ? 'UPI' : 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.paymentStatus === 'completed' ? 'Paid' :
                               order.paymentStatus === 'pending' ? 'Pending' :
                               order.paymentStatus === 'failed' ? 'Failed' : 'Unknown'}
                            </div>
                            {order.paymentScreenshot && (
                              <div className="mt-1">
                                <img
                                  src={`${process.env.NEXT_PUBLIC_API_URL || 'https://www.royaldgmart.com'}/uploads/payment-screenshots/${order.paymentScreenshot}`}
                                  alt="Payment Screenshot"
                                  className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => {
                                    const imageUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://www.royaldgmart.com'}/uploads/payment-screenshots/${order.paymentScreenshot}`
                                    setSelectedImage(imageUrl)
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            order.status === 'returned' ? 'bg-orange-100 text-orange-800' :
                            order.status === 'return_approved' ? 'bg-green-100 text-green-800' :
                            order.status === 'return_initiated' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status === 'return_initiated' ? 'Return Initiated' :
                             order.status === 'return_approved' ? 'Return Approved' :
                             order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {order.cancelReason && (
                            <div className="text-xs space-y-2">
                              <div className="font-medium text-red-600">Cancel Request</div>
                              <div className="text-gray-500 truncate max-w-32" title={order.cancelReason}>
                                {order.cancelReason}
                              </div>
                              {order.status !== 'cancelled' && (
                                <div className="flex gap-1">
                                  <Button size="sm" className="h-6 px-2 text-xs bg-red-600 hover:bg-red-700" onClick={() => handleStatusUpdate(order._id, 'cancelled')}>
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => {
                                    const updatedOrders = orders.map(o => o._id === order._id ? {...o, cancelReason: null} : o)
                                    setOrders(updatedOrders)
                                    localStorage.setItem('wholesaleOrders', JSON.stringify(updatedOrders))
                                    toast.success('Cancel request rejected')
                                  }}>
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                          {order.returnReason && (
                            <div className="text-xs space-y-2">
                              <div className="font-medium text-orange-600">Return Request</div>
                              <div className="text-gray-500 truncate max-w-32" title={order.returnReason}>
                                {order.returnReason}
                              </div>
                              {order.status === 'return_initiated' ? (
                                <div className="flex gap-1">
                                  <Button size="sm" className="h-6 px-2 text-xs bg-orange-600 hover:bg-orange-700" onClick={() => handleStatusUpdate(order._id, 'returned')}>
                                    Complete
                                  </Button>
                                </div>
                              ) : order.status !== 'returned' && order.status !== 'return_approved' && order.status !== 'return_initiated' && (
                                <div className="flex gap-1">
                                  <Button size="sm" className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(order._id, 'return_approved')}>
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => {
                                    const updatedOrders = orders.map(o => o._id === order._id ? {...o, returnReason: null} : o)
                                    setOrders(updatedOrders)
                                    localStorage.setItem('wholesaleOrders', JSON.stringify(updatedOrders))
                                    toast.success('Return request rejected')
                                  }}>
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                          {!order.cancelReason && !order.returnReason && (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Update Status
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuLabel>{cleanDropdownText('Update Status')}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem onClick={() => handleStatusUpdate(order._id, 'pending')}>{cleanDropdownText('Pending')}</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem onClick={() => handleStatusUpdate(order._id, 'confirmed')}>{cleanDropdownText('Confirmed')}</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem onClick={() => handleStatusUpdate(order._id, 'shipped')}>{cleanDropdownText('Shipped')}</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem onClick={() => handleStatusUpdate(order._id, 'delivered')}>{cleanDropdownText('Delivered')}</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem onClick={() => handleStatusUpdate(order._id, 'return_approved')}>{cleanDropdownText('Return Approved')}</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem onClick={() => handleStatusUpdate(order._id, 'return_initiated')}>{cleanDropdownText('Return Initiated')}</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem onClick={() => handleStatusUpdate(order._id, 'rejected')}>{cleanDropdownText('Rejected')}</DropdownMenuCheckboxItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleDeleteOrder(order._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <p className="text-gray-500">No wholesale orders found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
        </div>
      </div>

      {/* Payment Screenshot Popup */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <Image
                src={selectedImage}
                alt="Payment Screenshot"
                width={800}
                height={600}
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}