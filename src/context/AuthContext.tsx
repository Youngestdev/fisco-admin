"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as authLib from "@/lib/auth";
import { getAdminProfile, type AdminProfile } from "@/lib/api";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    admin: AdminProfile | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [admin, setAdmin] = useState<AdminProfile | null>(null);
    const router = useRouter();

    // Helper to get CSRF token from cookies
    const getCsrfToken = () => {
        if (typeof document === "undefined") return "";
        const match = document.cookie.match(/csrf_token=([^;]+)/);
        return match ? match[1] : "";
    };

    const fetchAdminProfile = async () => {
        try {
            const profile = await getAdminProfile();
            setAdmin(profile);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            setIsAuthenticated(false);
            setAdmin(null);
            return false;
        }
    };

    const checkAuth = async () => {
        try {
            await fetchAdminProfile();
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
            await authLib.login(email, password);
            // After login, fetch the admin profile
            const success = await fetchAdminProfile();
            return success;
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

    const hasPermission = (permission: string): boolean => {
        if (!admin || !admin.permissions) return false;
        return admin.permissions.includes(permission);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, admin, login, logout, hasPermission }}>
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

