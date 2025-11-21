import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
                    <Menu className="h-5 w-5" />
                </Button>
                {/* Breadcrumbs or Page Title could go here */}
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-secondary" />
                    <div className="text-sm">
                        <p className="font-medium">Admin User</p>
                        <p className="text-xs text-muted-foreground">admin@fisco.com</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
