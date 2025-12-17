'use client'

import { Package2Icon, HomeIcon, ShoppingCartIcon, PackageIcon, UsersIcon, Bell, Menu, X, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { Logout } from "@/actions/auth";

export default function Sidebar() {
    const [showSidebar, setShowSidebar] = useState<boolean>(false)
    const pathname = usePathname()

    const menuItems = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/orders", label: "Orders" },
        
        { href: "/products", label: "Products" },
        { href: "/reviews", label: "Reviews" },
        { href: "/customers", label: "Customers" },
        { href: "/notifications", label: "Notifications" },
        { href: "/wholesale-admin", label: "Wholesale Products" },
        { href: "/wholesale-orders", label: "Wholesale Orders" },
    ]

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <Link href="/dashboard">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Admin Panel
                        </h1>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname.includes(item.href)
                        
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block px-4 py-2 text-sm font-medium rounded ${
                                    isActive 
                                        ? 'bg-gray-100 text-gray-900' 
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200">
                    <Button
                        onClick={() => Logout()}
                        variant="outline"
                        className="w-full"
                    >
                        Logout
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden fixed top-4 left-4 z-50"
                variant="outline"
            >
                <Menu className="h-4 w-4" />
            </Button>

            {/* Mobile Sidebar Overlay */}
            {showSidebar && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 ${
                showSidebar ? 'translate-x-0' : '-translate-x-full'
            }`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <Link href="/dashboard">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Admin Panel
                        </h1>
                    </Link>
                    <Button
                        onClick={() => setShowSidebar(false)}
                        variant="ghost"
                        size="sm"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname.includes(item.href)
                        
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setShowSidebar(false)}
                                className={`block px-4 py-2 text-sm font-medium rounded ${
                                    isActive 
                                        ? 'bg-gray-100 text-gray-900' 
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200">
                    <Button
                        onClick={() => Logout()}
                        variant="outline"
                        className="w-full"
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </>
    )
}