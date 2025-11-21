"use client";

import { useEffect, useState } from "react";
import { getOrders } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";

interface OrderStats {
    total_orders: number;
    aggregates: {
        [key: string]: {
            status: string;
            count: number;
        };
    };
}

export default function OrdersPage() {
    const [stats, setStats] = useState<OrderStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await getOrders();
            setStats(data);
        } catch (err) {
            setError("Failed to load order statistics");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return <div className="text-destructive">{error}</div>;
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "delivered":
                return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
            case "cancelled":
                return <XCircle className="h-4 w-4 text-muted-foreground" />;
            case "in transit":
                return <Truck className="h-4 w-4 text-muted-foreground" />;
            case "processing":
                return <Clock className="h-4 w-4 text-muted-foreground" />;
            default:
                return <Package className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Order Analytics</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_orders || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            All time orders
                        </p>
                    </CardContent>
                </Card>
            </div>

            <h3 className="text-lg font-medium">Status Breakdown</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats?.aggregates &&
                    Object.values(stats.aggregates).map((item) => (
                        <Card key={item.status}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium capitalize">
                                    {item.status}
                                </CardTitle>
                                {getStatusIcon(item.status)}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{item.count}</div>
                                <p className="text-xs text-muted-foreground capitalize">
                                    Orders {item.status}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
            </div>
        </div>
    );
}
