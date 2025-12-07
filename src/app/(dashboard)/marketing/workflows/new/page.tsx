"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createWorkflow, CreateWorkflowRequest } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { WorkflowForm } from "../WorkflowForm";

export default function NewWorkflowPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: CreateWorkflowRequest) => {
        setIsLoading(true);
        try {
            await createWorkflow(data);
            router.push("/marketing/workflows");
        } catch (error) {
            console.error("Failed to create workflow:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/marketing/workflows">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h3 className="text-lg font-medium">Create Workflow</h3>
                    <p className="text-sm text-muted-foreground">
                        Design an automated marketing workflow.
                    </p>
                </div>
            </div>

            <WorkflowForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                submitLabel="Create Workflow"
                onCancel={() => router.push("/marketing/workflows")}
            />
        </div>
    );
}
