"use client";

import { useEffect, useState } from "react";
import { getUser, activateUser, deactivateUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { pageVariants, containerVariants, cardVariants } from "@/lib/motion-variants";

// Define animated components outside of the functional component to avoid re-creation on each render
const MotionCard = motion(Card);

export default function UserDetailsPage() {
    const params = useParams();
    const userId = params.id as string;
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState(false);
    const [deactivating, setDeactivating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (userId) {
            fetchUser();
        }
    }, [userId]);

    const fetchUser = async () => {
        try {
            const data = await getUser(userId);
            setUser(data);
        } catch (err) {
            console.error("Failed to load user", err);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async () => {
        if (!user) return;
        setActivating(true);
        try {
            await activateUser(user.id);
            fetchUser();
        } catch (err) {
            console.error("Failed to activate user", err);
        } finally {
            setActivating(false);
        }
    };

    const handleDeactivate = async () => {
        if (!user) return;
        setDeactivating(true);
        try {
            await deactivateUser(user.id);
            fetchUser();
        } catch (err) {
            console.error("Failed to deactivate user", err);
        } finally {
            setDeactivating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <motion.div
            className="space-y-6"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">{user.name}</h2>
            </div>

            {/* Profile Information */}
            <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2">
                <MotionCard variants={cardVariants}>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p>{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                <Badge variant={user.is_active ? "default" : "secondary"}>
                                    {user.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tier</p>
                                <p className="capitalize">{user.tier.replace("_", " ")}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Joined</p>
                                <p>{new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        {!user.is_active && (
                            <div className="pt-4">
                                <Button onClick={handleActivate} disabled={activating}>
                                    {activating ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                    )}
                                    Activate User
                                </Button>
                            </div>
                        )}
                        {user.is_active && (
                            <div className="pt-4">
                                <Button
                                    onClick={handleDeactivate}
                                    disabled={deactivating}
                                    variant="destructive"
                                >
                                    {deactivating ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <XCircle className="mr-2 h-4 w-4" />
                                    )}
                                    Deactivate User
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </MotionCard>

                <MotionCard variants={cardVariants}>
                    <CardHeader>
                        <CardTitle>KYC & Verification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">KYC Level</p>
                                <p className="capitalize">{user.kyc_level.replace("_", " ")}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">NIN Verified</p>
                                <Badge variant={user.nin_verified ? "outline" : "secondary"}>
                                    {user.nin_verified ? "Yes" : "No"}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">BVN Verified</p>
                                <Badge variant={user.bvn_verified ? "outline" : "secondary"}>
                                    {user.bvn_verified ? "Yes" : "No"}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Business Info</p>
                                <Badge variant={user.business_info_verified ? "outline" : "secondary"}>
                                    {user.business_info_verified ? "Verified" : "Pending"}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </MotionCard>
            </motion.div>
        </motion.div>
    );
}

interface User {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
    has_business: boolean;
    created_at: string;
    tier: string;
    nin_verified: boolean;
    bvn_verified: boolean;
    business_info_verified: boolean;
    kyc_level: string;
    business_id: string | null;
}
