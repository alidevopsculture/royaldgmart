'use client'

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface CategorySelectorProps{
    name:string
}

function CategorySelectorComponent({name}:CategorySelectorProps ){
    const searchParams=useSearchParams()
    const {replace}=useRouter()
    const pathname=usePathname()
    
    return(
        <>
            <button 
            onClick={(e)=>{
                const params = new URLSearchParams(searchParams);
                params.set('category', name);
                params.set('page','1')
                if(!pathname.includes('search')){
                    replace(`/search?${params.toString()}`);
                }else if(pathname.includes('search')){
                    replace(`${pathname}?${params.toString()}`);
                }
            }} type="button">
                {name}
            </button>
        </>
    )
}

export default function CategorySelector(props: CategorySelectorProps) {
    return (
        <Suspense fallback={<button className="px-4 py-2 bg-gray-200 rounded">{props.name}</button>}>
            <CategorySelectorComponent {...props} />
        </Suspense>
    )
}