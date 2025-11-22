"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getWorkflows, createWorkflow, Workflow } from "@/lib/api";
import { Plus, GitMerge, Loader2, PlayCircle, PauseCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newWorkflow, setNewWorkflow] = useState({
        name: "",
        description: "",
        trigger_type: "event" as "event" | "schedule",
        trigger_config: { event: "user.signup" },
        steps: [],
    });

    useEffect(() => {
        loadWorkflows();
    }, []);

    async function loadWorkflows() {
        try {
            const data = await getWorkflows();
            setWorkflows(data);
        } catch (error) {
            console.error("Failed to load workflows:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await createWorkflow(newWorkflow);
            setIsDialogOpen(false);
            setNewWorkflow({
                name: "",
                description: "",
                trigger_type: "event",
                trigger_config: { event: "user.signup" },
                steps: []
            });
            loadWorkflows();
        } catch (error) {
            console.error("Failed to create workflow:", error);
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Workflows</h3>
                    <p className="text-sm text-muted-foreground">
                        Automate your marketing with event-based workflows.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Workflow
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Workflow</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Workflow Name</Label>
                                    <Input
                                        id="name"
                                        value={newWorkflow.name}
                                        onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                                        placeholder="e.g. Welcome Series"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={newWorkflow.description}
                                        onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                                        placeholder="Describe this workflow"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="trigger">Trigger Event</Label>
                                    <Select
                                        value={newWorkflow.trigger_config.event}
                                        onValueChange={(value) => setNewWorkflow({
                                            ...newWorkflow,
                                            trigger_config: { event: value }
                                        })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select trigger" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user.signup">User Signup</SelectItem>
                                            <SelectItem value="order.created">Order Created</SelectItem>
                                            <SelectItem value="order.delivered">Order Delivered</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Workflow
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workflows.map((workflow) => (
                    <Link key={workflow._id} href={`/marketing/workflows/${workflow._id}`}>
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold leading-none tracking-tight">{workflow.name}</h3>
                                    {workflow.is_active ? (
                                        <PlayCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <PauseCircle className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">{workflow.description || "No description"}</p>

                                <div className="flex items-center gap-2 text-sm">
                                    <GitMerge className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Trigger:</span>
                                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                        {workflow.trigger_config.event || "Unknown"}
                                    </code>
                                </div>

                                <div className="pt-4 flex items-center justify-between text-xs text-muted-foreground border-t">
                                    <span>{workflow.steps.length} steps</span>
                                    <span>{format(new Date(workflow.created_at), 'PPP')}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
                {workflows.length === 0 && (
                    <div className="col-span-full flex h-48 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <GitMerge className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No workflows created</h3>
                        <p className="mb-4 mt-2 text-sm text-muted-foreground">
                            Create your first automation workflow to engage users automatically.
                        </p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Workflow
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
