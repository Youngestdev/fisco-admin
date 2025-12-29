"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createCampaign, getSegments, Segment } from "@/lib/api";
import { renderCampaignContent } from "@/lib/campaign-utils";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCampaignPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        subject: "",
        content: "",
        type: "email" as "email" | "sms",
        segment_id: "",
        scheduled_at: "",
    });

    // ... (rest of the component unchanged)

    // Inside the form JSX, add a new input for scheduled_at after the segment selector
    // (We'll replace the segment selector block with an extended version including the new field)


    useEffect(() => {
        async function loadSegments() {
            try {
                const data = await getSegments();
                setSegments(data.segments || []);
            } catch (error) {
                console.error("Failed to load segments:", error);
            }
        }
        loadSegments();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Build payload matching CreateCampaignRequest
            const payload: any = {
                name: formData.name,
                subject: formData.subject,
                content: formData.content,
                type: formData.type,
                segment_id: formData.segment_id,
                template: "marketing-default.html",
            };
            if (formData.scheduled_at) {
                payload.scheduled_at = formData.scheduled_at;
            }
            await createCampaign(payload);
            router.push("/marketing/campaigns");
        } catch (error) {
            console.error("Failed to create campaign:", error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/marketing/campaigns">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h3 className="text-lg font-medium">Create Campaign</h3>
                    <p className="text-sm text-muted-foreground">
                        Design and schedule your new marketing campaign.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input
                        id="name"
                        placeholder="e.g. Black Friday Sale"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input
                        id="subject"
                        placeholder="e.g. 50% Off Everything!"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value: string) => setFormData({ ...formData, type: value as "email" | "sms" })}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="sms">SMS</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="segment">Audience Segment</Label>
                        <Select
                            value={formData.segment_id}
                            onValueChange={(value) => setFormData({ ...formData, segment_id: value })}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                            <SelectContent>
                                {segments.map((segment) => (
                                    <SelectItem key={segment.id} value={segment.id}>
                                        {segment.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="scheduled_at">Scheduled At (optional)</Label>
                    <Input
                        id="scheduled_at"
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Content</Label>
                    <Tabs defaultValue="edit" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="edit">Edit</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>
                        <TabsContent value="edit">
                            <Textarea
                                id="content"
                                className="min-h-[300px] font-mono"
                                placeholder="Hello {{ name }}..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                Supports <code>{"{{ name }}"}</code> variable. Use <code>&lt;cta text="Button" link="..."&gt;</code> for buttons.
                            </p>
                        </TabsContent>
                        <TabsContent value="preview">
                            <div
                                className="min-h-[300px] rounded-md border p-4 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: renderCampaignContent(formData.content) }}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="flex justify-end gap-4">
                    <Link href="/marketing/campaigns">
                        <Button variant="outline" type="button">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Campaign
                    </Button>
                </div>
            </form>
        </div>
    );
}
