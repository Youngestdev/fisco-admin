"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getCampaign, sendCampaign, updateCampaign, deleteCampaign, resendCampaign, getSegments, Campaign, Segment, UpdateCampaignRequest } from "@/lib/api";
import { renderCampaignContent } from "@/lib/campaign-utils";
import { Loader2, ArrowLeft, Send, Calendar, Mail, Users, Edit, Trash2, RotateCw } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

export default function CampaignDetailPage() {
    const router = useRouter();
    const params = useParams();
    const campaignId = params.id as string;

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [editFormData, setEditFormData] = useState<Partial<UpdateCampaignRequest>>({});

    useEffect(() => {
        async function loadCampaign() {
            try {
                const [data, segmentsData] = await Promise.all([
                    getCampaign(campaignId),
                    getSegments()
                ]);
                setCampaign(data);
                setSegments(segmentsData.segments || []);
            } catch (error) {
                console.error("Failed to load campaign:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadCampaign();
    }, [campaignId]);

    const handleSend = async () => {
        if (!campaign) return;

        setIsSending(true);
        try {
            await sendCampaign(campaign._id);
            // Reload campaign to get updated status
            const updated = await getCampaign(campaignId);
            setCampaign(updated);
            toast.success("Campaign queued for sending!");
        } catch (error) {
            console.error("Failed to send campaign:", error);
            toast.error("Failed to send campaign. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    const handleEdit = () => {
        if (!campaign) return;
        setEditFormData({
            name: campaign.name,
            subject: campaign.subject,
            content: campaign.content.replace(/<br \/>/g, "\n"),
            scheduled_at: campaign.scheduled_at || "",
            segment_id: campaign.segment_id,
        });
        setIsEditing(true);
    };

    const handleUpdate = async () => {
        if (!campaign) return;

        try {
            const updated = await updateCampaign(campaign._id, editFormData);
            setCampaign(updated);
            setIsEditing(false);
            toast.success("Campaign updated successfully!");
        } catch (error) {
            console.error("Failed to update campaign:", error);
            toast.error("Failed to update campaign. Please try again.");
        }
    };

    const handleDelete = async () => {
        if (!campaign) return;
        if (!confirm(`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteCampaign(campaign._id);
            toast.success("Campaign deleted successfully!");
            router.push("/marketing/campaigns");
        } catch (error) {
            console.error("Failed to delete campaign:", error);
            toast.error("Failed to delete campaign. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleResend = async () => {
        if (!campaign) return;

        setIsResending(true);
        try {
            await resendCampaign(campaign._id);
            toast.success("Campaign resent successfully!");
            // Reload campaign to get updated status
            const updated = await getCampaign(campaignId);
            setCampaign(updated);
        } catch (error) {
            console.error("Failed to resend campaign:", error);
            toast.error("Failed to resend campaign. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/marketing/campaigns">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h3 className="text-lg font-medium">Campaign not found</h3>
                    </div>
                </div>
            </div>
        );
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "sending":
            case "scheduled":
                return "bg-blue-100 text-blue-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/marketing/campaigns">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h3 className="text-lg font-medium">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            Campaign Details
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {campaign.status === "draft" && (
                        <>
                            <Button variant="outline" onClick={handleEdit}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
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
                            <Button onClick={handleSend} disabled={isSending}>
                                {isSending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="mr-2 h-4 w-4" />
                                )}
                                Send Campaign
                            </Button>
                        </>
                    )}
                    {campaign.status === "completed" && (
                        <Button onClick={handleResend} disabled={isResending}>
                            {isResending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RotateCw className="mr-2 h-4 w-4" />
                            )}
                            Resend Campaign
                        </Button>
                    )}
                </div>
            </div>

            {/* Edit Campaign Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Campaign</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Campaign Name</Label>
                            <Input
                                id="edit-name"
                                value={editFormData.name || ""}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-subject">Subject</Label>
                            <Input
                                id="edit-subject"
                                value={editFormData.subject || ""}
                                onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-content">Content</Label>
                            <Textarea
                                id="edit-content"
                                className="min-h-[200px] font-mono"
                                value={editFormData.content || ""}
                                onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-scheduled">Scheduled At (optional)</Label>
                            <Input
                                id="edit-scheduled"
                                type="datetime-local"
                                value={editFormData.scheduled_at || ""}
                                onChange={(e) => setEditFormData({ ...editFormData, scheduled_at: e.target.value })}
                            />
                        </div>
                        {campaign?.status === "draft" && (
                            <div className="space-y-2">
                                <Label htmlFor="edit-segment">Audience Segment</Label>
                                <select
                                    id="edit-segment"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={editFormData.segment_id || ""}
                                    onChange={(e) => setEditFormData({ ...editFormData, segment_id: e.target.value })}
                                >
                                    <option value="">Select a segment</option>
                                    {segments.map((segment) => (
                                        <option key={segment._id} value={segment._id}>
                                            {segment.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
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
                        <CardTitle>Campaign Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Name</label>
                            <p className="mt-1 text-sm">{campaign.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Subject</label>
                            <p className="mt-1 text-sm">{campaign.subject}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                            <div className="mt-1">
                                <Badge className={getStatusBadgeVariant(campaign.status)}>
                                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Type</label>
                            <div className="mt-1 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{campaign.type === 'email' ? 'Email' : 'SMS'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Scheduling & Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Segment ID</label>
                            <div className="mt-1 flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <code className="text-xs bg-muted px-2 py-1 rounded">{campaign.segment_id}</code>
                            </div>
                        </div>
                        {campaign.scheduled_at && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Scheduled For</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{format(new Date(campaign.scheduled_at), 'PPP p')}</span>
                                </div>
                            </div>
                        )}
                        {campaign.sent_at && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Sent At</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{format(new Date(campaign.sent_at), 'PPP p')}</span>
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Created At</label>
                            <p className="mt-1 text-sm">{format(new Date(campaign.created_at), 'PPP')}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                            <p className="mt-1 text-sm">{format(new Date(campaign.updated_at), 'PPP')}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Content Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border p-4 bg-muted/30">
                        <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: renderCampaignContent(campaign.content) }}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
