"use client";

import { useEffect, useState } from "react";
import { getUsers, searchUsers } from "@/lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, containerVariants, itemVariants, tableRowVariants, buttonTap, buttonHover } from "@/lib/motion-variants";
import { PermissionGuard } from "@/components/PermissionGuard";

interface User {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
    has_business: boolean;
    created_at: string;
    tier: string;
}

export default function UsersPage() {
    return (
        <PermissionGuard permission="users:view">
            <UsersContent />
        </PermissionGuard>
    );
}

function UsersContent() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, [page, statusFilter]);

    // Debounced search effect
    useEffect(() => {
        if (!searchQuery.trim()) {
            return;
        }

        const timeoutId = setTimeout(() => {
            handleSearch(searchQuery);
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const inactive = statusFilter === "all" ? undefined : statusFilter === "inactive";
            const data = await getUsers(page, 10, inactive);
            setUsers(data);
        } catch (err) {
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            return;
        }
        setSearching(true);
        try {
            const data = await searchUsers(query);
            setUsers(data);
        } catch (err) {
            setError("Failed to search users");
        } finally {
            setSearching(false);
        }
    };

    const handleSearchInputChange = (value: string) => {
        setSearchQuery(value);
        if (!value.trim()) {
            fetchUsers();
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        fetchUsers();
    };

    return (
        <motion.div
            className="space-y-6"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="flex items-center justify-between">
                <motion.h2
                    className="text-3xl font-bold tracking-tight"
                    variants={itemVariants}
                >
                    Users
                </motion.h2>
                <motion.div
                    className="flex items-center gap-4"
                    variants={itemVariants}
                >
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => handleSearchInputChange(e.target.value)}
                            className="pl-8 pr-8"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <label htmlFor="statusFilter" className="text-sm font-medium">
                            Filter:
                        </label>
                        <select
                            id="statusFilter"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value as "all" | "active" | "inactive");
                                setPage(1);
                            }}
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            disabled={!!searchQuery}
                        >
                            <option value="all">All Users</option>
                            <option value="active">Active Users</option>
                            <option value="inactive">Inactive Users</option>
                        </select>
                    </div>
                </motion.div>
            </div>

            {error && <div className="text-destructive">{error}</div>}

            {(loading || searching) ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <motion.div
                    className="rounded-md border"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tier</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="wait">
                                {users.map((user) => (
                                    <MotionTableRow
                                        key={user.id}
                                        variants={tableRowVariants}
                                        layout
                                    >
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.is_active ? "default" : "secondary"}>
                                                {user.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            {user.tier.replace("_", " ")}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/users/${user.id}`)}
                                                >
                                                    View
                                                </Button>
                                            </motion.div>
                                        </TableCell>
                                    </MotionTableRow>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </motion.div>
            )}

            {!searchQuery && (
                <div className="flex items-center justify-end space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={users.length < 10 || loading}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </motion.div>
    );
}

const MotionTableRow = motion(TableRow);
