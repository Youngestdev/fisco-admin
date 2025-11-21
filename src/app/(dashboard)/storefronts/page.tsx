"use client";

import { useEffect, useState } from "react";
import { getStorefronts, searchStorefronts, type StorefrontListItem } from "@/lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Store, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, containerVariants, itemVariants, tableRowVariants, buttonTap, buttonHover } from "@/lib/motion-variants";

export default function StorefrontsPage() {
    const [storefronts, setStorefronts] = useState<StorefrontListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetchStorefronts();
    }, [page]);

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

    const fetchStorefronts = async () => {
        setLoading(true);
        try {
            const data = await getStorefronts(page, 10);
            setStorefronts(data);
        } catch (err) {
            setError("Failed to load storefronts");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            return;
        }
        setSearching(true);
        try {
            const data = await searchStorefronts(query);
            setStorefronts(data);
        } catch (err) {
            setError("Failed to search storefronts");
        } finally {
            setSearching(false);
        }
    };

    const handleSearchInputChange = (value: string) => {
        setSearchQuery(value);
        if (!value.trim()) {
            fetchStorefronts();
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        fetchStorefronts();
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
                    <Store className="h-8 w-8 text-muted-foreground" />
                    <h2 className="text-3xl font-bold tracking-tight">Storefronts</h2>
                </motion.div>
                <motion.div
                    className="relative w-64"
                    variants={itemVariants}
                >
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search storefronts..."
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
                                <TableHead>Business</TableHead>
                                <TableHead>Subdomain</TableHead>
                                <TableHead>Custom Domain</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Items</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="wait">
                                {storefronts.map((storefront) => (
                                    <MotionTableRow
                                        key={storefront._id}
                                        variants={tableRowVariants}
                                        layout
                                    >
                                        <TableCell className="font-medium">{storefront.name}</TableCell>
                                        <TableCell>{storefront.business_name}</TableCell>
                                        <TableCell className="font-mono text-sm">{storefront.subdomain}</TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {storefront.custom_domain || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={storefront.status === "active" ? "default" : "secondary"}>
                                                {storefront.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{storefront.items_count}</TableCell>
                                        <TableCell>{formatDate(storefront.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/storefronts/${storefront._id}`)}
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
                        disabled={storefronts.length < 10 || loading}
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
