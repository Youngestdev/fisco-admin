"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    getWithdrawals,
    type Withdrawal,
    type WithdrawalListResponse,
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
import { Loader2, ChevronLeft, ChevronRight, Eye, ArrowLeft } from "lucide-react";
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
        case "refunded":
            return "outline";
        default:
            return "secondary";
    }
};

const MotionTableRow = motion.create(TableRow);

export default function WithdrawalsPage() {
    return (
        <PermissionGuard permission="transfers:view">
            <WithdrawalsContent />
        </PermissionGuard>
    );
}

function WithdrawalsContent() {
    const searchParams = useSearchParams();
    const initialStatus = searchParams.get("status") || "all";

    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
    const perPage = 20;

    useEffect(() => {
        fetchWithdrawals();
    }, [page, statusFilter]);

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const params: { page: number; per_page: number; status?: string } = {
                page,
                per_page: perPage,
            };
            if (statusFilter !== "all") {
                params.status = statusFilter;
            }
            console.log("Fetching withdrawals with params:", params);
            const data = await getWithdrawals(params);
            console.log("Received withdrawals:", data);
            setWithdrawals(data.withdrawals);
            setTotal(data.total);
            setError("");
        } catch (err) {
            setError("Failed to load withdrawals");
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
                <h2 className="text-3xl font-bold tracking-tight">Withdrawals</h2>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {withdrawals.length} of {total} withdrawals
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {error && <div className="text-destructive">{error}</div>}

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : withdrawals.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                    <p className="text-muted-foreground">No withdrawals found</p>
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
                                <TableHead>ID</TableHead>
                                <TableHead>Business</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Failed Attempts</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="wait">
                                {withdrawals.map((withdrawal) => (
                                    <MotionTableRow
                                        key={withdrawal.id}
                                        variants={tableRowVariants}
                                        layout
                                    >
                                        <TableCell className="font-mono text-xs">
                                            {withdrawal.id.slice(0, 8)}...
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {withdrawal.business_id.slice(0, 8)}...
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {formatCurrency(withdrawal.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(withdrawal.status)}>
                                                {withdrawal.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {withdrawal.failed_attempts_count > 0 ? (
                                                <span className="text-destructive font-medium">
                                                    {withdrawal.failed_attempts_count}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">0</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(withdrawal.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/transfers/withdrawals/${withdrawal.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </Link>
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
