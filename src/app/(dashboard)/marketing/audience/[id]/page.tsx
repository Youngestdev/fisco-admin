"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSegment, getSegmentAudience, updateSegment, deleteSegment, getUsers, Segment, SegmentAudience, UpdateSegmentRequest, UserSearchResult } from "@/lib/api";
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
    const [isUpdating, setIsUpdating] = useState(false);
    const [allUsers, setAllUsers] = useState<UserSearchResult[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [editFormData, setEditFormData] = useState<Partial<UpdateSegmentRequest>>({});
    const [editCriteria, setEditCriteria] = useState<Record<string, any>>({});

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

    // Fetch all users for user picker
    useEffect(() => {
        async function loadUsers() {
            setIsLoadingUsers(true);
            try {
                // Fetch a large number of users for selection
                const users = await getUsers(1, 1000);
                setAllUsers(users);
            } catch (error) {
                console.error("Failed to load users:", error);
            } finally {
                setIsLoadingUsers(false);
            }
        }
        loadUsers();
    }, []);

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
        setEditCriteria(segment.criteria || {});
        setUserSearchQuery(""); // Reset search when opening dialog
        setIsEditing(true);
    };

    const updateEditCriteria = (field: string, value: any) => {
        setEditCriteria(prev => {
            const newCriteria = { ...prev };
            if (value === null || value === undefined || value === "" || value === "__any__") {
                delete newCriteria[field];
            } else {
                newCriteria[field] = value;
            }
            return newCriteria;
        });
    };

    const updateEditDateBetween = (field: 'start' | 'end', value: string) => {
        setEditCriteria(prev => {
            const current = prev.created_between || {};
            if (!value) {
                const { [field]: removed, ...rest } = current;
                return { ...prev, created_between: Object.keys(rest).length > 0 ? rest : undefined };
            }
            return { ...prev, created_between: { ...current, [field]: value } };
        });
    };

    const toggleUserSelection = (userId: string) => {
        const currentIds = editFormData.manual_user_ids || [];
        if (currentIds.includes(userId)) {
            setEditFormData({
                ...editFormData,
                manual_user_ids: currentIds.filter(id => id !== userId)
            });
        } else {
            setEditFormData({
                ...editFormData,
                manual_user_ids: [...currentIds, userId]
            });
        }
    };

    const handleUpdate = async () => {
        if (!segment) return;

        setIsUpdating(true);
        try {
            const updateData: UpdateSegmentRequest = {
                name: editFormData.name,
                description: editFormData.description,
            };

            // Add type-specific fields
            if (segment.type === "manual") {
                updateData.manual_user_ids = editFormData.manual_user_ids;
            } else if (segment.type === "dynamic") {
                updateData.criteria = editCriteria;
            }

            await updateSegment(segment._id, updateData);
            toast.success("Segment updated successfully");
            setIsEditing(false);
            // Reload segment data
            const updatedSegment = await getSegment(segmentId);
            setSegment(updatedSegment);
        } catch (error) {
            console.error("Failed to update segment:", error);
            toast.error("Failed to update segment");
        } finally {
            setIsUpdating(false);
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
                    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
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

                        {segment?.type === "dynamic" && (
                            <div className="space-y-4 border rounded-md p-4">
                                <Label className="text-base font-semibold">Criteria Builder</Label>
                                <p className="text-xs text-muted-foreground">Configure filtering criteria for this dynamic segment</p>

                                {/* Boolean Criteria */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">User Status</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Select value={editCriteria.is_active?.toString() || "__any__"} onValueChange={(v) => updateEditCriteria('is_active', v === "" ? null : v === "true")}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Is Active" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__any__">Any</SelectItem>
                                                <SelectItem value="true">Active</SelectItem>
                                                <SelectItem value="false">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={editCriteria.nin_verified?.toString() || "__any__"} onValueChange={(v) => updateEditCriteria('nin_verified', v === "" ? null : v === "true")}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="NIN Verified" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__any__">Any</SelectItem>
                                                <SelectItem value="true">Verified</SelectItem>
                                                <SelectItem value="false">Not Verified</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={editCriteria.bvn_verified?.toString() || "__any__"} onValueChange={(v) => updateEditCriteria('bvn_verified', v === "" ? null : v === "true")}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="BVN Verified" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__any__">Any</SelectItem>
                                                <SelectItem value="true">Verified</SelectItem>
                                                <SelectItem value="false">Not Verified</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={editCriteria.business_info_verified?.toString() || "__any__"} onValueChange={(v) => updateEditCriteria('business_info_verified', v === "" ? null : v === "true")}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Business Info" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__any__">Any</SelectItem>
                                                <SelectItem value="true">Verified</SelectItem>
                                                <SelectItem value="false">Not Verified</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* User Features */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">User Features</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Select value={editCriteria.has_business?.toString() || "__any__"} onValueChange={(v) => updateEditCriteria('has_business', v === "" ? null : v === "true")}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Has Business" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__any__">Any</SelectItem>
                                                <SelectItem value="true">Yes</SelectItem>
                                                <SelectItem value="false">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={editCriteria.has_storefront?.toString() || "__any__"} onValueChange={(v) => updateEditCriteria('has_storefront', v === "" ? null : v === "true")}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Has Storefront" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__any__">Any</SelectItem>
                                                <SelectItem value="true">Yes</SelectItem>
                                                <SelectItem value="false">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={editCriteria.deletion_requested?.toString() || "__any__"} onValueChange={(v) => updateEditCriteria('deletion_requested', v === "" ? null : v === "true")}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Deletion Requested" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__any__">Any</SelectItem>
                                                <SelectItem value="true">Yes</SelectItem>
                                                <SelectItem value="false">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Tier Selection */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Tier & KYC</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Select value={editCriteria.tier || "__any__"} onValueChange={(v) => updateEditCriteria('tier', v || null)}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="User Tier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__any__">Any</SelectItem>
                                                <SelectItem value="EARLY_USER">Early User</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={editCriteria.kyc_tier || "__any__"} onValueChange={(v) => updateEditCriteria('kyc_tier', v || null)}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="KYC Tier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__any__">Any</SelectItem>
                                                <SelectItem value="TIER_0">Tier 0</SelectItem>
                                                <SelectItem value="TIER_1">Tier 1</SelectItem>
                                                <SelectItem value="TIER_2">Tier 2</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Date Criteria */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Account Creation Date</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor="edit_created_after" className="text-xs text-muted-foreground">Created After</Label>
                                            <Input
                                                id="edit_created_after"
                                                type="datetime-local"
                                                value={editCriteria.created_after || "__any__"}
                                                onChange={(e) => updateEditCriteria('created_after', e.target.value || null)}
                                                className="h-9"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="edit_created_before" className="text-xs text-muted-foreground">Created Before</Label>
                                            <Input
                                                id="edit_created_before"
                                                type="datetime-local"
                                                value={editCriteria.created_before || "__any__"}
                                                onChange={(e) => updateEditCriteria('created_before', e.target.value || null)}
                                                className="h-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <Label className="text-xs text-muted-foreground mb-2 block">Or specify a date range:</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label htmlFor="edit_range_start" className="text-xs text-muted-foreground">Range Start</Label>
                                                <Input
                                                    id="edit_range_start"
                                                    type="datetime-local"
                                                    value={editCriteria.created_between?.start || ""}
                                                    onChange={(e) => updateEditDateBetween('start', e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="edit_range_end" className="text-xs text-muted-foreground">Range End</Label>
                                                <Input
                                                    id="edit_range_end"
                                                    type="datetime-local"
                                                    value={editCriteria.created_between?.end || ""}
                                                    onChange={(e) => updateEditDateBetween('end', e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                                    <strong>Note:</strong> All criteria are optional. Only selected criteria will be applied to filter users.
                                </div>
                            </div>
                        )}

                        {segment?.type === "manual" && (
                            <div className="space-y-3">
                                <Label>Select Users</Label>
                                {isLoadingUsers ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground mb-2">
                                            {(editFormData.manual_user_ids || []).length} user(s) selected
                                        </div>
                                        <Input
                                            placeholder="Search users by name or email..."
                                            value={userSearchQuery}
                                            onChange={(e) => setUserSearchQuery(e.target.value)}
                                            className="mb-2"
                                        />
                                        <div className="max-h-[300px] overflow-y-auto border rounded-md p-3 space-y-2">
                                            {(() => {
                                                // Filter users based on search query
                                                const filteredUsers = allUsers.filter((user) => {
                                                    const query = userSearchQuery.toLowerCase();
                                                    return (
                                                        user.name.toLowerCase().includes(query) ||
                                                        user.email.toLowerCase().includes(query)
                                                    );
                                                });

                                                // Sort: selected users first, then alphabetically by name
                                                const sortedUsers = filteredUsers.sort((a, b) => {
                                                    const aSelected = (editFormData.manual_user_ids || []).includes(a.id);
                                                    const bSelected = (editFormData.manual_user_ids || []).includes(b.id);

                                                    if (aSelected && !bSelected) return -1;
                                                    if (!aSelected && bSelected) return 1;
                                                    return a.name.localeCompare(b.name);
                                                });

                                                if (sortedUsers.length === 0) {
                                                    return (
                                                        <div className="text-center py-8 text-sm text-muted-foreground">
                                                            {userSearchQuery ? "No users found matching your search" : "No users available"}
                                                        </div>
                                                    );
                                                }

                                                return sortedUsers.map((user) => {
                                                    const isSelected = (editFormData.manual_user_ids || []).includes(user.id);
                                                    return (
                                                        <div
                                                            key={user.id}
                                                            className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                                                            onClick={() => toggleUserSelection(user.id)}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleUserSelection(user.id)}
                                                                className="h-4 w-4 rounded border-gray-300"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium truncate">
                                                                    {user.name}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground truncate">
                                                                    {user.email}
                                                                </div>
                                                            </div>
                                                            {isSelected && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Selected
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                )}
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
