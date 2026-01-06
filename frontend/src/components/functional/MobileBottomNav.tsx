'use client'

import { Home, MessageCircle, User, ShoppingCart, Heart, Package2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserData } from '@/actions/auth'
import { getAllCarts } from '@/actions/cart'
import { getCartIdentifier, getCartItemCount } from '@/lib/cart-utils'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [cartItemCount, setCartItemCount] = useState<number>(0)
  const [wholesaleCartItemCount, setWholesaleCartItemCount] = useState<number>(0)


  useEffect(() => {
    const loadData = async () => {
      const userData = await getUserData()
      setUser(userData)
      
      const cartIdentifier = await getCartIdentifier(userData)
      const cartData = await getAllCarts(cartIdentifier)
      
      // Count regular cart items (non-wholesale)
      const regularCount = cartData.products?.filter((item: any) => 
        item.product && item.product.category !== 'WHOLESALE'
      ).reduce((total: number, item: any) => total + (item.quantity || 0), 0) || 0
      setCartItemCount(regularCount)
      
      // Count wholesale cart items
      const wholesaleCount = cartData.products?.filter((item: any) => 
        item.product && item.product.category === 'WHOLESALE'
      ).reduce((total: number, item: any) => total + (item.quantity || 0), 0) || 0
      setWholesaleCartItemCount(wholesaleCount)
    }
    
    loadData()
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      loadData()
    }
    
    window.addEventListener('cartUpdated', handleCartUpdate)
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/wholesale', icon: Package2, label: 'Wholesale', isWholesale: true },
    { href: user ? '/profile' : '/auth', icon: User, label: user ? 'Profile' : 'Login' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartItemCount > 0 ? cartItemCount : undefined },
    { href: '/wholesale-cart', icon: Package2, label: 'W-Cart', badge: wholesaleCartItemCount > 0 ? wholesaleCartItemCount : undefined, isWholesale: true }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 min-w-0 relative ${
                isActive ? (item.isWholesale ? 'text-amber-600' : 'text-orange-500') : 'text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 mb-1 ${item.isWholesale ? 'text-amber-600' : ''}`} />
                {item.badge && item.badge > 0 && (
                  <span className={`absolute -top-2 -right-2 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${
                    item.isWholesale ? 'bg-amber-500' : 'bg-red-500'
                  }`}>
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}