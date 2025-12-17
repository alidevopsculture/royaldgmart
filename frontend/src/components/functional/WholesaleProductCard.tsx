'use client'

import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { ShoppingCart, Star } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function WholesaleProductCard({ product }: { product: any }) {
  if (!product) {
    return <div className="w-full bg-gray-100 p-4">Product not available</div>;
  }

  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const productImages = Array.isArray(product.images) ? product.images : [];
  const router = useRouter()
  
  const discountPercentage = product.discountPercentage || 0
  const discountedPrice = product.price - (product.price * discountPercentage / 100)
  const rating = 4.5
  const reviewCount = product._id ? (parseInt(product._id.slice(-2), 16) % 50) + 20 : 25
  
  const handleCardClick = () => {
    router.push(`/product-view/${product._id}?category=${encodeURIComponent(product.category || '')}`)
  }

  return (
    <div className="w-full bg-white overflow-hidden cursor-pointer"
         onClick={handleCardClick}
         onMouseEnter={() => {
           if (productImages.length > 1) {
             setCurrentImageIndex(1)
           }
         }}
         onMouseLeave={() => setCurrentImageIndex(0)}>
      
      <div className="relative w-full aspect-[3/4] bg-gray-50 overflow-hidden">
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            {discountPercentage}%
          </div>
        )}
        
        <div className="absolute top-3 right-3 z-10 bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
          W
        </div>
        
        <button
          className="absolute top-12 right-3 z-10 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: 'rgb(147, 61, 22)' }}
          onClick={async (e) => {
            e.stopPropagation();
            setIsAddingToCart(true);
            
            try {
              const { getUserData } = await import('@/actions/auth');
              const { addProductToCartClient } = await import('@/actions/cart-client');
              const { getOrCreateGuestSession } = await import('@/lib/cart-utils');
              
              const user = await getUserData();
              
              let result;
              if (user && user.id) {
                result = await addProductToCartClient({
                  userId: user.id,
                  productId: product._id,
                  quantity: 1
                });
              } else {
                const sessionId = await getOrCreateGuestSession();
                result = await addProductToCartClient({
                  sessionId,
                  productId: product._id,
                  quantity: 1
                });
              }
              
              if (result.success) {
                toast.success('Product added to wholesale cart!');
                window.dispatchEvent(new CustomEvent('cartUpdated'));
              } else {
                toast.error(result.error || 'Failed to add to wholesale cart');
              }
            } catch (error) {
              toast.error('Error adding to wholesale cart');
              console.error('Error adding to wholesale cart:', error);
            } finally {
              setIsAddingToCart(false);
            }
          }}
          disabled={isAddingToCart}
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
        
        {product.isNew && (
          <div className="absolute top-12 left-3 z-10 bg-black text-white px-2 py-1 rounded text-xs font-bold">
            NEW
          </div>
        )}
        
        <img
          src={productImages.length > 0 ? productImages[currentImageIndex] || productImages[0] : "/placeholder.svg"}
          alt={product.name || "Product"}
          className="w-full h-full object-cover transition-all duration-300"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>
      
      <div className="px-3 py-2 space-y-2">
        <h3 className="font-medium text-black text-sm leading-tight line-clamp-1">
          {product.name || "Unnamed Product"}
        </h3>
        
        <div className="flex items-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(rating) ? "text-orange-400 fill-current" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="text-xs text-black">
            ({reviewCount})
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-black text-lg font-bold">
            Rs. {discountPercentage > 0 ? Math.round(discountedPrice).toLocaleString() : product.price.toLocaleString()}
          </span>
          {discountPercentage > 0 && (
            <span className="text-sm line-through text-gray-400">
              Rs. {product.price.toLocaleString()}
            </span>
          )}
        </div>
        
        <Button
          className="w-full text-white font-semibold py-3 text-sm transition-colors rounded-none"
          style={{ backgroundColor: 'rgb(147, 61, 22)' }}
          onClick={async (e) => {
            e.stopPropagation();
            
            try {
              const { getUserData } = await import('@/actions/auth');
              const { addProductToCartClient } = await import('@/actions/cart-client');
              const { getOrCreateGuestSession } = await import('@/lib/cart-utils');
              
              const user = await getUserData();
              
              if (!user) {
                router.push('/auth?redirect=wholesale-checkout&message=login-required');
                return;
              }
              
              let result;
              if (user && user.id) {
                result = await addProductToCartClient({
                  userId: user.id,
                  productId: product._id,
                  quantity: 1
                });
              } else {
                const sessionId = await getOrCreateGuestSession();
                result = await addProductToCartClient({
                  sessionId,
                  productId: product._id,
                  quantity: 1
                });
              }
              
              if (result.success) {
                router.push('/wholesale-checkout');
              } else {
                toast.error(result.error || 'Failed to add product');
              }
            } catch (error) {
              toast.error('Error processing buy now');
              console.error('Error with buy now:', error);
            }
          }}
        >
          Buy Now!
        </Button>
      </div>
    </div>
  )
}