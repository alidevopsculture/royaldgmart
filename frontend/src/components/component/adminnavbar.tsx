'use client'

import { Search, LogOut, Crown } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { usePathname } from "next/navigation";
import { Logout } from "@/actions/auth";
import { Badge } from "../ui/badge";

export default function AdminNavbar() {
    const pathname = usePathname()
    const lastSegment = pathname.split('/').pop() || 'dashboard'
    const pageName = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
    
    const getPageIcon = () => {
        switch(pathname.split('/').pop()) {
            case 'dashboard': return '📊'
            case 'orders': return '🛒'
            case 'products': return '📦'
            case 'customers': return '👥'
            case 'notifications': return '🔔'
            default: return '⚡'
        }
    }

    return (
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
            <div className="flex items-center justify-between h-full px-6">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-xl">{getPageIcon()}</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{pageName}</h1>
                            <p className="text-sm text-gray-500">Manage your {pageName.toLowerCase()}</p>
                        </div>
                    </div>
                </div>

                {/* Center Section - Search */}
                <div className="hidden lg:flex flex-1 max-w-md mx-8">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                            type="search" 
                            placeholder="Search anything..." 
                            className="pl-10 pr-4 py-2 w-full border-gray-200 rounded-2xl bg-white/70 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm" 
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 border-0">
                                ⌘K
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Button */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden rounded-2xl hover:bg-gray-100/80"
                >
                    <Search className="h-5 w-5 text-gray-600" />
                </Button>

                {/* Right Section */}
                <div className="flex items-center gap-3">

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-2xl hover:bg-gray-100/80">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Crown className="h-5 w-5 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl p-2">
                            <DropdownMenuLabel className="px-3 py-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <Crown className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Royal Admin</p>
                                        <p className="text-sm text-gray-500">royaldigitalmart@gmail.com</p>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="my-2" />
                            
                            <DropdownMenuItem 
                                onClick={() => Logout()} 
                                className="rounded-xl px-3 py-2 cursor-pointer hover:bg-red-50/80 text-red-600 hover:text-red-700"
                            >
                                <LogOut className="h-4 w-4 mr-3" />
                                <span>Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}