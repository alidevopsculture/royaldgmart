

import { Productview } from "@/components/component/productview";
interface pageProps{ 
    params: { id: string } ,
    searchParams?: { [key: string]: string | string[] | undefined };
}

export default function page({ params,searchParams }:pageProps ){

    // console.log(searchParams?.category)
    // console.log(params.id)

    return(
        <>
            <Productview productId={params.id} category={searchParams?.category as string}/>
        </>
    )
}