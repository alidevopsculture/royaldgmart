import { getUserData } from "@/actions/auth"
import { redirect } from "next/navigation"
import { ReactNode } from "react"

interface layoutProps{
    children:ReactNode
}

export default async function layout({children}:layoutProps ){
    const session=await getUserData()

    // console.log(session.role)
    if(session?.role=='admin'){
        redirect('/dashboard')
    }
    return(
        <div className=' overflow-hidden'>
            {children}
        </div>
    )
}