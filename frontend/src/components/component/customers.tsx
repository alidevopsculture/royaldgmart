"use client"

import { useState, useMemo, JSX, SVGProps, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import Link from "next/link"
import toast from "react-hot-toast"

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: string;
  joinedDate: string;
}

export function Customers() {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [filters, setFilters] = useState({
    minOrders: 0,
    minSpent: 0,
  })
  const [customersData, setCustomersData] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { getCustomers } = await import('@/actions/dashboard')
      const result = await getCustomers()
      
      if (result.success) {
        setCustomersData(result.customers);
      } else {
        toast.error(result.error || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (customerId: string) => {
    const customer = customersData.find(c => c._id === customerId)
    if (customer) {
      alert(`Customer Profile:\n\nName: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nTotal Orders: ${customer.totalOrders}\nTotal Spent: ₹${customer.totalSpent}\nJoined: ${customer.joinedDate}`)
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    
    try {
      setCustomersData(prev => prev.filter(customer => customer._id !== customerId))
      toast.success('Customer deleted successfully')
    } catch (error) {
      toast.error('Error deleting customer')
    }
  }

  const customers = useMemo(() => {
    return customersData
      .filter((customer) => {
        return (
          customer.name.toLowerCase().includes(search.toLowerCase()) ||
          customer.email.toLowerCase().includes(search.toLowerCase())
        )
      })
      .filter((customer) => {
        return customer.totalOrders >= filters.minOrders
      })
      .filter((customer) => {
        return parseFloat(customer.totalSpent) >= filters.minSpent
      })
      .sort((a:any, b:any) => {
        if (sortOrder === "asc") {
          return a[sortBy] > b[sortBy] ? 1 : -1
        } else {
          return a[sortBy] < b[sortBy] ? 1 : -1
        }
      })
  }, [customersData, search, sortBy, sortOrder, filters])

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Customer Management</h1>
            <p className="text-gray-600 mt-1">Manage your customers</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-gray-900">{customers.length}</div>
            <div className="text-sm text-gray-500">Total Customers</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <Input
              type="search"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 lg:w-80"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Filters</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="grid gap-4 p-4">
                    <div className="grid gap-2">
                      <Label htmlFor="min-orders">Minimum Orders</Label>
                      <Input
                        id="min-orders"
                        type="number"
                        min="0"
                        value={filters.minOrders}
                        onChange={(e) => setFilters({ ...filters, minOrders: Number(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="min-spent">Minimum Spent</Label>
                      <Input
                        id="min-spent"
                        type="number"
                        min="0"
                        value={filters.minSpent}
                        onChange={(e) => setFilters({ ...filters, minSpent: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ListOrderedIcon className="h-4 w-4 mr-2" />
                  Sort Options
                </Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value)}>
                    <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="email">Email</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="totalOrders">Total Orders</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="totalSpent">Total Spent</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={sortOrder} onValueChange={(value) => setSortOrder(value)}>
                    <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Customers Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100">
                  <TableHead className="font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold text-gray-700">Email</TableHead>
                  <TableHead className="hidden lg:table-cell font-semibold text-gray-700">Phone</TableHead>
                  <TableHead className="font-semibold text-gray-700">Orders</TableHead>
                  <TableHead className="font-semibold text-gray-700">Spent</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        <p className="text-gray-500">Loading customers...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <TableRow key={customer._id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-sm">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">#{customer._id.slice(-6)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-gray-600">{customer.email}</TableCell>
                      <TableCell className="hidden lg:table-cell text-gray-600">{customer.phone}</TableCell>
                      <TableCell>
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {customer.totalOrders} orders
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-gray-900">
                          ₹{customer.totalSpent}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleViewProfile(customer._id)}>
                            Profile
                          </Button>
                          <Link href="/orders">
                            <Button variant="outline" size="sm">
                              View Orders
                            </Button>
                          </Link>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteCustomer(customer._id)}>
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="text-center py-8">
                        <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No customers found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        </div>
      </div>
    </div>
  )
}

function FilterIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

function ListOrderedIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="10" x2="21" y1="6" y2="6" />
      <line x1="10" x2="21" y1="12" y2="12" />
      <line x1="10" x2="21" y1="18" y2="18" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  )
}

function SearchIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function UsersIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}