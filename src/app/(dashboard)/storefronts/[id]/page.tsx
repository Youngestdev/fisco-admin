"use client";

import { useEffect, useState } from "react";
import { getStorefront, type StorefrontDetail } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, ExternalLink, Package, ShoppingCart, Building2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { pageVariants, containerVariants, itemVariants, cardVariants } from "@/lib/motion-variants";

const MotionCard = motion(Card);

export default function StorefrontDetailsPage() {
    const params = useParams();
    const storefrontId = params.id as string;
    const [storefront, setStorefront] = useState<StorefrontDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (storefrontId) {
            fetchStorefront();
        }
    }, [storefrontId]);

    const fetchStorefront = async () => {
        try {
            const data = await getStorefront(storefrontId);
            setStorefront(data);
        } catch (err) {
            console.error("Failed to load storefront", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!storefront) {
        return <div>Storefront not found</div>;
    }

    return (
        <motion.div
            className="space-y-6"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <motion.div
                className="flex items-center gap-4"
                variants={itemVariants}
            >
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">{storefront.name}</h2>
                <Badge variant={storefront.status === "active" ? "default" : "secondary"}>
                    {storefront.status}
                </Badge>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div
                className="grid gap-4 md:grid-cols-3"
                variants={containerVariants}
            >
                <MotionCard variants={cardVariants}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{storefront.items_count}</div>
                    </CardContent>
                </MotionCard>
                <MotionCard variants={cardVariants}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{storefront.orders_count}</div>
                    </CardContent>
                </MotionCard>
                <MotionCard variants={cardVariants}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Currencies</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{storefront.supported_currencies.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {storefront.supported_currencies.join(", ")}
                        </p>
                    </CardContent>
                </MotionCard>
            </motion.div>

            <motion.div
                className="grid gap-6 md:grid-cols-2"
                variants={containerVariants}
            >
                {/* Storefront Information */}
                <MotionCard variants={itemVariants}>
                    <CardHeader>
                        <CardTitle>Storefront Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Description</p>
                                <p className="text-sm">{storefront.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Subdomain</p>
                                    <p className="font-mono text-sm">{storefront.subdomain}</p>
                                </div>
                                {storefront.custom_domain && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Custom Domain</p>
                                        <p className="font-mono text-sm">{storefront.custom_domain}</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Created</p>
                                <p>{formatDate(storefront.created_at)}</p>
                            </div>
                        </div>
                    </CardContent>
                </MotionCard>

                {/* Theme Configuration */}
                <MotionCard variants={itemVariants}>
                    <CardHeader>
                        <CardTitle>Theme Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4">
                            {storefront.theme.primary_color && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Primary Color</p>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-6 w-6 rounded border"
                                            style={{ backgroundColor: storefront.theme.primary_color }}
                                        />
                                        <p className="font-mono text-sm">{storefront.theme.primary_color}</p>
                                    </div>
                                </div>
                            )}
                            {storefront.theme.secondary_color && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Secondary Color</p>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-6 w-6 rounded border"
                                            style={{ backgroundColor: storefront.theme.secondary_color }}
                                        />
                                        <p className="font-mono text-sm">{storefront.theme.secondary_color}</p>
                                    </div>
                                </div>
                            )}
                            {storefront.theme.font_family && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Font Family</p>
                                    <p>{storefront.theme.font_family}</p>
                                </div>
                            )}
                            {storefront.theme.logo_url && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Logo</p>
                                    <a
                                        href={storefront.theme.logo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-blue-600 hover:underline"
                                    >
                                        View Logo
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </MotionCard>
            </motion.div>

            {/* Business Information */}
            <MotionCard variants={itemVariants}>
                <CardHeader>
                    <CardTitle>Associated Business</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Business Name</p>
                            <p className="font-medium">{storefront.business.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p>{storefront.business.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Phone</p>
                            <p>{storefront.business.phone_no}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Customers</p>
                            <p>{storefront.business.customers}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm font-medium text-muted-foreground">Address</p>
                            <p>{storefront.business.address}</p>
                        </div>
                        {storefront.business.website && (
                            <div className="col-span-2">
                                <p className="text-sm font-medium text-muted-foreground">Website</p>
                                <a
                                    href={storefront.business.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-blue-600 hover:underline"
                                >
                                    {storefront.business.website}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        )}
                        <div className="col-span-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/businesses/${storefront.business.id}`)}
                            >
                                View Business Details
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </MotionCard>
        </motion.div>
    );
}
