"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShoppingCart, Users, Settings, LogOut, Building2, Store, Megaphone, ShieldCheck } from "lucide-react";
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
        title: "Verifications",
        href: "/verifications",
        icon: ShieldCheck,
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
        title: "Marketing",
        href: "/marketing",
        icon: Megaphone,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    }
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <div className="hidden h-screen w-64 flex-col border-r bg-card md:flex">
            <div className="flex h-16 items-center border-b px-6">
                <h1 className="text-xl font-bold">Fisco Admin</h1>
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
    );
}
