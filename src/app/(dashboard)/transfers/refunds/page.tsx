"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    getRefunds,
    type Refund,
    type RefundsListResponse,
} from "@/lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    pageVariants,
    containerVariants,
    tableRowVariants,
} from "@/lib/motion-variants";
import { PermissionGuard } from "@/components/PermissionGuard";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
    }).format(amount);
};

const getStatusVariant = (status: string) => {
    switch (status) {
        case "completed":
            return "default";
        case "pending":
        case "processing":
            return "secondary";
        case "failed":
            return "destructive";
        default:
            return "secondary";
    }
};

const MotionTableRow = motion.create(TableRow);

export default function RefundsPage() {
    return (
        <PermissionGuard permission="transfers:view">
            <RefundsContent />
        </PermissionGuard>
    );
}

function RefundsContent() {
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const perPage = 20;

    useEffect(() => {
        fetchRefunds();
    }, [page, statusFilter]);

    const fetchRefunds = async () => {
        setLoading(true);
        try {
            const params: { page: number; per_page: number; status?: string } = {
                page,
                per_page: perPage,
            };
            if (statusFilter !== "all") {
                params.status = statusFilter;
            }
            const data = await getRefunds(params);
            setRefunds(data.refunds);
            setTotal(data.total);
            setError("");
        } catch (err) {
            setError("Failed to load refunds");
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(total / perPage);

    return (
        <motion.div
            className="space-y-6"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="flex items-center gap-4">
                <Link href="/transfers">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Refunds</h2>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {refunds.length} of {total} refunds
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {error && <div className="text-destructive">{error}</div>}

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : refunds.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                    <p className="text-muted-foreground">No refunds found</p>
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
                                <TableHead>Refund ID</TableHead>
                                <TableHead>Withdrawal</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Processed</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="wait">
                                {refunds.map((refund) => (
                                    <MotionTableRow
                                        key={refund.id}
                                        variants={tableRowVariants}
                                        layout
                                    >
                                        <TableCell className="font-mono text-xs">
                                            {refund.id.slice(0, 8)}...
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/transfers/withdrawals/${refund.withdrawal_id}`}
                                                className="font-mono text-xs text-primary hover:underline"
                                            >
                                                {refund.withdrawal_id.slice(0, 8)}...
                                            </Link>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {formatCurrency(refund.amount)}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {refund.reason}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(refund.status)}>
                                                {refund.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(refund.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {refund.processed_at
                                                ? new Date(refund.processed_at).toLocaleDateString()
                                                : "-"}
                                        </TableCell>
                                    </MotionTableRow>
                                ))}
                            </AnimatePresence>
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
                <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages || 1}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages || loading}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
}
