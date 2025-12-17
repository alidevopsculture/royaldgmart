'use client'

export const dynamic = 'force-dynamic'

import Link from "next/link";
import { useState, useEffect } from "react";
import { MountainIcon, ShoppingCart, User, Info, Phone, HomeIcon, Package, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import SearchBar from "../functional/SearchBar";
import Image from "next/image";
import { getAllCarts, transferGuestCartToUser } from "@/actions/cart";
import { usePathname } from "next/navigation";
import { getCartIdentifier, getCartItemCount, clearGuestSession, getCurrentGuestSession, debugCartState } from "@/lib/cart-utils";
import { getUserData } from "@/actions/auth";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [cartItemCount, setCartItemCount] = useState<number>(0);
  const [wholesaleCartItemCount, setWholesaleCartItemCount] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getUserData();
        setUser(userData);
        
        if (userData) {
          // Handle cart transfer if user just logged in and has guest cart
          const guestSessionId = getCurrentGuestSession();
          if (guestSessionId) {
            try {
              await transferGuestCartToUser(guestSessionId, userData.id);
              clearGuestSession();
              setCartItemCount(0);
            } catch (error) {
              console.error('Failed to transfer guest cart:', error);
              // Clear guest session even if transfer fails to prevent repeated attempts
              clearGuestSession();
            }
          }
        }
        await fetchCartData(userData);

      } catch (error) {
        console.error('Error loading user data:', error);
        setUser(null);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadUserData();
    
    // Listen for auth changes
    const handleAuthChange = () => {
      loadUserData();
    };
    
    window.addEventListener('authChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
    };
  }, []);

  // Fetch cart data whenever the pathname changes
  useEffect(() => {
    if (isLoaded) {
      fetchCartData(user);
    }
  }, [pathname, isLoaded, user]);
  
  // Listen for cart and wishlist updates
  useEffect(() => {
    const handleCartUpdate = async (event: any) => {
      // Always fetch fresh cart data instead of just incrementing
      if (isLoaded) {
        await fetchCartData(user);
      }
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [user, isLoaded]);

  const fetchCartData = async (userData: any) => {
    try {
      const cartIdentifier = await getCartIdentifier(userData);
      
      // Fetch cart data
      const cartData: any = await getAllCarts(cartIdentifier);
      debugCartState(cartData, 'fetchCartData');
      
      // Count regular cart items (non-wholesale)
      const regularCount = cartData.products?.filter((item: any) => 
        item.product && item.product.category !== 'WHOLESALE'
      ).reduce((total: number, item: any) => total + (item.quantity || 0), 0) || 0;
      setCartItemCount(regularCount);
      
      // Count wholesale cart items
      const wholesaleCount = cartData.products?.filter((item: any) => 
        item.product && item.product.category === 'WHOLESALE'
      ).reduce((total: number, item: any) => total + (item.quantity || 0), 0) || 0;
      setWholesaleCartItemCount(wholesaleCount);
    } catch (error) {
      console.error("Error fetching cart data:", error);
      setCartItemCount(0);
      setWholesaleCartItemCount(0);
    }
  };
  


  // Bottom scrollable navigation categories
  const navCategories = [
    "SAREE", "WHOLESALE","MEN SUITING SHIRTING","MEN COMBOS PACKS","WOMEN STICHED SUITS",
    "WOMEN UNSTICHED SUITS", "LEHNGAS", "WOMENS OTHERS", "BED SHEETS",
    "CURTAINS", "BLANKETS" , "MOSQUITO NETS"
  ];

  const renderCategoryLink = (category: string) => {
    if (category === "SAREE") {
      return (
        <Link key={category} href="/saree" prefetch={false}
          className="mx-1 px-3 py-1 rounded-md hover:bg-gray-100 text-gray-800 font-semibold text-sm transition"
        >
          {category}
        </Link>
      );
    }
    if (category === "BESTSELLERS") {
      return (
        <Link key={category} href="/men" prefetch={false}
          className="mx-1 px-3 py-1 rounded-lg bg-black text-white font-bold shadow"
          aria-current="page"
        >
          {category}
        </Link>
      );
    }
    if (category === "MEN COMBOS PACKS") {
      return (
        <Link key={category} href="/men-combos-packs" prefetch={false}
          className="mx-1 px-3 py-1 rounded-lg bg-amber-600 text-white font-bold"
        >
          {category}
        </Link>
      );
    }
    if (category === "WHOLESALE") {
      return (
        <Link key={category} href="/wholesale" prefetch={false}
          className="mx-1 px-3 py-1 rounded-lg bg-amber-600 text-white font-bold"
        >
          {category}
        </Link>
      );
    }
    if (category === "NEW") {
      return (
        <Link key={category} href="/new" prefetch={false}
          className="mx-1 px-3 py-1 rounded-lg bg-amber-600 text-white font-bold"
        >
          {category}
        </Link>
      );
    }
    return (
      <Link key={category} href={`/${category.replace(/\s+/g, "-").toLowerCase()}`} prefetch={false}
        className="mx-1 px-3 py-1 rounded-md hover:bg-gray-100 text-gray-800 font-semibold text-sm transition"
      >
        {category}
      </Link>
    );
  };

  // Responsive mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="bg-white shadow-lg border-b border-gray-100 h-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 select-none sticky top-0 z-50">
      {/* MAIN ROW: LOGO - SEARCH - ICONS (desktop), mobile layout (mobile) */}
      <div className="py-2 px-2 sm:px-4 max-w-7xl mx-auto w-full">
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-2 group"
            prefetch={false}
            aria-label="Home"
          >
            <div className="rounded-lg transition duration-300 bg-gradient-to-r from-gray-900 to-gray-700 group-hover:from-gray-800 group-hover:to-gray-600">
              <Image
                src="/images/royal_logo.png"
                alt="Royal DG Mart Logo"
                width={120}
                height={40}
                className="object-contain w-[120px] h-auto"
              />
            </div>
          </Link>
          {/* Search Bar */}
          <div className="flex-1 px-4 sm:px-8">
            <SearchBar />
          </div>
          {/* Icons */}
          <div className="flex gap-2 sm:gap-3 items-center ml-2 sm:ml-6">
            <Link href="/" className="rounded-full hover:bg-gray-100 p-2 transition" title="Home" prefetch={false}>
              <HomeIcon className="w-6 h-6 text-gray-700" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>

            <a href="https://wa.me/917266849104" className="rounded-full hover:bg-green-100 p-2 transition" title="WhatsApp" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-6 h-6 text-green-600" aria-hidden="true" />
              <span className="sr-only">WhatsApp</span>
            </a>
            <Link href={user ? "/profile" : "/auth"} className="rounded-full hover:bg-gray-100 p-1.5 transition" title="Account" prefetch={false}>
              <Avatar className="h-8 w-8 bg-gray-100 border border-gray-300">
                <AvatarImage src="/placeholder-user.jpg" alt={`${user?.username || 'User'}'s avatar`} />
                <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold">
                  {user?.username?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">User Profile</span>
            </Link>
            <Link href="/cart" className="rounded-full hover:bg-gray-100 p-2 transition relative" title="Cart" prefetch={false}>
              <ShoppingCart className="w-6 h-6 text-gray-700" aria-hidden="true" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold select-none" aria-live="polite">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
              <span className="sr-only">Shopping Cart with {cartItemCount} items</span>
            </Link>
            <Link href="/wholesale-cart" className="rounded-full hover:bg-amber-100 p-2 transition relative" title="Wholesale Cart" prefetch={false}>
              <Package className="w-6 h-6 text-amber-600" aria-hidden="true" />
              {wholesaleCartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold select-none" aria-live="polite">
                  {wholesaleCartItemCount > 99 ? "99+" : wholesaleCartItemCount}
                </span>
              )}
              <span className="sr-only">Wholesale Cart with {wholesaleCartItemCount} items</span>
            </Link>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="flex lg:hidden items-center justify-between relative">
          {/* Home Button - Left */}
          <Link href="/" className="rounded-full hover:bg-gray-100 p-2 transition" title="Home" prefetch={false}>
            <HomeIcon className="w-6 h-6 text-gray-700" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
          
          {/* Logo - Center */}
          <Link
            href="/"
            className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 group"
            prefetch={false}
            aria-label="Home"
          >
            <div className="rounded-lg transition duration-300 bg-gradient-to-r from-gray-900 to-gray-700 group-hover:from-gray-800 group-hover:to-gray-600">
              <Image
                src="/images/royal_logo.png"
                alt="Royal DG Mart Logo"
                width={100}
                height={33}
                className="object-contain w-[100px] h-auto"
              />
            </div>
          </Link>
          
          {/* Menu Button - Right */}
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 active:scale-95"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <svg className="w-6 h-6 text-gray-700 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
        </div>
      </div>

      {/* Animated Mobile Menu Drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        <div className={`bg-white w-full max-w-sm h-full shadow-2xl flex flex-col border-l border-gray-200 transform transition-all duration-300 ease-out ml-auto ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-xl text-gray-800">Menu</span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)} 
              className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 active:scale-95" 
              aria-label="Close menu"
            >
              <svg className="w-6 h-6 text-gray-600 transition-transform duration-200 hover:rotate-90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Search Section */}
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <SearchBar />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            {/* Quick Actions */}
            <div className="p-6 space-y-4">
              <Link 
                href="/" 
                className={`flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group transform ${mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                style={{ transitionDelay: mobileMenuOpen ? '100ms' : '0ms' }}
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <HomeIcon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-semibold text-gray-800">Home</span>
              </Link>



              <a 
                href="https://wa.me/917266849104" 
                className={`flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group transform ${mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                style={{ transitionDelay: mobileMenuOpen ? '150ms' : '0ms' }}
                target="_blank" 
                rel="noopener noreferrer"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-semibold text-gray-800">WhatsApp</span>
              </a>

              <Link 
                href={user ? "/profile" : "/auth"}
                className={`flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group transform ${mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                style={{ transitionDelay: mobileMenuOpen ? '200ms' : '0ms' }}
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder-user.jpg" alt={`${user?.username || 'User'}'s avatar`} />
                    <AvatarFallback className="bg-purple-200 text-purple-700 text-xs font-bold">
                      {user?.username?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="font-semibold text-gray-800">{user ? 'Profile' : 'Sign In'}</span>
              </Link>

              <Link 
                href="/cart" 
                className={`flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group relative transform ${mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                style={{ transitionDelay: mobileMenuOpen ? '250ms' : '0ms' }}
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors relative">
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between flex-1">
                  <span className="font-semibold text-gray-800">Cart</span>
                  {cartItemCount > 0 && (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">
                      {cartItemCount} items
                    </span>
                  )}
                </div>
              </Link>

              <Link 
                href="/wholesale-cart" 
                className={`flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group relative transform ${mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                style={{ transitionDelay: mobileMenuOpen ? '300ms' : '0ms' }}
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors relative">
                  <Package className="w-5 h-5 text-amber-600" />
                  {wholesaleCartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                      {wholesaleCartItemCount > 9 ? "9+" : wholesaleCartItemCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between flex-1">
                  <span className="font-semibold text-gray-800">Wholesale Cart</span>
                  {wholesaleCartItemCount > 0 && (
                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-bold">
                      {wholesaleCartItemCount} items
                    </span>
                  )}
                </div>
              </Link>
            </div>

            {/* Categories Section */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <div className="p-6">
                <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Shop Categories</h3>
                <div className="grid grid-cols-1 gap-2">
                  {navCategories.map((category) => (
                    <Link
                      key={category}
                      href={`/${category.replace(/\s+/g, "-").toLowerCase()}`}
                      className="block p-4 rounded-xl bg-white hover:bg-gray-50 transition-colors font-medium text-gray-700 hover:text-gray-900 shadow-sm border border-gray-100"
                      prefetch={false}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Royal Digital Mart</p>
              <p className="text-xs text-gray-500">Premium Fashion & Lifestyle</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop categories navigation bar */}
      <nav className="w-full bg-white hidden lg:block">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-2 whitespace-nowrap py-1">
          {navCategories.map(renderCategoryLink)}
        </div>
      </nav>
    </header>
  );
}