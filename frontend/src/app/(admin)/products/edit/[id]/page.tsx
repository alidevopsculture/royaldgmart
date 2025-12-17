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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/update/${productId}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to update product')
      
      toast.success('Product updated successfully!')
      router.push('/products')
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

          <div className="grid gap-2">
            <Label>Category *</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {product.category || 'Select Category'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup 
                  value={product.category}
                  onValueChange={(value) => setProduct({...product, category: value})}
                >
                  {categories.map((item) => (
                    <DropdownMenuRadioItem key={item} value={item}>
                      {item}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
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