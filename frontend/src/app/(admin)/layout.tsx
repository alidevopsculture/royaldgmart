import { getUserData } from "@/actions/auth"
import Sidebar from "@/components/component/sidebar"
import { redirect } from "next/navigation"
import { ReactNode } from "react"

interface layoutProps{
    children:ReactNode
}

export default async function layout({children}:layoutProps ){
    const user = await getUserData()
    
    if (!user || user.role !== 'admin') {
        redirect('/admin')
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='flex h-screen overflow-hidden'>
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}