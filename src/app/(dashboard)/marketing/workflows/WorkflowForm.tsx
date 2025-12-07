"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateWorkflowRequest, Workflow, WorkflowStep } from "@/lib/api";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { renderCampaignContent } from "@/lib/campaign-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkflowFormProps {
    initialData?: Partial<Workflow>;
    onSubmit: (data: CreateWorkflowRequest) => Promise<void>;
    isLoading: boolean;
    submitLabel: string;
    onCancel: () => void;
}

export function WorkflowForm({ initialData, onSubmit, isLoading, submitLabel, onCancel }: WorkflowFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        trigger_type: initialData?.trigger_type || "event",
        trigger_config: (initialData?.trigger_config && Object.keys(initialData.trigger_config).length > 0)
            ? initialData.trigger_config
            : { event: "user.signup" } as Record<string, string>,
    });

    const [steps, setSteps] = useState<WorkflowStep[]>(initialData?.steps || []);

    const addStep = () => {
        setSteps([
            ...steps,
            {
                type: "send_email",
                template_id: "",
                subject: "",
                content: "",
                template: "marketing-default.html"
            }
        ]);
    };

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const updateStep = (index: number, field: keyof WorkflowStep, value: string) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setSteps(newSteps);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            ...formData,
            steps
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Workflow Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Workflow Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Welcome Series"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="trigger_type">Trigger Type</Label>
                            <Select
                                value={formData.trigger_type}
                                onValueChange={(value: "event" | "schedule") => setFormData({ ...formData, trigger_type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="event">Event based</SelectItem>
                                    <SelectItem value="schedule" disabled>Schedule (Coming Soon)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="Describe what this workflow does"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {formData.trigger_type === "event" && (
                        <div className="space-y-2">
                            <Label>Trigger Event</Label>
                            <Select
                                value={formData.trigger_config.event}
                                onValueChange={(value) => setFormData({
                                    ...formData,
                                    trigger_config: { ...formData.trigger_config, event: value }
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an event" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user.signup">User Signup</SelectItem>
                                    <SelectItem value="business.created">Business Created</SelectItem>
                                    <SelectItem value="storefront.created">Storefront Created</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                The workflow will start automatically when this event occurs.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Steps Configuration */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Steps</h3>
                    <Button type="button" onClick={addStep} variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Step
                    </Button>
                </div>

                {steps.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center bg-muted/20">
                        <p className="text-sm text-muted-foreground mb-4">No steps added yet.</p>
                        <Button type="button" onClick={addStep} variant="secondary">
                            Add First Step
                        </Button>
                    </div>
                )}

                {steps.map((step, index) => (
                    <Card key={index} className="relative group">
                        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => removeStep(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardHeader className="pb-3 flex flex-row items-center gap-2">
                            <div className="bg-muted p-2 rounded items-center justify-center flex">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-sm font-medium">
                                Step {index + 1}: Send Email
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Template ID</Label>
                                    <Input
                                        value={step.template_id || ""}
                                        onChange={(e) => updateStep(index, "template_id", e.target.value)}
                                        placeholder="e.g. welcome_email_1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subject Line</Label>
                                    <Input
                                        value={step.subject || ""}
                                        onChange={(e) => updateStep(index, "subject", e.target.value)}
                                        placeholder="Email subject line"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Email Content</Label>
                                <Tabs defaultValue="edit" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 h-8">
                                        <TabsTrigger value="edit" className="text-xs">Edit</TabsTrigger>
                                        <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="edit">
                                        <Textarea
                                            className="min-h-[200px] font-mono text-sm"
                                            placeholder="Email content with {{ variables }}..."
                                            value={step.content || ""}
                                            onChange={(e) => updateStep(index, "content", e.target.value)}
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Supports <code>{"{{ variable }}"}</code> tags and <code>&lt;cta&gt;</code> elements.
                                        </p>
                                    </TabsContent>
                                    <TabsContent value="preview">
                                        <div
                                            className="min-h-[200px] rounded-md border p-4 prose prose-sm max-w-none bg-white"
                                            dangerouslySetInnerHTML={{ __html: renderCampaignContent(step.content || "") }}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
