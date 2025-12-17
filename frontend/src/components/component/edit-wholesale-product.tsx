'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import toast, { Toaster } from "react-hot-toast"
import SizeAndColor from "@/components/functional/SizeAndColor"
import ImageContainer from "@/components/functional/ImageContainer"

type Product = {
  _id: string
  name: string
  description: string
  category: string
  price: number
  stockQuantity: number
  carousel: boolean
  most_selling_product: boolean
  product_specification: {
    material: string
    careInstruction: string
  }
  discountPercentage: number
  wholesaleDiscount: number
  taxRate: number
  shippingCharges: number
  availableSizesColors: Array<{
    size: string
    dimensions?: string
    colors: Array<{color: string, combination_price: number}>
  }>
  images: string[]
}

export default function EditWholesaleProduct({ productId }: { productId: string }) {
  const router = useRouter()
  // Remove useParams since productId is passed as prop

  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const categories = [
    'SAREE',
    'MEN SUITING SHIRTING',
    'MEN COMBOS PACKS',
    'WOMEN STICHED SUITS',
    'WOMEN UNSTICHED SUITS',
    'LEHNGAS',
    'WOMENS OTHERS',
    'BED SHEETS',
    'CURTAINS',
    'BLANKETS',
    'MOSQUITO NETS',
    'WHOLESALE'
  ]

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`)
        if (!response.ok) throw new Error('Failed to fetch product')
        const data = await response.json()
        setProduct(data)
      } catch (error) {
        console.error('Error fetching product:', error)
        toast.error('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleSubmit = async () => {
    if (!product) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('data', JSON.stringify({
        ...product,
        prevImgs: product.images
      }))
      
      for (let file of images) {
        formData.append('images[]', file, file.name)
      }

      // Get token from cookie
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/update/${productId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to update product')
      
      toast.success('Product updated successfully!')
      router.push('/wholesale-admin')
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-4 md:px-6 py-12">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input 
              value={product.name} 
              onChange={(e) => setProduct({...product, name: e.target.value})} 
              id="name" 
              type="text" 
              placeholder="Enter product name" 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea 
              value={product.description} 
              onChange={(e) => setProduct({...product, description: e.target.value})} 
              id="description" 
              placeholder="Enter product description" 
              className="min-h-[120px]" 
            />
          </div>

          {/* Category is fixed to WHOLESALE for wholesale products */}
          <div className="grid gap-2">
            <Label>Category</Label>
            <Input value="WHOLESALE" disabled className="bg-gray-100" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="price">Price *</Label>
              <Input 
                value={product.price} 
                onChange={(e) => setProduct({...product, price: parseInt(e.target.value)})} 
                id="price" 
                type="number" 
                placeholder="Enter price" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input 
                value={product.stockQuantity} 
                onChange={(e) => setProduct({...product, stockQuantity: parseInt(e.target.value)})} 
                id="quantity" 
                type="number" 
                placeholder="Enter quantity" 
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Product Specifications</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div className="grid gap-2">
                <Label htmlFor="material">Material</Label>
                <Input 
                  value={product.product_specification.material} 
                  onChange={(e) => setProduct({
                    ...product,
                    product_specification: {...product.product_specification, material: e.target.value}
                  })} 
                  id="material" 
                  type="text" 
                  placeholder="Enter material" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="care-instructions">Care Instructions</Label>
                <Textarea 
                  value={product.product_specification.careInstruction} 
                  onChange={(e) => setProduct({
                    ...product,
                    product_specification: {...product.product_specification, careInstruction: e.target.value}
                  })} 
                  id="care-instructions" 
                  placeholder="Enter care instructions" 
                  className="min-h-[120px]" 
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Available Size and Color *</Label>
            <SizeAndColor 
              setSizesAndColors={(sizes) => {
                const convertedSizes = Array.isArray(sizes) ? sizes : typeof sizes === 'function' ? sizes(product.availableSizesColors) : sizes;
                setProduct({...product, availableSizesColors: convertedSizes});
              }}
              sizesAndColors={product.availableSizesColors}
              selectedSizes={[]}
              setSelectedSizes={() => {}}
            />
          </div>

          <div className="grid gap-2">
            <Label>Marketing</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 items-center gap-2">
                <Label>Add product to carousel</Label>
                <Checkbox 
                  checked={product.carousel}
                  onCheckedChange={(checked) => setProduct({...product, carousel: !!checked})}
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-2">
                <Label>Is this a best selling product</Label>
                <Checkbox 
                  checked={product.most_selling_product}
                  onCheckedChange={(checked) => setProduct({...product, most_selling_product: !!checked})}
                />
              </div>
            </div>
          </div>

          {/* Wholesale Configuration */}
          <div className="grid gap-4">
            <Label>Wholesale Configuration</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="wholesale-discount">Wholesale Discount (%)</Label>
                <Input 
                  value={product.wholesaleDiscount || 10} 
                  onChange={(e)=>setProduct({...product, wholesaleDiscount: parseFloat(e.target.value) || 0})} 
                  id="wholesale-discount" 
                  type="number" 
                  placeholder="10" 
                  min="0" 
                  max="100" 
                  step="0.1"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input 
                  value={product.taxRate || 18} 
                  onChange={(e)=>setProduct({...product, taxRate: parseFloat(e.target.value) || 0})} 
                  id="tax-rate" 
                  type="number" 
                  placeholder="18" 
                  min="0" 
                  max="100" 
                  step="0.01"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shipping-charges">Shipping Charges (₹)</Label>
                <Input 
                  value={product.shippingCharges || 100} 
                  onChange={(e)=>setProduct({...product, shippingCharges: parseFloat(e.target.value) || 0})} 
                  id="shipping-charges" 
                  type="number" 
                  placeholder="100" 
                  min="0" 
                  step="1"
                />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Note:</strong> These settings will apply to all wholesale cart and checkout calculations.
              </p>
              <div className="text-sm text-blue-700">
                <strong>Live Calculation (Current Product Price: ₹{product.price}):</strong><br/>
                Base: ₹{product.price} → After Discount ({product.wholesaleDiscount || 10}%): ₹{(product.price - (product.price * (product.wholesaleDiscount || 10) / 100)).toFixed(2)} → Tax ({product.taxRate || 18}%): +₹{((product.price - (product.price * (product.wholesaleDiscount || 10) / 100)) * (product.taxRate || 18) / 100).toFixed(2)} → Shipping: +₹{product.shippingCharges || 100} = <strong className="text-green-700 text-base">Total: ₹{(product.price - (product.price * (product.wholesaleDiscount || 10) / 100) + ((product.price - (product.price * (product.wholesaleDiscount || 10) / 100)) * (product.taxRate || 18) / 100) + (product.shippingCharges || 100)).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Upload new images or keep existing ones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-2">
                  {Array(6).fill(0).map((_, ind) => (
                    <button key={ind} className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed">
                      <div className="w-full h-full">
                        <ImageContainer ind={ind} setFiles={setImages} image={images[ind]} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push('/wholesale-admin')}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? 'Updating...' : 'Update Product'}
            </Button>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  )
}