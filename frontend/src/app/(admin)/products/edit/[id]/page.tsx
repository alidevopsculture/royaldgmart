'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import toast, { Toaster } from "react-hot-toast"
import { X } from "lucide-react"
import SizeSelection from "@/components/functional/SizeSelection"
import ColorSelection from "@/components/functional/ColorSelection"
import ImageContainer from "@/components/functional/ImageContainer"
import { cleanDropdownText } from "@/lib/text-utils"
import { getAuthToken, makeAuthenticatedRequest } from "@/lib/auth-utils"

interface ColorOption {
  color: string
  combination_price: number
}

type Product = {
  _id: string
  name: string
  description: string
  category: string
  price: number
  stockQuantity: number
  carousel: boolean
  most_selling_product: boolean
  isNew: boolean
  taxRate: number
  shippingCharges: number
  product_specification: {
    material: string
    careInstruction: string
  }
  discountPercentage: number
  availableSizesColors: Array<{
    size: string
    dimensions?: string
    colors: Array<{color: string, combination_price: number}>
  }>
  images: string[]
}

export default function EditProduct() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<ColorOption[]>([])
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
        const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`);
        
        if (!response.ok) throw new Error('Failed to fetch product')
        const data = await response.json()
        setProduct(data)
        setExistingImages(data.images || [])
        
        // Extract sizes and colors from availableSizesColors
        if (data.availableSizesColors && data.availableSizesColors.length > 0) {
          const sizes = data.availableSizesColors.map((item: any) => item.size).filter((size: string) => size !== 'One Size')
          const colors = data.availableSizesColors[0]?.colors || []
          setSelectedSizes(sizes)
          setSelectedColors(colors)
        }
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
      // Create availableSizesColors from separate size and color selections
      const availableSizesColors = selectedSizes.length > 0 
        ? selectedSizes.map(size => ({
            size,
            colors: selectedColors,
            stockQuantity: product.stockQuantity || 0
          }))
        : [{
            size: 'One Size',
            colors: selectedColors,
            stockQuantity: product.stockQuantity || 0
          }]

      const formData = new FormData()
      formData.append('data', JSON.stringify({
        ...product,
        availableSizesColors,
        prevImgs: existingImages
      }))
      
      for (let file of images) {
        formData.append('images[]', file, file.name)
      }

      // Get token from cookies for authentication
      const token = getAuthToken();

      if (!token) {
        toast.error('Authentication required. Please login again.')
        return
      }

      const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/products/update/${productId}`, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update product')
      }
      
      toast.success('Product updated successfully!')
      router.push('/products')
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update product')
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

          <div className="grid gap-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={product.category} onValueChange={(value) => setProduct({...product, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {cleanDropdownText(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Available Sizes (Optional)</Label>
              <SizeSelection 
                selectedSizes={selectedSizes} 
                setSelectedSizes={setSelectedSizes}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Available Colors (Optional)</Label>
              <ColorSelection 
                selectedColors={selectedColors} 
                setSelectedColors={setSelectedColors}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Marketing</Label>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="carousel"
                  checked={product.carousel}
                  onCheckedChange={(checked) => setProduct({...product, carousel: !!checked})}
                />
                <Label htmlFor="carousel">Add product to carousel</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="bestSelling"
                  checked={product.most_selling_product}
                  onCheckedChange={(checked) => setProduct({...product, most_selling_product: !!checked})}
                />
                <Label htmlFor="bestSelling">Is this a best selling product</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="newBadge"
                  checked={product.isNew || false}
                  onCheckedChange={(checked) => setProduct({...product, isNew: !!checked})}
                />
                <Label htmlFor="newBadge">Show NEW badge on product card</Label>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Product Discount {product.discountPercentage}%</Label>
            <Slider 
              onValueChange={(value) => setProduct({...product, discountPercentage: value[0]})} 
              value={[product.discountPercentage]} 
              min={0} 
              max={100} 
              step={1} 
            />
          </div>

          {/* Tax and Shipping Section */}
          <div className="grid gap-2">
            <Label htmlFor="tax">Tax & Shipping Configuration</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tax-percentage">Tax Rate (%)</Label>
                <Input 
                  value={product.taxRate || 18} 
                  onChange={(e)=>setProduct({...product, taxRate: parseFloat(e.target.value) || 0})} 
                  id="tax-percentage" 
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
                  value={product.shippingCharges !== undefined ? product.shippingCharges : 50} 
                  onChange={(e)=>{
                    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    setProduct({...product, shippingCharges: isNaN(value) ? 0 : value});
                  }} 
                  id="shipping-charges" 
                  type="number" 
                  placeholder="50" 
                  min="0" 
                  step="1"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Price Breakdown</Label>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Base Price: ₹{product.price}</div>
                {product.discountPercentage > 0 && (
                  <div>Discount ({product.discountPercentage}%): -₹{((product.price * product.discountPercentage) / 100).toFixed(2)}</div>
                )}
                <div>Tax ({product.taxRate || 18}%): +₹{((product.price * (100 - product.discountPercentage) / 100) * (product.taxRate || 18) / 100).toFixed(2)}</div>
                <div>Shipping: +₹{product.shippingCharges !== undefined ? product.shippingCharges : 50}</div>
                <div className="font-semibold border-t pt-1 text-lg text-green-600">Total Amount: ₹{(product.price * (100 - product.discountPercentage) / 100 * (100 + (product.taxRate || 18)) / 100 + (product.shippingCharges !== undefined ? product.shippingCharges : 50)).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Upload new images or keep existing ones. <br />
                The first image should be the thumbnail of your product<br />
                <span className="text-red-600 font-medium">Maximum file size: 3MB per image</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">Current Images</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {existingImages.map((imageUrl, index) => (
                        <div key={`existing-${index}`} className="relative aspect-square border rounded-md overflow-hidden">
                          <img 
                            src={imageUrl} 
                            alt={`Product ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setExistingImages(prev => prev.filter((_, i) => i !== index))
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New Images Upload */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Add New Images</Label>
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
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push('/products')}>
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