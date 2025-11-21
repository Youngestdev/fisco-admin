"use client";

import { useEffect, useState } from "react";
import { getBusiness } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, ExternalLink, Package, ShoppingCart, Users, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { pageVariants, containerVariants, cardVariants, tableRowVariants } from "@/lib/motion-variants";

// Animated component definitions (outside functional component to avoid re-creation)
const MotionCard = motion(Card);
const MotionTableRow = motion(TableRow);

export default function BusinessDetailsPage() {
    const params = useParams();
    const businessId = params.id as string;
    const [business, setBusiness] = useState<BusinessDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (businessId) {
            fetchBusiness();
        }
    }, [businessId]);

    const fetchBusiness = async () => {
        try {
            const data = await getBusiness(businessId);
            setBusiness(data);
        } catch (err) {
            console.error("Failed to load business", err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!business) {
        return <div>Business not found</div>;
    }

    return (
        <motion.div
            className="space-y-6"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">{business.name}</h2>
            </div>

            {/* Statistics Cards */}
            <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-4">
                <MotionCard variants={cardVariants} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => router.push(`/businesses/${businessId}/customers`)}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{business.customers_count}</div>
                    </CardContent>
                </MotionCard>
                <MotionCard variants={cardVariants} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => router.push(`/businesses/${businessId}/orders`)}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{business.orders_count}</div>
                    </CardContent>
                </MotionCard>
                <MotionCard variants={cardVariants} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => router.push(`/businesses/${businessId}/inventory`)}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inventory</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{business.inventory_count}</div>
                    </CardContent>
                </MotionCard>
                <MotionCard variants={cardVariants} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => router.push(`/businesses/${businessId}/wallet-history`)}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {business.wallet ? formatCurrency(business.wallet.balance) : "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Click to view history</p>
                    </CardContent>
                </MotionCard>
            </motion.div>

            {/* Detail Sections */}
            <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2">
                {/* Profile Information */}
                <MotionCard variants={cardVariants}>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p>{business.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                <p>{business.phone_no}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm font-medium text-muted-foreground">Address</p>
                                <p>{business.address}</p>
                            </div>
                            {business.website && (
                                <div className="col-span-2">
                                    <p className="text-sm font-medium text-muted-foreground">Website</p>
                                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                        {business.website}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Created</p>
                                <p>{formatDate(business.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Currencies</p>
                                <p>{business.supported_currencies.join(", ")}</p>
                            </div>
                        </div>
                    </CardContent>
                </MotionCard>

                {/* Storefront Info */}
                {business.storefront && (
                    <MotionCard variants={cardVariants}>
                        <CardHeader>
                            <CardTitle>Storefront</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                                    <p className="font-medium">{business.storefront.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                                    <p className="text-sm">{business.storefront.description}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Subdomain</p>
                                    <p>{business.storefront.subdomain}</p>
                                </div>
                                {business.storefront.custom_domain && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Custom Domain</p>
                                        <p>{business.storefront.custom_domain}</p>
                                    </div>
                                )}
                                <Button variant="outline" size="sm" onClick={() => router.push(`/storefronts/${business.storefront?.id}`)}>
                                    View Storefront Details
                                </Button>
                            </div>
                        </CardContent>
                    </MotionCard>
                )}
            </motion.div>

            {/* Recent Orders */}
            <MotionCard variants={cardVariants}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Orders ({business.orders_count})</CardTitle>
                    {business.orders_count > 0 && (
                        <Button variant="outline" size="sm" onClick={() => router.push(`/businesses/${businessId}/orders`)}>
                            View All
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {business.orders.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {business.orders.map((order) => (
                                        <MotionTableRow key={order.id} variants={tableRowVariants} layout>
                                            <TableCell className="font-medium">{order.reference}</TableCell>
                                            <TableCell>{order.owner.name}</TableCell>
                                            <TableCell>{order.items.length}</TableCell>
                                            <TableCell>{order.source}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{order.timeline[order.timeline.length - 1]?.status || "N/A"}</Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(order.created_at)}</TableCell>
                                        </MotionTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No orders yet</p>
                    )}
                </CardContent>
            </MotionCard>

            {/* Inventory */}
            <MotionCard variants={cardVariants}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Inventory ({business.inventory_count})</CardTitle>
                    {business.inventory_count > 0 && (
                        <Button variant="outline" size="sm" onClick={() => router.push(`/businesses/${businessId}/inventory`)}>
                            View All
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {business.inventory.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Stock</TableHead>
                                        <TableHead>Variations</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {business.inventory.map((item) => (
                                        <MotionTableRow key={item._id} variants={tableRowVariants} layout>
                                            <TableCell className="font-mono text-sm">{item.SKU}</TableCell>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                            <TableCell className="text-right">{item.quantity_in_stock}</TableCell>
                                            <TableCell>
                                                {item.has_variations ? (
                                                    <Badge variant="secondary">Yes</Badge>
                                                ) : (
                                                    <Badge variant="outline">No</Badge>
                                                )}
                                            </TableCell>
                                        </MotionTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No inventory items</p>
                    )}
                </CardContent>
            </MotionCard>

            {/* Wallet Transactions */}
            {business.wallet && (
                <MotionCard variants={cardVariants}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Wallet Transactions</CardTitle>
                        {business.wallet.transactions.length > 0 && (
                            <Button variant="outline" size="sm" onClick={() => router.push(`/businesses/${businessId}/wallet-history`)}>
                                View All
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {business.wallet.transactions.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {business.wallet.transactions.map((txn) => (
                                            <MotionTableRow key={txn._id} variants={tableRowVariants} layout>
                                                <TableCell>
                                                    <Badge variant={txn.type === "deposit" ? "default" : "secondary"}>{txn.type}</Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">{formatCurrency(txn.amount)}</TableCell>
                                                <TableCell className="font-mono text-sm">{txn.reference || "N/A"}</TableCell>
                                                <TableCell>
                                                    {txn.status && (
                                                        <Badge variant="outline" className="capitalize">{txn.status}</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{formatDate(txn.created_at)}</TableCell>
                                            </MotionTableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No transactions</p>
                        )}
                    </CardContent>
                </MotionCard>
            )}

            {/* Customers */}
            <MotionCard variants={cardVariants}>
                <CardHeader>
                    <CardTitle>Customers ({business.customers_count})</CardTitle>
                    {business.customers_count > 0 && (
                        <Button variant="outline" size="sm" onClick={() => router.push(`/businesses/${businessId}/customers`)}>
                            View All
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {business.customers.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Address</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {business.customers.map((customer, idx) => (
                                        <MotionTableRow key={idx} variants={tableRowVariants} layout>
                                            <TableCell className="font-medium">{customer.name}</TableCell>
                                            <TableCell>{customer.email}</TableCell>
                                            <TableCell>{customer.phone_no}</TableCell>
                                            <TableCell>{customer.address}</TableCell>
                                        </MotionTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No customers yet</p>
                    )}
                </CardContent>
            </MotionCard>
        </motion.div>
    );
}

interface BusinessDetail {
    _id: string;
    name: string;
    email: string;
    phone_no: string;
    address: string;
    website?: string;
    created_at: string;
    supported_currencies: string[];
    customers_count: number;
    orders_count: number;
    inventory_count: number;
    customers: Array<{ name: string; email: string; phone_no: string; address: string }>;
    orders: Array<{
        id: string;
        reference: string;
        owner: { name: string };
        items: any[];
        source: string;
        timeline: Array<{ status: string }>;
        created_at: string;
    }>;
    inventory: Array<{
        _id: string;
        SKU: string;
        name: string;
        price: number;
        quantity_in_stock: number;
        has_variations: boolean;
    }>;
    wallet?: {
        balance: number;
        transactions: Array<{
            _id: string;
            type: string;
            amount: number;
            reference?: string;
            status?: string;
            created_at: string;
        }>;
    };
    storefront?: {
        id: string;
        name: string;
        description: string;
        subdomain: string;
        custom_domain?: string;
    };
}
