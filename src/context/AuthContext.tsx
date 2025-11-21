"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import * as authLib from "@/lib/auth";

interface Admin {
    email: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    admin: Admin | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [admin, setAdmin] = useState<Admin | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    // Helper to get CSRF token from cookies
    const getCsrfToken = () => {
        if (typeof document === "undefined") return "";
        const match = document.cookie.match(/csrf_token=([^;]+)/);
        return match ? match[1] : "";
    };

    const checkAuth = async () => {
        try {
            // Since access_token is HTTPOnly, we can't check it via document.cookie
            // We need to make an API call to verify the session
            // Use a lightweight endpoint - permissions list
            const CLIENT_ID = process.env.NEXT_PUBLIC_ADMIN_CLIENT_ID || "";
            const response = await fetch("/api/v1/admin/permissions", {
                method: "GET",
                credentials: "include",
                headers: {
                    "client-id": CLIENT_ID,
                },
            });

            if (response.ok) {
                setIsAuthenticated(true);
                setAdmin({ email: "admin@mercury.com" });
            } else {
                setIsAuthenticated(false);
                setAdmin(null);
            }
        } catch (error) {
            console.error("Auth check failed", error);
            setIsAuthenticated(false);
            setAdmin(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            // Don't pass CSRF token on login - it doesn't exist yet
            // The backend will set it in the response cookies
            const response = await authLib.login(email, password);
            // Login successful, set authenticated state
            setIsAuthenticated(true);
            setAdmin({ email: response.email || email });
            return true;
        } catch (error) {
            console.error("Login failed", error);
            setIsAuthenticated(false);
            setAdmin(null);
            return false;
        }
    };

    const logout = async () => {
        try {
            await authLib.logout(getCsrfToken());
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setIsAuthenticated(false);
            setAdmin(null);
            router.push("/login");
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, admin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
