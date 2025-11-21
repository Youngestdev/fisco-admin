"use client";

import { useEffect, useState } from "react";
import { getBusinessWalletHistory, getBusiness, type Transaction, type BusinessDetail } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, ArrowLeft, Wallet } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { pageVariants, containerVariants, tableRowVariants } from "@/lib/motion-variants";

// Animated component definitions
const MotionTableRow = motion(TableRow);

export default function BusinessWalletHistoryPage() {
    const params = useParams();
    const businessId = params.id as string;
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [business, setBusiness] = useState<BusinessDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (businessId) {
            fetchData();
        }
    }, [businessId, page]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [transactionsData, businessData] = await Promise.all([
                getBusinessWalletHistory(businessId, page, 10),
                getBusiness(businessId),
            ]);
            setTransactions(transactionsData);
            setBusiness(businessData);
        } catch (err) {
            setError("Failed to load wallet history");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    if (loading && !business) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-6"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3">
                    <Wallet className="h-8 w-8 text-muted-foreground" />
                    <h2 className="text-3xl font-bold tracking-tight">
                        Wallet History - {business?.name}
                    </h2>
                </div>
            </div>

            {business && (
                <Card>
                    <CardHeader>
                        <CardTitle>Current Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {business.wallet ? formatCurrency(business.wallet.balance) : "N/A"}
                        </p>
                    </CardContent>
                </Card>
            )}

            {error && <div className="text-destructive">{error}</div>}

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <motion.div variants={containerVariants} className="rounded-md border overflow-x-auto">
                    <Table className="min-w-[800px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Bank</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No transactions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((transaction) => (
                                    <MotionTableRow key={transaction._id} variants={tableRowVariants} layout>
                                        <TableCell>{formatDate(transaction.created_at)}</TableCell>
                                        <TableCell>
                                            <Badge variant={transaction.type === "deposit" ? "default" : "secondary"}>
                                                {transaction.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{transaction.reference || "-"}</TableCell>
                                        <TableCell>{transaction.bank_name || "-"}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            <span className={transaction.type === "deposit" ? "text-green-600" : "text-red-600"}>
                                                {transaction.type === "deposit" ? "+" : "-"}
                                                {formatCurrency(transaction.amount)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                                                {transaction.status || "pending"}
                                            </Badge>
                                        </TableCell>
                                    </MotionTableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </motion.div>
            )}

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
                    disabled={transactions.length < 10 || loading}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
}


