"use client";

import { useEffect, useState } from "react";
import { getBusinesses, searchBusinesses, type BusinessListItem } from "@/lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Building2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, containerVariants, itemVariants, tableRowVariants, buttonTap, buttonHover } from "@/lib/motion-variants";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function BusinessesPage() {
    return (
        <PermissionGuard permission="businesses:view">
            <BusinessesContent />
        </PermissionGuard>
    );
}

function BusinessesContent() {
    const [businesses, setBusinesses] = useState<BusinessListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [storefrontFilter, setStorefrontFilter] = useState<"all" | "with" | "without">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetchBusinesses();
    }, [page, storefrontFilter]);

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

    const fetchBusinesses = async () => {
        setLoading(true);
        try {
            const hasStorefront = storefrontFilter === "all" ? undefined : storefrontFilter === "with";
            const data = await getBusinesses(page, 10, hasStorefront);
            setBusinesses(data);
        } catch (err) {
            setError("Failed to load businesses");
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
            const data = await searchBusinesses(query);
            setBusinesses(data);
        } catch (err) {
            setError("Failed to search businesses");
        } finally {
            setSearching(false);
        }
    };

    const handleSearchInputChange = (value: string) => {
        setSearchQuery(value);
        if (!value.trim()) {
            fetchBusinesses();
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        fetchBusinesses();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(amount);
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
                <motion.div
                    className="flex items-center gap-3"
                    variants={itemVariants}
                >
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                    <h2 className="text-3xl font-bold tracking-tight">Businesses</h2>
                </motion.div>
                <motion.div
                    className="flex items-center gap-4"
                    variants={itemVariants}
                >
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search businesses..."
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
                        <label htmlFor="storefrontFilter" className="text-sm font-medium">
                            Filter:
                        </label>
                        <select
                            id="storefrontFilter"
                            value={storefrontFilter}
                            onChange={(e) => {
                                setStorefrontFilter(e.target.value as "all" | "with" | "without");
                                setPage(1);
                            }}
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            disabled={!!searchQuery}
                        >
                            <option value="all">All Businesses</option>
                            <option value="with">With Storefront</option>
                            <option value="without">Without Storefront</option>
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
                                <TableHead>Phone</TableHead>
                                <TableHead className="text-right">Customers</TableHead>
                                <TableHead className="text-right">Orders</TableHead>
                                <TableHead>Storefront</TableHead>
                                <TableHead className="text-right">Wallet Balance</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="wait">
                                {businesses.map((business) => (
                                    <MotionTableRow
                                        key={business._id}
                                        variants={tableRowVariants}
                                        layout
                                    >
                                        <TableCell className="font-medium">{business.name}</TableCell>
                                        <TableCell>{business.email}</TableCell>
                                        <TableCell>{business.phone_no}</TableCell>
                                        <TableCell className="text-right">{business.customers_count}</TableCell>
                                        <TableCell className="text-right">{business.orders_count}</TableCell>
                                        <TableCell>
                                            <Badge variant={business.has_storefront ? "default" : "secondary"}>
                                                {business.has_storefront ? "Yes" : "No"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(business.wallet_balance)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/businesses/${business._id}`)}
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
                        disabled={businesses.length < 10 || loading}
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
