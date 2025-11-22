"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getWorkflow, updateWorkflow, updateWorkflowState, deleteWorkflow, Workflow, UpdateWorkflowRequest } from "@/lib/api";
import { Loader2, ArrowLeft, GitMerge, PlayCircle, PauseCircle, Mail, Clock, Send, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

export default function WorkflowDetailPage() {
    const params = useParams();
    const router = useRouter();
    const workflowId = params.id as string;

    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isTogglingState, setIsTogglingState] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<UpdateWorkflowRequest>>({});

    useEffect(() => {
        async function loadWorkflow() {
            try {
                const data = await getWorkflow(workflowId);
                setWorkflow(data);
            } catch (error) {
                console.error("Failed to load workflow:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadWorkflow();
    }, [workflowId]);

    const handleEdit = () => {
        if (!workflow) return;
        setEditFormData({
            name: workflow.name,
            description: workflow.description,
        });
        setIsEditing(true);
    };

    const handleUpdate = async () => {
        if (!workflow) return;

        try {
            const updated = await updateWorkflow(workflow._id, editFormData);
            setWorkflow(updated);
            setIsEditing(false);
            toast.success("Workflow updated successfully!");
        } catch (error) {
            console.error("Failed to update workflow:", error);
            toast.error("Failed to update workflow. Please try again.");
        }
    };

    const handleToggleState = async () => {
        if (!workflow) return;

        setIsTogglingState(true);
        try {
            const updated = await updateWorkflowState(workflow._id, !workflow.is_active);
            setWorkflow(updated);
            toast.success(`Workflow ${updated.is_active ? 'activated' : 'deactivated'} successfully!`);
        } catch (error) {
            console.error("Failed to toggle workflow state:", error);
            toast.error("Failed to toggle workflow state. Please try again.");
        } finally {
            setIsTogglingState(false);
        }
    };

    const handleDelete = async () => {
        if (!workflow) return;
        if (!confirm(`Are you sure you want to delete "${workflow.name}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteWorkflow(workflow._id);
            toast.success("Workflow deleted successfully!");
            router.push("/marketing/workflows");
        } catch (error) {
            console.error("Failed to delete workflow:", error);
            toast.error("Failed to delete workflow. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!workflow) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/marketing/workflows">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h3 className="text-lg font-medium">Workflow not found</h3>
                    </div>
                </div>
            </div>
        );
    }

    const getStepIcon = (type: string) => {
        switch (type) {
            case "send_email":
                return <Mail className="h-4 w-4" />;
            case "send_sms":
                return <Send className="h-4 w-4" />;
            case "wait":
                return <Clock className="h-4 w-4" />;
            default:
                return <GitMerge className="h-4 w-4" />;
        }
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return "N/A";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/marketing/workflows">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium">{workflow.name}</h3>
                        {workflow.is_active ? (
                            <Badge className="bg-green-100 text-green-800">
                                <PlayCircle className="mr-1 h-3 w-3" />
                                Active
                            </Badge>
                        ) : (
                            <Badge className="bg-gray-100 text-gray-800">
                                <PauseCircle className="mr-1 h-3 w-3" />
                                Inactive
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Workflow Details
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleToggleState}
                        disabled={isTogglingState}
                    >
                        {isTogglingState ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : workflow.is_active ? (
                            <PauseCircle className="mr-2 h-4 w-4" />
                        ) : (
                            <PlayCircle className="mr-2 h-4 w-4" />
                        )}
                        {workflow.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                    </Button>
                </div>
            </div>

            {/* Edit Workflow Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Workflow</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Workflow Name</Label>
                            <Input
                                id="edit-name"
                                value={editFormData.name || ""}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Input
                                id="edit-description"
                                value={editFormData.description || ""}
                                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Workflow Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Name</label>
                            <p className="mt-1 text-sm">{workflow.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Description</label>
                            <p className="mt-1 text-sm">{workflow.description || "No description"}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                            <div className="mt-1">
                                <Badge className={workflow.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                    {workflow.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Created At</label>
                            <p className="mt-1 text-sm">{format(new Date(workflow.created_at), 'PPP')}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                            <p className="mt-1 text-sm">{format(new Date(workflow.updated_at), 'PPP')}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Trigger Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Trigger Type</label>
                            <div className="mt-1">
                                <Badge className="capitalize">
                                    {workflow.trigger_type}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Trigger Event</label>
                            <code className="mt-1 block text-xs bg-muted p-3 rounded-md">
                                {workflow.trigger_config.event || JSON.stringify(workflow.trigger_config, null, 2)}
                            </code>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Total Steps</label>
                            <p className="mt-1 text-2xl font-bold">{workflow.steps.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Workflow Steps</CardTitle>
                </CardHeader>
                <CardContent>
                    {workflow.steps.length === 0 ? (
                        <div className="flex h-48 flex-col items-center justify-center text-center">
                            <GitMerge className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground">
                                No steps configured for this workflow
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {workflow.steps.map((step, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        {getStepIcon(step.type)}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium">
                                                Step {index + 1}: {step.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                            </h4>
                                            <Badge variant="outline" className="text-xs">
                                                {step.type}
                                            </Badge>
                                        </div>

                                        {step.type === "wait" && step.duration && (
                                            <p className="text-sm text-muted-foreground">
                                                Wait for: <span className="font-medium">{formatDuration(step.duration)}</span>
                                            </p>
                                        )}

                                        {(step.type === "send_email" || step.type === "send_sms") && (
                                            <div className="space-y-1">
                                                {step.subject && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Subject: <span className="font-medium">{step.subject}</span>
                                                    </p>
                                                )}
                                                {step.template_id && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Template: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{step.template_id}</code>
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
