import { getProductsByCategory } from "@/actions/product"
import { productData, productDataGetting } from "@/types/product"
import ProductCard from "./ProductCard"
import LoadMoreRelatedProducts from "./LoadMoreRelatedProducts"

interface RelatedProductsProps{
    category:string,_id:string
}

export default async function RelatedProducts({category,_id}:RelatedProductsProps ){
    // Don't fetch if category is undefined
    if (!category) {
        return null
    }

    const relatedProducts:productDataGetting= await getProductsByCategory({limit:10,page:1,category})

    // console.log(relatedProducts)
    return(
        <section className="py-12 px-6 md:px-12">
            <div className="max-w-[1500px] mx-auto">
                <h2 className="text-2xl font-bold mb-6">Related Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {relatedProducts?.products?.map((product,ind)=>{
                        if(product._id==_id){
                            return null
                        }
                        return(
                            <ProductCard key={product._id} product={product}/>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}