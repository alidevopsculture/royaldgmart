'use client'

import * as React from 'react';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { usePathname, useSearchParams,useRouter } from 'next/navigation';

export default function PaginationControlled({totalPages,currentPage}:{totalPages:number,currentPage:number}) {
    // const [page, setPage] = React.useState(1);
    
    const searchParams=useSearchParams()
    const pathname=usePathname()
    const {replace}=useRouter()

    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
        // setPage(value);
        createPageURL(value)
    };

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        replace(`${pathname}?${params.toString()}`);
    };
    

    return (
        <div className=' w-full flex justify-center items-center mt-5'>
            <Pagination count={totalPages} page={currentPage} onChange={handleChange} siblingCount={0}/>
        </div>
    );
}
