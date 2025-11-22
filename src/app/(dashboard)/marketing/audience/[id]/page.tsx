"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSegment, getSegmentAudience, updateSegment, deleteSegment, Segment, SegmentAudience, UpdateSegmentRequest } from "@/lib/api";
import { Loader2, ArrowLeft, Users, Mail, Calendar, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

export default function SegmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const segmentId = params.id as string;

    const [segment, setSegment] = useState<Segment | null>(null);
    const [audience, setAudience] = useState<SegmentAudience | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingAudience, setIsLoadingAudience] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<UpdateSegmentRequest>>({});

    useEffect(() => {
        async function loadSegment() {
            try {
                const data = await getSegment(segmentId);
                setSegment(data);

                // Load audience
                setIsLoadingAudience(true);
                const audienceData = await getSegmentAudience(segmentId);
                setAudience(audienceData);
            } catch (error) {
                console.error("Failed to load segment:", error);
            } finally {
                setIsLoading(false);
                setIsLoadingAudience(false);
            }
        }
        loadSegment();
    }, [segmentId]);

    const handleDelete = async () => {
        if (!segment) return;
        if (!confirm(`Are you sure you want to delete "${segment.name}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteSegment(segment._id);
            toast.success("Segment deleted successfully!");
            router.push("/marketing/audience");
        } catch (error) {
            console.error("Failed to delete segment:", error);
            toast.error("Failed to delete segment. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = () => {
        if (!segment) return;
        setEditFormData({
            name: segment.name,
            description: segment.description,
            manual_user_ids: segment.manual_user_ids || [],
        });
        setIsEditing(true);
    };

    const handleUpdate = async () => {
        if (!segment) return;

        try {
            const updated = await updateSegment(segment._id, editFormData);
            setSegment(updated);
            setIsEditing(false);
            toast.success("Segment updated successfully!");
        } catch (error) {
            console.error("Failed to update segment:", error);
            toast.error("Failed to update segment. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!segment) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/marketing/audience">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h3 className="text-lg font-medium">Segment not found</h3>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/marketing/audience">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h3 className="text-lg font-medium">{segment.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            Segment Details & Audience
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
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
                </div>
            </div>

            {/* Edit Segment Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Segment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Segment Name</Label>
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
                        {segment?.type === "manual" && (
                            <div className="space-y-2">
                                <Label>Manual User IDs</Label>
                                <div className="space-y-2">
                                    {(editFormData.manual_user_ids || []).map((userId, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                readOnly
                                                value={userId}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    const newIds = [...(editFormData.manual_user_ids || [])];
                                                    newIds.splice(index, 1);
                                                    setEditFormData({ ...editFormData, manual_user_ids: newIds });
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Enter user ID to add"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const value = e.currentTarget.value.trim();
                                                    if (value && !(editFormData.manual_user_ids || []).includes(value)) {
                                                        setEditFormData({
                                                            ...editFormData,
                                                            manual_user_ids: [...(editFormData.manual_user_ids || []), value]
                                                        });
                                                        e.currentTarget.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Press Enter to add a user ID
                                    </p>
                                </div>
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
                        <CardTitle>Segment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Name</label>
                            <p className="mt-1 text-sm">{segment.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Description</label>
                            <p className="mt-1 text-sm">{segment.description || "No description"}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Type</label>
                            <div className="mt-1">
                                <Badge className="capitalize">
                                    {segment.type}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Created At</label>
                            <p className="mt-1 text-sm">{format(new Date(segment.created_at), 'PPP')}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                            <p className="mt-1 text-sm">{format(new Date(segment.updated_at), 'PPP')}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Segment Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {segment.type === "manual" && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Manual User IDs</label>
                                <p className="mt-1 text-sm">{segment.manual_user_ids.length} users</p>
                            </div>
                        )}
                        {segment.type === "dynamic" && segment.criteria && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Criteria</label>
                                <pre className="mt-1 text-xs bg-muted p-3 rounded-md overflow-auto">
                                    {JSON.stringify(segment.criteria, null, 2)}
                                </pre>
                            </div>
                        )}
                        {audience && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Total Users in Segment</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-lg font-bold">{audience.total_users}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Audience Members</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingAudience ? (
                        <div className="flex h-48 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : !audience || audience.users.length === 0 ? (
                        <div className="flex h-48 flex-col items-center justify-center text-center">
                            <Users className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground">
                                No users in this segment yet
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {audience.users.map((user) => (
                                            <tr key={user._id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle font-medium">{user.name}</td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        {user.email}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <Badge className={user.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                                        {user.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        {format(new Date(user.created_at), 'PPP')}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
