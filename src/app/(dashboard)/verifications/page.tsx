"use client";

import { useEffect, useState } from "react";
import {
    getPendingVerifications,
    approveVerification,
    rejectVerification,
    type PendingVerification,
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
import { Loader2, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
    pageVariants,
    containerVariants,
    tableRowVariants,
    buttonTap,
    buttonHover,
} from "@/lib/motion-variants";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function VerificationsPage() {
    return (
        <PermissionGuard permission="verifications:view">
            <VerificationsContent />
        </PermissionGuard>
    );
}

function VerificationsContent() {
    const [verifications, setVerifications] = useState<PendingVerification[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [error, setError] = useState("");
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [documentModalOpen, setDocumentModalOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [selectedVerification, setSelectedVerification] = useState<PendingVerification | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectAdditionalInfo, setRejectAdditionalInfo] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchVerifications();
    }, [page]);

    const fetchVerifications = async () => {
        setLoading(true);
        try {
            const data = await getPendingVerifications(page, 10);
            setVerifications(data);
            setError("");
        } catch (err) {
            setError("Failed to load pending verifications");
            toast({
                title: "Error",
                description: "Failed to load pending verifications",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = (verification: PendingVerification) => {
        setSelectedVerification(verification);
        setApproveDialogOpen(true);
    };

    const handleApproveConfirm = async () => {
        if (!selectedVerification) return;

        setSubmitting(true);
        try {
            await approveVerification(selectedVerification.user_id);
            toast({
                title: "Success",
                description: `Verification approved for ${selectedVerification.user_email}`,
            });
            setApproveDialogOpen(false);
            fetchVerifications();
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to approve verification",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRejectClick = (verification: PendingVerification) => {
        setSelectedVerification(verification);
        setRejectReason("");
        setRejectAdditionalInfo("");
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!selectedVerification) return;

        if (rejectReason.trim().length < 10) {
            toast({
                title: "Validation Error",
                description: "Reason must be at least 10 characters",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);
        try {
            await rejectVerification(selectedVerification.user_id, {
                reason: rejectReason,
                additional_info: rejectAdditionalInfo || undefined,
            });
            toast({
                title: "Success",
                description: `Verification rejected and email sent to ${selectedVerification.user_email}`,
            });
            setRejectModalOpen(false);
            fetchVerifications();
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to reject verification",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewDocument = (verification: PendingVerification) => {
        setSelectedVerification(verification);
        setDocumentModalOpen(true);
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
                <motion.h2 className="text-3xl font-bold tracking-tight">
                    Business Verifications
                </motion.h2>
            </div>

            {error && <div className="text-destructive">{error}</div>}

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : verifications.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                    <p className="text-muted-foreground">No pending verifications</p>
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
                                <TableHead>User</TableHead>
                                <TableHead>Business</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="wait">
                                {verifications.map((verification) => (
                                    <MotionTableRow
                                        key={verification.user_id}
                                        variants={tableRowVariants}
                                        layout
                                    >
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{verification.user_name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {verification.user_email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{verification.business_name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {verification.business_email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="uppercase">
                                            {verification.verification_type}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(verification.submitted_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {verification.latest_status.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewDocument(verification)}
                                                    >
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        View Doc
                                                    </Button>
                                                </motion.div>
                                                <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => handleApproveClick(verification)}
                                                        disabled={submitting}
                                                    >
                                                        Approve
                                                    </Button>
                                                </motion.div>
                                                <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleRejectClick(verification)}
                                                        disabled={submitting}
                                                    >
                                                        Reject
                                                    </Button>
                                                </motion.div>
                                            </div>
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
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={verifications.length < 10 || loading}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Approve Confirmation Dialog */}
            <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve Verification</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to approve verification for {selectedVerification?.user_name}?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApproveConfirm} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Approve
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Modal */}
            <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Verification</DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejecting this verification. An email will be sent to the
                            user with your feedback.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">
                                Reason <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="reason"
                                placeholder="Explain why the verification is being rejected (minimum 10 characters)"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                            />
                            <p className="text-sm text-muted-foreground">
                                {rejectReason.length}/10 characters minimum
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="additional_info">Additional Information (Optional)</Label>
                            <Textarea
                                id="additional_info"
                                placeholder="Provide additional instructions or feedback"
                                value={rejectAdditionalInfo}
                                onChange={(e) => setRejectAdditionalInfo(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRejectModalOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectSubmit}
                            disabled={submitting || rejectReason.trim().length < 10}
                        >
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reject & Send Email
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Document Preview Modal */}
            <Dialog open={documentModalOpen} onOpenChange={setDocumentModalOpen}>
                <DialogContent className="max-w-4xl h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Verification Document</DialogTitle>
                        <DialogDescription>
                            {selectedVerification?.business_name} - {selectedVerification?.verification_type.toUpperCase()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden">
                        {selectedVerification && (
                            <iframe
                                src={selectedVerification.document_url}
                                className="w-full h-full border rounded"
                                title="Verification Document"
                            />
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDocumentModalOpen(false)}>
                            Close
                        </Button>
                        {selectedVerification && (
                            <Button
                                variant="default"
                                onClick={() => window.open(selectedVerification.document_url, "_blank")}
                            >
                                Open in New Tab
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}

const MotionTableRow = motion(TableRow);
