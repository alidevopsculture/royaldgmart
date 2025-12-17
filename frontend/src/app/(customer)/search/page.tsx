
import { SearchPage } from "@/components/component/productpage";
import { SearchResults } from "@/components/component/SearchResults";

interface pageProps{
    searchParams?: { [key: string]: string | string[] | undefined };
}

export default function page({searchParams}:pageProps ){
    const query = searchParams?.query as string || '';
    const category = searchParams?.category as string || '';
    const page = parseInt(searchParams?.page as string) || 1;
    
    return(
        <div className='min-h-screen bg-gray-50'>
            <SearchResults 
                query={query} 
                category={category} 
                page={page}
            />
        </div>
    )
}