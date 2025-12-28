'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { addProductToCart } from "@/actions/cart"
import { productData } from "@/types/product"
import { cleanDropdownText } from "@/lib/text-utils"

interface ProductViewClientProps {
  product: productData
  productId: string
  user: any
}

export function ProductViewClient({ product, productId, user }: ProductViewClientProps) {
  const router = useRouter()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  
  // Get available colors for selected size
  const availableColors = selectedSize 
    ? product.availableSizesColors.find(item => item.size === selectedSize)?.colors || []
    : []

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Please select a size")
      return
    }
    if (!selectedColor && availableColors.length > 0) {
      toast.error("Please select a color")
      return
    }

    setIsAddingToCart(true)
    try {
      let url: string;
      let body: any = {
        product: productId,
        quantity: quantity,
        size: selectedSize
      };

      if (user) {
        // Authenticated user
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${user.id}/add`;
      } else {
        // Guest user
        const { getOrCreateGuestSession } = await import('@/lib/cart-utils')
        const sessionId = await getOrCreateGuestSession()
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/guest-cart/${sessionId}/add`;
      }

      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        toast.success("Product added to cart successfully!")
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to add product to cart")
      }
    } catch (error: any) {
      toast.error("Failed to add product to cart")
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <form className="grid gap-4 md:gap-10">
      <div className="grid gap-2">
        <Label htmlFor="size" className="text-base">
          Size
        </Label>
        <RadioGroup 
          id="size" 
          className="flex items-center gap-2"
          onValueChange={(value) => {
            setSelectedSize(value)
            setSelectedColor(null) // Reset color when size changes
          }}
        >
          {product.availableSizesColors.map((item, index) => (
            <Label
              key={index}
              htmlFor={`size-${item.size}`}
              className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-muted"
            >
              <RadioGroupItem id={`size-${item.size}`} value={item.size} />
              {item.size}
            </Label>
          ))}
        </RadioGroup>
      </div>
      
      {availableColors.length > 0 && (
        <div className="grid gap-2">
          <Label className="text-base">
            Color
          </Label>
          <div className="flex items-center gap-2 flex-wrap">
            {availableColors.map((colorItem, index) => {
              const isHexColor = colorItem.color.startsWith('#')
              const colorValue = isHexColor ? colorItem.color : colorItem.color.toLowerCase()
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedColor(colorItem.color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === colorItem.color 
                      ? 'border-gray-900 scale-110' 
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: colorValue }}
                  title={colorItem.color}
                />
              )
            })}
          </div>
          {selectedColor && (
            <p className="text-sm text-gray-600 capitalize">
              Selected: {selectedColor}
            </p>
          )}
        </div>
      )}
      
      <div className="grid gap-2">
        <Label htmlFor="quantity" className="text-base">
          Quantity
        </Label>
        <Select 
          defaultValue="1" 
          onValueChange={(value) => setQuantity(parseInt(value))}
        >
          <SelectTrigger className="w-24">
            <SelectValue placeholder={cleanDropdownText('Select')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">{cleanDropdownText('1')}</SelectItem>
            <SelectItem value="2">{cleanDropdownText('2')}</SelectItem>
            <SelectItem value="3">{cleanDropdownText('3')}</SelectItem>
            <SelectItem value="4">{cleanDropdownText('4')}</SelectItem>
            <SelectItem value="5">{cleanDropdownText('5')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        size="lg" 
        onClick={(e) => {
          e.preventDefault()
          handleAddToCart()
        }}
        disabled={isAddingToCart || !selectedSize || (availableColors.length > 0 && !selectedColor)}
      >
        {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
      </Button>
    </form>
  )
}
