"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getWorkflows, Workflow } from "@/lib/api";
import { Plus, GitMerge, Loader2, PlayCircle, PauseCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
                <Link href="/marketing/workflows/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Workflow
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workflows.map((workflow) => (
                    <Link key={workflow.id} href={`/marketing/workflows/${workflow.id}`}>
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
                        <Link href="/marketing/workflows/new">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Workflow
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
