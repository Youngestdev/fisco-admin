"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    getWithdrawals,
    getRefunds,
    type WithdrawalListResponse,
    type RefundsListResponse,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Loader2,
    ArrowUpFromLine,
    RefreshCcw,
    ChevronRight,
    AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { pageVariants, containerVariants } from "@/lib/motion-variants";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function TransfersPage() {
    return (
        <PermissionGuard permission="transfers:view">
            <TransfersContent />
        </PermissionGuard>
    );
}

function TransfersContent() {
    const [withdrawalTotal, setWithdrawalTotal] = useState(0);
    const [refundTotal, setRefundTotal] = useState(0);
    const [failedTotal, setFailedTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Get totals from response
            const [withdrawalsData, refundsData, failedData] = await Promise.all([
                getWithdrawals({ per_page: 1 }),
                getRefunds({ per_page: 1 }),
                getWithdrawals({ status: "failed", per_page: 1 }),
            ]);

            setWithdrawalTotal(withdrawalsData.total);
            setRefundTotal(refundsData.total);
            setFailedTotal(failedData.total);
        } catch (err) {
            setError("Failed to load transfer statistics");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return <div className="text-destructive">{error}</div>;
    }

    return (
        <motion.div
            className="space-y-6"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Transfers</h2>
            </div>

            {/* Stats Cards */}
            <motion.div
                className="grid gap-4 md:grid-cols-3"
                variants={containerVariants}
            >
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
                        <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{withdrawalTotal}</div>
                        <p className="text-xs text-muted-foreground">All time withdrawal requests</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed Transfers</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{failedTotal}</div>
                        <p className="text-xs text-muted-foreground">Withdrawals requiring attention</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
                        <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{refundTotal}</div>
                        <p className="text-xs text-muted-foreground">All time refunds processed</p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Quick Links */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="hover:border-primary transition-colors">
                    <Link href="/transfers/withdrawals">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ArrowUpFromLine className="h-5 w-5" />
                                <div>
                                    <CardTitle>Withdrawals</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        View and manage all withdrawal requests
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="hover:border-destructive transition-colors">
                    <Link href="/transfers/withdrawals?status=failed">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                <div>
                                    <CardTitle>Failed Transfers</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Review and retry failed withdrawals
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="hover:border-primary transition-colors">
                    <Link href="/transfers/refunds">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <RefreshCcw className="h-5 w-5" />
                                <div>
                                    <CardTitle>Refunds</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        View all processed refunds
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                    </Link>
                </Card>
            </div>
        </motion.div>
    );
}
