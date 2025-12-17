'use client'

import { getProducts, getProductsByCategory, getProductsByQuery } from "@/actions/product"
import { productData, productDataGetting } from "@/types/product"
import { useEffect, useState } from "react"
import ProductCard from "./ProductCard"
import { useInView } from "react-intersection-observer"
import { Loader, Loader2 } from "lucide-react"

interface LoadMoreRelatedProductsProps{
    category:string
}

let page=2
let hasNextPage=true
let totalPages=0

export default function LoadMoreRelatedProducts({category}:LoadMoreRelatedProductsProps ){
    // Don't render if category is undefined
    if (!category) {
        return null
    }

    const [productsData,setProductsData]=useState<productData[]>([])
    const [loading, setLoading] = useState(false)
    const {ref,inView}=useInView()

    const fetchAllProducts=async()=>{
        if (loading) return;
        
        setLoading(true);
        try {
            const res:productDataGetting=await getProductsByCategory({limit:10,page:page,category})

            setProductsData(prev => [...prev, ...res.products])
            hasNextPage=res.hasNextPage
            totalPages=res.totalPages
            page++
        } catch (error:any) {
            console.log(error)
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(()=>{
        if(inView && hasNextPage && !loading){
            fetchAllProducts()
        }
    },[inView, hasNextPage, loading])
    
    return(
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productsData?.map((product,ind)=>{
                return(
                    <ProductCard key={product._id} product={product}/>
                )
            })}
            
            <div ref={ref} className="col-span-full flex justify-center py-4">
                {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                ) : hasNextPage ? null : (
                    <p className="text-gray-500">You've reached the end...</p>
                )}
            </div>
        </div>
    )
}