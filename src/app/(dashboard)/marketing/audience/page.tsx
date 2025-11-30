"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSegments, createSegment, Segment, getUsers, searchUsers } from "@/lib/api";
import { Plus, Users, Loader2, Search, X } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function AudiencePage() {
    const [segments, setSegments] = useState<Segment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newSegment, setNewSegment] = useState({
        name: "",
        description: "",
        type: "manual" as "manual" | "dynamic",
    });
    const [users, setUsers] = useState<any[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [criteria, setCriteria] = useState<Record<string, any>>({});

    useEffect(() => {
        loadSegments();
    }, []);

    useEffect(() => {
        if (isDialogOpen && newSegment.type === "manual") {
            loadUsers();
        }
    }, [isDialogOpen, newSegment.type]);

    // Debounced search effect for users
    useEffect(() => {
        if (!userSearchQuery.trim()) {
            return;
        }

        const timeoutId = setTimeout(() => {
            handleUserSearch(userSearchQuery);
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [userSearchQuery]);

    async function loadSegments() {
        try {
            const data = await getSegments();
            setSegments(data.segments || []);
        } catch (error) {
            console.error("Failed to load segments:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function loadUsers() {
        setIsLoadingUsers(true);
        try {
            const data = await getUsers(1, 100);
            let usersArray: any[] = [];
            if (Array.isArray(data)) {
                usersArray = data;
            } else if (data && Array.isArray((data as any).users)) {
                usersArray = (data as any).users;
            } else if (data && Array.isArray((data as any).data)) {
                usersArray = (data as any).data;
            } else if (data && Array.isArray((data as any).results)) {
                usersArray = (data as any).results;
            }
            setUsers(usersArray);
        } catch (error) {
            console.error("Failed to load users:", error);
            setUsers([]);
        } finally {
            setIsLoadingUsers(false);
        }
    }

    async function handleUserSearch(query: string) {
        if (!query.trim()) {
            return;
        }
        setIsSearching(true);
        try {
            const data = await searchUsers(query);
            setUsers(data);
        } catch (error) {
            console.error("Failed to search users:", error);
        } finally {
            setIsSearching(false);
        }
    }

    const handleUserSearchInputChange = (value: string) => {
        setUserSearchQuery(value);
        if (!value.trim()) {
            loadUsers();
        }
    };

    const clearUserSearch = () => {
        setUserSearchQuery("");
        loadUsers();
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const segmentData: any = {
                name: newSegment.name,
                description: newSegment.description,
                type: newSegment.type,
            };

            // Add type-specific fields based on API documentation
            if (newSegment.type === "manual") {
                segmentData.manual_user_ids = selectedUserIds;
            } else {
                // For dynamic segments, use the criteria from state
                segmentData.criteria = criteria;
            }

            await createSegment(segmentData);
            setIsDialogOpen(false);
            setNewSegment({ name: "", description: "", type: "manual" });
            setSelectedUserIds([]);
            setUserSearchQuery("");
            setCriteria({});
            loadSegments();
        } catch (error) {
            console.error("Failed to create segment:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const updateCriteria = (field: string, value: any) => {
        setCriteria(prev => {
            const newCriteria = { ...prev };
            if (value === null || value === undefined || value === "" || value === "__any__") {
                delete newCriteria[field];
            } else {
                newCriteria[field] = value;
            }
            return newCriteria;
        });
    };

    const updateDateBetween = (field: 'start' | 'end', value: string) => {
        setCriteria(prev => {
            const current = prev.created_between || {};
            if (!value) {
                const { [field]: removed, ...rest } = current;
                return { ...prev, created_between: Object.keys(rest).length > 0 ? rest : undefined };
            }
            return { ...prev, created_between: { ...current, [field]: value } };
        });
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
                    <h3 className="text-lg font-medium">Audience Segments</h3>
                    <p className="text-sm text-muted-foreground">
                        Group your users into segments for targeted campaigns.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Segment
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Segment</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate}>
                            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Segment Name</Label>
                                    <Input
                                        id="name"
                                        value={newSegment.name}
                                        onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                                        placeholder="e.g. VIP Customers"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={newSegment.description}
                                        onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                                        placeholder="Describe this segment"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={newSegment.type}
                                        onValueChange={(value: "manual" | "dynamic") => setNewSegment({ ...newSegment, type: value })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manual">Manual Selection</SelectItem>
                                            <SelectItem value="dynamic">Dynamic Criteria</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {newSegment.type === "dynamic" && (
                                    <div className="space-y-4 border rounded-md p-4">
                                        <div>
                                            <Label className="text-base font-semibold">Criteria Builder</Label>
                                            <p className="text-xs text-muted-foreground mt-1">Configure filtering criteria for this dynamic segment. All fields are optional.</p>
                                        </div>

                                        {/* User Status Section */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-foreground">User Status</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="is_active" className="text-xs text-muted-foreground">Account Status</Label>
                                                    <Select value={criteria.is_active?.toString() || "__any__"} onValueChange={(v) => updateCriteria('is_active', v === "__any__" ? null : v === "true")}>
                                                        <SelectTrigger id="is_active" className="h-9">
                                                            <SelectValue placeholder="Any" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="__any__">Any</SelectItem>
                                                            <SelectItem value="true">Active</SelectItem>
                                                            <SelectItem value="false">Inactive</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="deletion_requested" className="text-xs text-muted-foreground">Deletion Requested</Label>
                                                    <Select value={criteria.deletion_requested?.toString() || "__any__"} onValueChange={(v) => updateCriteria('deletion_requested', v === "__any__" ? null : v === "true")}>
                                                        <SelectTrigger id="deletion_requested" className="h-9">
                                                            <SelectValue placeholder="Any" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="__any__">Any</SelectItem>
                                                            <SelectItem value="true">Yes</SelectItem>
                                                            <SelectItem value="false">No</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Verification Status */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-foreground">Verification Status</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="nin_verified" className="text-xs text-muted-foreground">NIN Verified</Label>
                                                    <Select value={criteria.nin_verified?.toString() || "__any__"} onValueChange={(v) => updateCriteria('nin_verified', v === "__any__" ? null : v === "true")}>
                                                        <SelectTrigger id="nin_verified" className="h-9">
                                                            <SelectValue placeholder="Any" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="__any__">Any</SelectItem>
                                                            <SelectItem value="true">Verified</SelectItem>
                                                            <SelectItem value="false">Not Verified</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="bvn_verified" className="text-xs text-muted-foreground">BVN Verified</Label>
                                                    <Select value={criteria.bvn_verified?.toString() || "__any__"} onValueChange={(v) => updateCriteria('bvn_verified', v === "__any__" ? null : v === "true")}>
                                                        <SelectTrigger id="bvn_verified" className="h-9">
                                                            <SelectValue placeholder="Any" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="__any__">Any</SelectItem>
                                                            <SelectItem value="true">Verified</SelectItem>
                                                            <SelectItem value="false">Not Verified</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="business_info_verified" className="text-xs text-muted-foreground">Business Info Verified</Label>
                                                    <Select value={criteria.business_info_verified?.toString() || "__any__"} onValueChange={(v) => updateCriteria('business_info_verified', v === "__any__" ? null : v === "true")}>
                                                        <SelectTrigger id="business_info_verified" className="h-9">
                                                            <SelectValue placeholder="Any" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="__any__">Any</SelectItem>
                                                            <SelectItem value="true">Verified</SelectItem>
                                                            <SelectItem value="false">Not Verified</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* User Features */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-foreground">User Features</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="has_business" className="text-xs text-muted-foreground">Has Business</Label>
                                                    <Select value={criteria.has_business?.toString() || "__any__"} onValueChange={(v) => updateCriteria('has_business', v === "__any__" ? null : v === "true")}>
                                                        <SelectTrigger id="has_business" className="h-9">
                                                            <SelectValue placeholder="Any" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="__any__">Any</SelectItem>
                                                            <SelectItem value="true">Yes</SelectItem>
                                                            <SelectItem value="false">No</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="has_storefront" className="text-xs text-muted-foreground">Has Storefront</Label>
                                                    <Select value={criteria.has_storefront?.toString() || "__any__"} onValueChange={(v) => updateCriteria('has_storefront', v === "__any__" ? null : v === "true")}>
                                                        <SelectTrigger id="has_storefront" className="h-9">
                                                            <SelectValue placeholder="Any" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="__any__">Any</SelectItem>
                                                            <SelectItem value="true">Yes</SelectItem>
                                                            <SelectItem value="false">No</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tier & KYC */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-foreground">Tier & KYC Level</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="tier" className="text-xs text-muted-foreground">User Tier</Label>
                                                    <Select value={criteria.tier || "__any__"} onValueChange={(v) => updateCriteria('tier', v === "__any__" ? null : v)}>
                                                        <SelectTrigger id="tier" className="h-9">
                                                            <SelectValue placeholder="Any" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="__any__">Any</SelectItem>
                                                            <SelectItem value="EARLY_USER">Early User</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="kyc_tier" className="text-xs text-muted-foreground">KYC Tier</Label>
                                                    <Select value={criteria.kyc_tier || "__any__"} onValueChange={(v) => updateCriteria('kyc_tier', v === "__any__" ? null : v)}>
                                                        <SelectTrigger id="kyc_tier" className="h-9">
                                                            <SelectValue placeholder="Any" />
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
                                        </div>

                                        {/* Date Criteria */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-foreground">Account Creation Date</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="created_after" className="text-xs text-muted-foreground">Created After</Label>
                                                    <Input
                                                        id="created_after"
                                                        type="datetime-local"
                                                        value={criteria.created_after || ""}
                                                        onChange={(e) => updateCriteria('created_after', e.target.value || null)}
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="created_before" className="text-xs text-muted-foreground">Created Before</Label>
                                                    <Input
                                                        id="created_before"
                                                        type="datetime-local"
                                                        value={criteria.created_before || ""}
                                                        onChange={(e) => updateCriteria('created_before', e.target.value || null)}
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t">
                                                <Label className="text-xs text-muted-foreground mb-2 block">Or specify a date range (created_between):</Label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="range_start" className="text-xs text-muted-foreground">Range Start</Label>
                                                        <Input
                                                            id="range_start"
                                                            type="datetime-local"
                                                            value={criteria.created_between?.start || ""}
                                                            onChange={(e) => updateDateBetween('start', e.target.value)}
                                                            className="h-9"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="range_end" className="text-xs text-muted-foreground">Range End</Label>
                                                        <Input
                                                            id="range_end"
                                                            type="datetime-local"
                                                            value={criteria.created_between?.end || ""}
                                                            onChange={(e) => updateDateBetween('end', e.target.value)}
                                                            className="h-9"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {newSegment.type === "manual" && (
                                    <div className="space-y-2">
                                        <Label>Select Users</Label>
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search users by name or email..."
                                                value={userSearchQuery}
                                                onChange={(e) => handleUserSearchInputChange(e.target.value)}
                                                className="pl-8 pr-8"
                                            />
                                            {userSearchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={clearUserSearch}
                                                    className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="border rounded-md max-h-60 overflow-y-auto">
                                            {isLoadingUsers || isSearching ? (
                                                <div className="flex items-center justify-center p-8">
                                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                </div>
                                            ) : users.length === 0 ? (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    {userSearchQuery ? "No users found matching your search" : "No users found"}
                                                </div>
                                            ) : (
                                                <div className="p-2 space-y-1">
                                                    {users.map((user) => (
                                                        <label
                                                            key={user.id}
                                                            className="flex items-center space-x-3 p-2 rounded hover:bg-muted cursor-pointer"
                                                        >
                                                            <Checkbox
                                                                checked={selectedUserIds.includes(user.id)}
                                                                onChange={() => toggleUserSelection(user.id)}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">{user.name}</p>
                                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {selectedUserIds.length > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Segment
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {segments.map((segment) => (
                    <Link key={segment._id} href={`/marketing/audience/${segment._id}`}>
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <div className="p-6 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold leading-none tracking-tight">{segment.name}</h3>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">{segment.description || "No description"}</p>
                                <div className="pt-4 flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="capitalize bg-secondary px-2 py-1 rounded-md text-secondary-foreground">
                                        {segment.type}
                                    </span>
                                    <span>{format(new Date(segment.created_at), 'PPP')}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
                {segments.length === 0 && (
                    <div className="col-span-full flex h-48 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Users className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No segments created</h3>
                        <p className="mb-4 mt-2 text-sm text-muted-foreground">
                            Create your first audience segment to start targeting users.
                        </p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Segment
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
