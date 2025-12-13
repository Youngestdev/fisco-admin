"use client";

import { useEffect, useState } from "react";
import { getBusinessInventory, type InventoryItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, cardVariants, tableRowVariants } from "@/lib/motion-variants";

// Animated component definitions
const MotionCard = motion(Card);
const MotionTableRow = motion(TableRow);

export default function BusinessInventoryPage() {
    const params = useParams();
    const businessId = params.id as string;
    if (!businessId) {
        return <div className="text-destructive">Business ID not provided</div>;
    }
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [error, setError] = useState("");
    const router = useRouter();
    const pageSize = 20;

    useEffect(() => {
        if (businessId) {
            fetchInventory();
        }
    }, [businessId, page]);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const data = await getBusinessInventory(businessId, page, pageSize);
            // Determine inventory items: could be an array or an object with an 'inventory' field
            const items = Array.isArray(data) ? data : (data as any).inventory;
            if (Array.isArray(items)) {
                setInventory(items);
            } else {
                console.warn('Unexpected inventory response shape', data);
                setInventory([]);
            }
        } catch (err) {
            console.error('Failed to load inventory', err);
            setError('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        const amountInNaira = Math.round(amount / 100 * 100) / 100; // Divide by 100 and round to 2 dp
        return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amountInNaira);
    };

    return (
        <motion.div
            className="space-y-6"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Business Inventory</h2>
            </div>

            {error && <div className="text-destructive">{error}</div>}

            <MotionCard variants={cardVariants}>
                <CardHeader>
                    <CardTitle>All Inventory Items</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : inventory.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Stock</TableHead>
                                        <TableHead>Variations</TableHead>
                                        <TableHead>Image</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence mode="wait">
                                        {inventory.map((item) => (
                                            <MotionTableRow
                                                key={item._id}
                                                variants={tableRowVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="hidden"
                                                layout
                                            >
                                                <TableCell className="font-mono text-sm font-medium">{item.SKU}</TableCell>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{item.description}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant={item.quantity_in_stock > 10 ? "default" : "destructive"}>
                                                        {item.quantity_in_stock}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {item.has_variations && item.variations ? (
                                                        <div className="space-y-1">
                                                            <Badge variant="secondary">Yes</Badge>
                                                            <div className="text-xs text-muted-foreground">
                                                                {item.variations.map((v) => v.name).join(", ")}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <Badge variant="outline">No</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded object-cover" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                                            No img
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </MotionTableRow>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No inventory items found</p>
                    )}
                </CardContent>
            </MotionCard>

            <div className="flex items-center justify-end space-x-2 mt-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <div className="text-sm text-muted-foreground">Page {page}</div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={inventory.length < pageSize || loading}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
}
