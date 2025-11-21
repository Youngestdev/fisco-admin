"use client";

import { useEffect, useState } from "react";
import { getBusinessOrders, type Order } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, containerVariants, cardVariants, tableRowVariants } from "@/lib/motion-variants";

// Animated component definitions
const MotionCard = motion(Card);
const MotionTableRow = motion(TableRow);

export default function BusinessOrdersPage() {
    const params = useParams();
    const businessId = params.id as string;
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [error, setError] = useState("");
    const router = useRouter();
    const pageSize = 20;

    useEffect(() => {
        if (businessId) {
            fetchOrders();
        }
    }, [businessId, page]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getBusinessOrders(businessId, page, pageSize);
            setOrders(data);
        } catch (err) {
            console.error("Failed to load orders", err);
            setError("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

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
                <h2 className="text-3xl font-bold tracking-tight">Business Orders</h2>
            </div>

            {error && <div className="text-destructive">{error}</div>}

            <MotionCard variants={cardVariants}>
                <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Channel</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>ETA</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence mode="wait">
                                        {orders.map((order) => (
                                            <MotionTableRow
                                                key={order.id}
                                                variants={tableRowVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="hidden"
                                                layout
                                            >
                                                <TableCell className="font-medium font-mono text-sm">{order.reference}</TableCell>
                                                <TableCell>{order.owner.name}</TableCell>
                                                <TableCell className="text-sm">{order.owner.email}</TableCell>
                                                <TableCell className="text-sm">{order.items.length}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{order.source}</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">{order.channel}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {order.timeline[order.timeline.length - 1]?.status || "N/A"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">{formatDate(order.created_at)}</TableCell>
                                                <TableCell className="text-sm">{order.eta ? formatDate(order.eta) : "N/A"}</TableCell>
                                            </MotionTableRow>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No orders found</p>
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
                    disabled={orders.length < pageSize || loading}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
}
