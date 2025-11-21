"use client";

import { useEffect, useState } from "react";
import { getBusinessCustomers, type Customer } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, Mail, Phone, MapPin } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, containerVariants, cardVariants, tableRowVariants } from "@/lib/motion-variants";

// Animated component definitions
const MotionCard = motion(Card);
const MotionTableRow = motion(TableRow);

export default function BusinessCustomersPage() {
    const params = useParams();
    const businessId = params.id as string;
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [error, setError] = useState("");
    const router = useRouter();
    const pageSize = 20;

    useEffect(() => {
        if (businessId) {
            fetchCustomers();
        }
    }, [businessId, page]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await getBusinessCustomers(businessId, page, pageSize);
            setCustomers(data);
        } catch (err) {
            console.error("Failed to load customers", err);
            setError("Failed to load customers");
        } finally {
            setLoading(false);
        }
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
                <h2 className="text-3xl font-bold tracking-tight">Business Customers</h2>
            </div>

            {error && <div className="text-destructive">{error}</div>}

            <MotionCard variants={cardVariants}>
                <CardHeader>
                    <CardTitle>All Customers</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : customers.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead className="text-right">Orders</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence mode="wait">
                                        {customers.map((customer, idx) => (
                                            <MotionTableRow
                                                key={idx}
                                                variants={tableRowVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="hidden"
                                                layout
                                            >
                                                <TableCell className="font-medium">{customer.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                                        {customer.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                                        {customer.phone_no}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm max-w-xs truncate">
                                                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                                        {customer.address}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{customer.vendor}</TableCell>
                                                <TableCell className="text-right">{customer.orders?.length || 0}</TableCell>
                                            </MotionTableRow>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No customers found</p>
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
                    disabled={customers.length < pageSize || loading}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
}
