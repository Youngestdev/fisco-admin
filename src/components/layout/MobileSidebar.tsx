"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LayoutDashboard, ShoppingCart, Users, Settings, LogOut, Building2, Store } from "lucide-react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Users",
        href: "/users",
        icon: Users,
    },
    {
        title: "Businesses",
        href: "/businesses",
        icon: Building2,
    },
    {
        title: "Storefronts",
        href: "/storefronts",
        icon: Store,
    },
    {
        title: "Orders",
        href: "/orders",
        icon: ShoppingCart,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Close sidebar on route change
    useEffect(() => {
        onClose();
    }, [pathname, onClose]);

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Sidebar Content */}
            <div className="relative flex h-full w-64 flex-col bg-card shadow-xl transition-transform duration-300 ease-in-out animate-in slide-in-from-left">
                <div className="flex h-16 items-center justify-between border-b px-6">
                    <h1 className="text-xl font-bold">Fisco Admin</h1>
                    <Button variant="ghost" size="icon" onClick={onClose} className="-mr-2">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <nav className="flex-1 space-y-1 p-4">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    ))}
                </nav>

                <div className="border-t p-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
