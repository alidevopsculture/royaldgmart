import { getUserData } from "@/actions/auth"
import { redirect } from "next/navigation"
import { ReactNode } from "react"

interface layoutProps{
    children:ReactNode
}

export default async function layout({children}:layoutProps ){
    const user = await getUserData();
    
    if (user && user.role === 'admin') {
        redirect('/dashboard');
    }

    return (
        <div className='overflow-hidden'>
            {children}
        </div>
    );
}