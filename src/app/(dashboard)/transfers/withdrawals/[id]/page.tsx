"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    getWithdrawal,
    retryWithdrawal,
    createRefund,
    type WithdrawalDetail,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Loader2,
    ArrowLeft,
    RefreshCcw,
    XCircle,
    CheckCircle,
    Clock,
    AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { pageVariants } from "@/lib/motion-variants";
import { useToast } from "@/hooks/use-toast";

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

const getStatusIcon = (status: string) => {
    switch (status) {
        case "completed":
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        case "pending":
        case "processing":
            return <Clock className="h-5 w-5 text-yellow-500" />;
        case "failed":
            return <XCircle className="h-5 w-5 text-destructive" />;
        case "refunded":
            return <RefreshCcw className="h-5 w-5 text-blue-500" />;
        default:
            return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
};

export default function WithdrawalDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const withdrawalId = params.id as string;

    const [withdrawal, setWithdrawal] = useState<WithdrawalDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retryDialogOpen, setRetryDialogOpen] = useState(false);
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [refundReason, setRefundReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchWithdrawal();
    }, [withdrawalId]);

    const fetchWithdrawal = async () => {
        setLoading(true);
        try {
            const data = await getWithdrawal(withdrawalId);
            setWithdrawal(data);
            setError("");
        } catch (err) {
            setError("Failed to load withdrawal details");
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async () => {
        setSubmitting(true);
        try {
            const result = await retryWithdrawal(withdrawalId);
            toast({
                title: "Retry Initiated",
                description: result.message || "Withdrawal retry has been initiated",
            });
            setRetryDialogOpen(false);
            fetchWithdrawal();
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to retry withdrawal",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateRefund = async () => {
        if (refundReason.trim().length < 10) {
            toast({
                title: "Validation Error",
                description: "Reason must be at least 10 characters",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);
        try {
            const result = await createRefund({
                withdrawal_id: withdrawalId,
                reason: refundReason,
            });
            toast({
                title: "Refund Created",
                description: `Refund of ${formatCurrency(result.amount_refunded)} has been processed`,
            });
            setRefundDialogOpen(false);
            setRefundReason("");
            fetchWithdrawal();
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to create refund",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !withdrawal) {
        return (
            <div className="space-y-4">
                <div className="text-destructive">{error || "Withdrawal not found"}</div>
                <Link href="/transfers/withdrawals">
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Withdrawals
                    </Button>
                </Link>
            </div>
        );
    }

    const canRetry = withdrawal.status === "failed";
    const canRefund = ["pending", "failed"].includes(withdrawal.status);

    return (
        <motion.div
            className="space-y-6"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/transfers/withdrawals">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Withdrawal Details</h2>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusIcon(withdrawal.status)}
                    <Badge variant={getStatusVariant(withdrawal.status)} className="text-sm">
                        {withdrawal.status}
                    </Badge>
                </div>
            </div>

            {/* Main Info */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Withdrawal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Withdrawal ID</span>
                            <span className="font-mono text-sm">{withdrawal.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount</span>
                            <span className="font-bold text-lg">
                                {formatCurrency(withdrawal.amount)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Business ID</span>
                            <span className="font-mono text-sm">{withdrawal.business_id}</span>
                        </div>
                        {withdrawal.account_name && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Account Name</span>
                                <span>{withdrawal.account_name}</span>
                            </div>
                        )}
                        {withdrawal.bank_name && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Bank</span>
                                <span>{withdrawal.bank_name}</span>
                            </div>
                        )}
                        {withdrawal.transfer_code && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Transfer Code</span>
                                <span className="font-mono text-sm">{withdrawal.transfer_code}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Created</span>
                            <span>{new Date(withdrawal.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Failed Attempts</span>
                            <span className={withdrawal.failed_attempts_count > 0 ? "text-destructive font-medium" : ""}>
                                {withdrawal.failed_attempts_count}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>Manage this withdrawal</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {withdrawal.failure_reason && (
                            <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                                <div className="flex items-center gap-2 text-destructive font-medium mb-1">
                                    <AlertTriangle className="h-4 w-4" />
                                    Failure Reason
                                </div>
                                <p className="text-sm">{withdrawal.failure_reason}</p>
                            </div>
                        )}
                        <div className="flex gap-2">
                            {canRetry && (
                                <Button onClick={() => setRetryDialogOpen(true)} className="flex-1">
                                    <RefreshCcw className="h-4 w-4 mr-2" />
                                    Retry Transfer
                                </Button>
                            )}
                            {canRefund && (
                                <Button
                                    variant="outline"
                                    onClick={() => setRefundDialogOpen(true)}
                                    className="flex-1"
                                >
                                    Create Refund
                                </Button>
                            )}
                        </div>
                        {!canRetry && !canRefund && (
                            <p className="text-sm text-muted-foreground text-center">
                                No actions available for this withdrawal
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Failed Attempts */}
            {withdrawal.failed_attempts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Failed Transfer Attempts</CardTitle>
                        <CardDescription>
                            History of failed transfer attempts for this withdrawal
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {withdrawal.failed_attempts.map((attempt, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
                                >
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-destructive/10 text-destructive font-medium text-sm">
                                        {attempt.attempt_number}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{attempt.error_type}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(attempt.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {attempt.error_message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Refunds */}
            {withdrawal.refunds.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Related Refunds</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {withdrawal.refunds.map((refund) => (
                                <div
                                    key={refund.id}
                                    className="flex items-start justify-between p-4 bg-muted/50 rounded-lg"
                                >
                                    <div>
                                        <div className="font-medium">
                                            {formatCurrency(refund.amount)}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {refund.reason}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(refund.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <Badge variant={getStatusVariant(refund.status)}>
                                        {refund.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Retry Dialog */}
            <AlertDialog open={retryDialogOpen} onOpenChange={setRetryDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Retry Withdrawal</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will attempt to process the withdrawal of{" "}
                            <strong>{formatCurrency(withdrawal.amount)}</strong> again.
                            Are you sure you want to proceed?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRetry} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Retry Transfer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Refund Dialog */}
            <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Refund</DialogTitle>
                        <DialogDescription>
                            This will refund <strong>{formatCurrency(withdrawal.amount)}</strong> back
                            to the business wallet.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">
                                Refund Reason <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="reason"
                                placeholder="Explain the reason for this refund (minimum 10 characters)"
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                rows={4}
                            />
                            <p className="text-sm text-muted-foreground">
                                {refundReason.length}/10 characters minimum
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRefundDialogOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateRefund}
                            disabled={submitting || refundReason.trim().length < 10}
                        >
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Refund
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
