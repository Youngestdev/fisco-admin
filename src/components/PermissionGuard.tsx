"use client";

import { useAuth } from "@/context/AuthContext";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { pageVariants } from "@/lib/motion-variants";

interface PermissionGuardProps {
    children: React.ReactNode;
    permission: string;
    fallback?: React.ReactNode;
}

export function PermissionGuard({ children, permission, fallback }: PermissionGuardProps) {
    const { hasPermission, isLoading } = useAuth();

    if (isLoading) {
        return null; // Let the parent loading state handle this
    }

    if (!hasPermission(permission)) {
        return fallback || <InsufficientPermissions />;
    }

    return <>{children}</>;
}

export function InsufficientPermissions() {
    return (
        <motion.div
            className="flex flex-col items-center justify-center min-h-[60vh] space-y-6"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-destructive/10">
                <ShieldX className="h-10 w-10 text-destructive" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-muted-foreground max-w-md">
                    You don&apos;t have permission to access this page. Please contact your
                    administrator if you believe this is an error.
                </p>
            </div>
            <Link href="/">
                <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>
            </Link>
        </motion.div>
    );
}
