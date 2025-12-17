'use client'

import { usePathname } from 'next/navigation'
import Navbar from './navbar'

export default function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Hide navbar on all admin routes
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/orders') || 
      pathname.startsWith('/products') || 
      pathname.startsWith('/customers') || 
      pathname.startsWith('/notifications') ||
      pathname.startsWith('/admin')) {
    return null
  }
  
  return <Navbar />
}