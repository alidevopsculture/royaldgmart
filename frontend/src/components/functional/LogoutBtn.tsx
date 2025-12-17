'use client'

import { Logout } from "@/actions/auth"
import { Button } from "../ui/button"

interface LogoutBtnProps{
    
}

export default function LogoutBtn({}:LogoutBtnProps ){
    return(
        <Button variant={'default'} onClick={()=>Logout()} className="flex items-center gap-2">
        <div className="h-4 w-4" />
        <span>Logout</span>
      </Button>
    )
}