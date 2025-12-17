'use server'

import { productDataPosting } from "@/types/product"
import { revalidatePath } from "next/cache"

export const createProduct=async(formData:FormData)=>{
    try {
        // Get token from cookie (server-side) or localStorage (client-side)
        let token = '';
        if (typeof window !== 'undefined') {
            token = localStorage.getItem('token') || '';
        } else {
            // For server actions, try to get from cookies (Next.js)
            try {
                const { cookies } = await import('next/headers');
                const cookie = cookies();
                token = cookie.get('token')?.value || '';
            } catch (e) {
                token = '';
            }
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
            method: 'POST',
            body: formData,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.status == 201) {
            const result = await res.json();
            revalidatePath('/');
            revalidatePath('/search');
            return { result: result.message, status: 201 };
        } else {
            const error = await res.json();
            throw new Error(error.message);
        }
    } catch (error: any) {
        console.error('[ERROR] createProduct:', error?.message || error);
        return { error: error.message, status: 500 };
    }
}

// export const getProducts=async({limit=10,page=1}:{limit:number,page:number})=>{
//     try {

//             method:"GET",
//             cache:'no-store',
//             headers:{
//                 'Content-Type':'application/json'
//             }
//         })
//         console.log(res)
//         if(res.status>201){
//             throw Error('Unable to fetch products!')
//         }else{
//             const result=await res.json()
//             console.log(result)
//             return result
//         }
//     } catch (error:any) {
//         console.error('Fetch error:', error)
//         return error.message
//     }
// }

export const getProducts = async ({
  limit = 10,
  page = 1,
}: { limit: number; page: number }) => {
  try {
    // Use internal URL for server-side calls
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(
      `${apiUrl}/api/products?limit=${limit}&page=${page}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // console.log("res", res);

    if (!res.ok) {
      throw new Error(`Unable to fetch products: ${res.status}`);
    }

    const result = await res.json();
    console.log("API result:", result);
    return result;
  } catch (error: any) {
    console.error("[ERROR] getProducts:", error?.message || error);
    return { products: [] }; // safe fallback
  }
};


export const getProductById=async({id}:{id:string})=>{
    try {
        const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
        const res=await fetch(`${apiUrl}/api/products/${id}`,{
            method:"GET",
            cache:'no-store',
            headers:{
                'Content-Type':'application/json'
            }
        })

        
        if(res.status>201){
            throw Error('Error Fetching Products!')
        }else{
            const result=await res.json()
            // console.log(result.products)
            return result
        }
    } catch (error:any) {
        console.error('[ERROR] getProductById:', error?.message || error);
        return error.message
    }
}

export const getProductsByCategory = async ({limit,page,category}:{limit:number,page:number,category:string})=>{
    try {
        const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/category/${category}?limit=${limit}&page=${page}`,{
            method:"GET",
            cache:'no-store',
            headers:{
                'Content-Type':'application/json'
            }
        })
        
        if(res.status>201){
            throw Error('Error Fetching Products!')
        }else{
            const result=await res.json()
            return result
        }
    } catch (error:any) {
        console.error('[ERROR] getProductsByCategory:', error?.message || error);
        return error.message
    }
}

export const getProductsByCategoryAndQuery = async (
    {limit=10,page=1,category,query}:
    {limit:number,page:number,category:string,query:string})=>{
        try {
            const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/search/?page=${page}&limit=${limit}&category=${category}&query=${query}`,{
                method:"GET",
                // cache:'force-cache',
                headers:{
                    'Content-Type':'application/json'
                }
            })
    
            
            if(res.status>201){
                throw Error('Error Fetching Prducts!')
            }else{
                const result=await res.json()
                // console.log(126,result)
                return result
            }
        } catch (error:any) {
            console.error('[ERROR] getProductsByCategoryAndQuery:', error?.message || error);
            return error.message
        }
}

export const getProductsByQuery = async ({limit,page,query}:{limit:number,page:number,query:string})=>{
    try {
        const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=${limit}&page=${page}&search=${query}`,{
            method:"GET",
            // cache:'force-cache',
            headers:{
                'Content-Type':'application/json'
            }
        })

        
        if(res.status>201){
            throw Error(res.statusText)
        }else{
            const result=await res.json()
            return result
        }
    } catch (error:any) {
        console.error('[ERROR] getProductsByQuery:', error?.message || error);
        return error.message
    }
}

export const getAvailableCategories = async ()=>{
    try {
        const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/categories`,{
            method:"GET",
            cache:'no-store',
            headers:{
                'Content-Type':'application/json'
            }
        })
        if(res.status>201){
            throw Error('Error fetching categories!')
        }else{
            const result=await res.json()
            return result
        }
    } catch (error:any) {
        console.error('[ERROR] getAvailableCategories:', error?.message || error);
        return error.message
    }
}