"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
    { name: "Overview", href: "/marketing" },
    { name: "Campaigns", href: "/marketing/campaigns" },
    { name: "Audience", href: "/marketing/audience" },
    { name: "Workflows", href: "/marketing/workflows" },
];

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Marketing</h2>
                <p className="text-muted-foreground">
                    Manage your email campaigns, audience segments, and automated workflows.
                </p>
            </div>
            <div className="flex space-x-1 rounded-lg bg-muted p-1 w-fit">
                {tabs.map((tab) => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                            pathname === tab.href || (tab.href !== "/marketing" && pathname.startsWith(tab.href))
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                        )}
                    >
                        {tab.name}
                    </Link>
                ))}
            </div>
            <div className="min-h-[400px]">
                {children}
            </div>
        </div>
    );
}
