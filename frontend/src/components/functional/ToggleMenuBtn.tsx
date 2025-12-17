'use client'
import { Building2, Contact2, Cross, CrossIcon, LayoutPanelLeft, MenuIcon, ShoppingCartIcon, UserRound, X } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import LogoutBtn from "./LogoutBtn";
import CategorySelector from "./CategorySelector";

interface ToggleMenuBtnProps{
    user:any
}

export default function ToggleMenuBtn({user}:ToggleMenuBtnProps ){
    const slideRight='opacity-0 translate-x-24 invisible'
    const [showMenu,setShowMenu]=useState(false)

    return(
        <div className={`relative z-20`}>
            <Button onClick={()=>setShowMenu(!showMenu)} variant="ghost" size="icon" className="md:hidden">
                {showMenu?<X className="h-6 w-6"/>:<MenuIcon className="h-6 w-6" />}
                <span className="sr-only">Toggle menu</span>
            </Button>
            <div style={{transition:'all 0.3s ease'}} className={` 
                z-20 absolute right-0 bg-white shadow-xl flex flex-col justify-center items-start gap-5 rounded-md text-black px-5 py-3 min-w-[200px]
                ${showMenu?'':slideRight}`} >
                    <div className=" w-full" >
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Link href="#" className="hover:underline" prefetch={false}>
                                <div className=" flex  justify-start items-center gap-3">
                                    <LayoutPanelLeft />
                                    <p>
                                        Categories
                                    </p>
                                </div>
                            </Link>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <CategorySelector name='Category-1'/>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <CategorySelector name='Category-2'/>
                                </DropdownMenuItem>
                                {/* <DropdownMenuSeparator /> */}
                                <DropdownMenuItem>
                                    <CategorySelector name='Category-3'/>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <CategorySelector name='Category-4'/>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <CategorySelector name='Category-5'/>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <CategorySelector name='Category-6'/>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <CategorySelector name='Category-7'/>
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Link href="/about" className="hover:underline w-full" prefetch={false}>
                    <div className=" flex w-full justify-start items-center gap-3">
                        <Building2 />
                        <p>
                            About
                        </p>
                    </div>
                    </Link>
                    <Link href="/contact" className="hover:underline" prefetch={false}>
                    <div className=" flex w-full justify-start items-center gap-3">
                        <Contact2/>
                        <p>
                            Contact
                        </p>
                    </div>
                    </Link>
                    {user &&<Link href="/cart" className="flex items-center gap-2 hover:underline" prefetch={false}>
                    <div className=" flex w-full justify-start items-center gap-3">
                        <ShoppingCartIcon className="" />
                        <p>
                            Cart
                        </p>
                    </div>
                    </Link>}
                    {user ? (
                    // <DropdownMenu>
                    //     <DropdownMenuTrigger asChild>
                    //     <Button variant="ghost" size="icon" className="rounded-full">
                    //         <Avatar className="h-8 w-8">
                    //         <AvatarImage src="/placeholder-user.jpg" />
                    //         <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    //         </Avatar>
                    //         <span className="sr-only">Toggle user menu</span>
                    //     </Button>
                    //     </DropdownMenuTrigger>
                    //     <DropdownMenuContent align="end">
                    //     <DropdownMenuItem>
                    //         <Link href="#" className="flex items-center gap-2" prefetch={false}>
                    //         <div className="h-4 w-4" />
                    //         <span>Profile</span>
                    //         </Link>
                    //     </DropdownMenuItem>
                    //     <DropdownMenuItem>
                    //         <Link href="#" className="flex items-center gap-2" prefetch={false}>
                    //         <div className="h-4 w-4" />
                    //         <span>Settings</span>
                    //         </Link>
                    //     </DropdownMenuItem>
                    //     <DropdownMenuSeparator />
                    //     <DropdownMenuItem>
                    //         <LogoutBtn/>
                    //     </DropdownMenuItem>
                    //     </DropdownMenuContent>
                    // </DropdownMenu>
                    <Link href="/profile" className="hover:underline" prefetch={false}>
                        <div className=" flex w-full justify-start items-center gap-3">
                            <UserRound/>
                            <p>Profile</p>
                        </div>
                    </Link>
                    ) : (
                    <div className="flex gap-2">
                        <Link href="/auth" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
                        Login
                        </Link>
                        {/* <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
                        Register
                        </Link> */}
                    </div>
                    )}
                
            </div>
        </div>
    )
}