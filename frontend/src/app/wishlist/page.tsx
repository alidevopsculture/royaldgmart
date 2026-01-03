'use client'

import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import ProductCard from '@/components/functional/ProductCard'

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        const wishlistIds = JSON.parse(localStorage.getItem('wishlist') || '[]')
        console.log('Wishlist IDs from localStorage:', wishlistIds)
        
        if (wishlistIds.length === 0) {
          setLoading(false)
          return
        }

        // Fetch products by IDs
        const productPromises = wishlistIds.map(async (id: string) => {
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.royaldgmart.com'
            const url = `${apiUrl}/api/products/${id}`
            console.log(`Fetching product from: ${url}`)
            
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            })
            
            console.log(`Response for ${id}:`, response.status, response.statusText)
            
            if (response.ok) {
              const product = await response.json()
              console.log(`Product ${id} fetched:`, product)
              return product
            }
            console.warn(`Failed to fetch product ${id}:`, response.status, response.statusText)
            return null
          } catch (error) {
            console.error(`Error fetching product ${id}:`, error)
            return null
          }
        })

        const products = await Promise.all(productPromises)
        const validProducts = products.filter(product => product !== null)
        console.log('Fetched products:', validProducts)
        setWishlistProducts(validProducts)
      } catch (error) {
        console.error('Error fetching wishlist products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWishlistProducts()

    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      fetchWishlistProducts()
    }

    window.addEventListener('wishlistUpdated', handleWishlistUpdate)
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        </div>
        <div className="text-center py-16">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900">My Wishlist</h1>
        {wishlistProducts.length > 0 && (
          <span className="text-gray-500">({wishlistProducts.length} items)</span>
        )}
      </div>
      
      {/* Debug info */}
      <div className="mb-4 p-2 bg-gray-100 text-xs">
        <p>localStorage wishlist: {JSON.stringify(JSON.parse(localStorage.getItem('wishlist') || '[]'))}</p>
        <p>Products loaded: {wishlistProducts.length}</p>
        <p>Loading: {loading.toString()}</p>
      </div>
      
      {wishlistProducts.length === 0 && !loading ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love to your wishlist</p>
          <Button asChild>
            <a href="/">Continue Shopping</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {wishlistProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}