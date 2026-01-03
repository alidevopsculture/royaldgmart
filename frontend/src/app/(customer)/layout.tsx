import { getUserData } from "@/actions/auth"
import { ReactNode } from "react"

interface layoutProps{
    children:ReactNode
}

export default async function layout({children}:layoutProps ){
    // Allow both admin and regular users to access customer pages
    return (
        <div className='overflow-hidden'>
            {children}
        </div>
    );
}