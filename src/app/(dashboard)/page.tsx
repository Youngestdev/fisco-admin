"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats, DashboardStats, getUsers } from "@/lib/api";
import { Loader2, Building2, Users, Package, Wallet, Store, UserPlus, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { pageVariants, containerVariants, itemVariants, cardVariants } from "@/lib/motion-variants";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const COLORS = {
    primary: "#2563eb",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    purple: "#8b5cf6",
    cyan: "#06b6d4",
};

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [signupTrends, setSignupTrends] = useState<{ date: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const [dashboardData, usersData] = await Promise.all([
                    getDashboardStats(),
                    getUsers(1, 50) // Fetch last 50 users for trends
                ]);
                setStats(dashboardData);

                // Process signup trends (Last 7 days)
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    return d.toISOString().split('T')[0];
                }).reverse();

                const trends = last7Days.map(date => {
                    const count = usersData.filter((user: any) =>
                        user.created_at.startsWith(date)
                    ).length;
                    return { date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count };
                });

                setSignupTrends(trends);
            } catch (err) {
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatCompactNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + "M";
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + "K";
        }
        return num.toString();
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !stats) {
        return <div className="text-destructive">{error || "No data available"}</div>;
    }

    // Prepare chart data
    const ordersByStatusData = [
        { name: "Created", value: stats.orders_by_status.created, fill: COLORS.primary },
        { name: "Processing", value: stats.orders_by_status.processing, fill: COLORS.warning },
        { name: "Delivered", value: stats.orders_by_status.delivered, fill: COLORS.success },
        { name: "Cancelled", value: stats.orders_by_status.cancelled, fill: COLORS.danger },
    ];

    const orderTrendsData = [
        { period: "Today", orders: stats.orders_today },
        { period: "This Week", orders: stats.orders_this_week },
        { period: "This Month", orders: stats.orders_this_month },
    ];

    const businessOverviewData = [
        { name: "With Storefronts", value: stats.businesses_with_storefronts, fill: COLORS.success },
        { name: "Without Storefronts", value: stats.total_businesses - stats.businesses_with_storefronts, fill: COLORS.warning },
    ];

    const userDistributionData = [
        { name: "Active", value: stats.active_users, fill: COLORS.success },
        { name: "Inactive", value: stats.inactive_users, fill: COLORS.warning },
    ];

    const inventoryStatusData = [
        { name: "In Stock", value: stats.total_inventory_items - stats.low_stock_items - stats.out_of_stock_items, fill: COLORS.success },
        { name: "Low Stock", value: stats.low_stock_items, fill: COLORS.warning },
        { name: "Out of Stock", value: stats.out_of_stock_items, fill: COLORS.danger },
    ];

    const financialData = [
        { name: "Deposits", amount: stats.total_deposits / 100, fill: COLORS.success },
        { name: "Withdrawals", amount: stats.total_withdrawals / 100, fill: COLORS.danger },
        { name: "Balance", amount: stats.total_wallet_balance / 100, fill: COLORS.primary },
    ];

    return (
        <motion.div
            className="space-y-6"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <motion.h2
                className="text-3xl font-bold tracking-tight"
                variants={itemVariants}
            >
                Dashboard
            </motion.h2>

            {/* Key Metrics Cards */}
            <motion.div
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                variants={containerVariants}
            >
                <MotionCard variants={cardVariants}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_businesses}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.active_businesses} active
                        </p>
                    </CardContent>
                </MotionCard>

                <MotionCard variants={cardVariants}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_users}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.active_users} active, {stats.inactive_users} inactive
                        </p>
                    </CardContent>
                </MotionCard>

                <MotionCard variants={cardVariants}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCompactNumber(stats.total_orders)}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.orders_today} today, {stats.orders_this_week} this week
                        </p>
                    </CardContent>
                </MotionCard>

                <MotionCard variants={cardVariants}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Wallet Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.total_wallet_balance)}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all businesses
                        </p>
                    </CardContent>
                </MotionCard>
            </motion.div>

            {/* Charts Section */}
            <motion.div
                className="grid gap-4 md:grid-cols-2"
                variants={containerVariants}
            >
                {/* Business Overview */}
                <MotionCard variants={itemVariants}>
                    <CardHeader>
                        <CardTitle>Business Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={businessOverviewData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {businessOverviewData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </MotionCard>


                {/* Signup Trends */}
                <MotionCard variants={itemVariants}>
                    <CardHeader>
                        <CardTitle>Signup Trends (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={signupTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke={COLORS.success} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </MotionCard>

                {/* Orders by Status */}
                <MotionCard variants={itemVariants}>
                    <CardHeader>
                        <CardTitle>Orders by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={ordersByStatusData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill={COLORS.primary} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </MotionCard>

                {/* Order Trends */}
                <MotionCard variants={itemVariants}>
                    <CardHeader>
                        <CardTitle>Order Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={orderTrendsData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="orders" stroke={COLORS.primary} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </MotionCard>

                {/* User Distribution */}
                <MotionCard variants={itemVariants}>
                    <CardHeader>
                        <CardTitle>User Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={userDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {userDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>

                </MotionCard>


                {/* Inventory Status */}
                <MotionCard variants={itemVariants}>
                    <CardHeader>
                        <CardTitle>Inventory Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={inventoryStatusData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill={COLORS.primary} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </MotionCard>
            </motion.div>

            {/* Financial Overview */}
            <MotionCard variants={itemVariants}>
                <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={financialData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `₦${formatCompactNumber(value * 100)}`} />
                            <Tooltip formatter={(value) => formatCurrency(Number(value) * 100)} />
                            <Bar dataKey="amount" fill={COLORS.primary} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </MotionCard>

            {/* Additional Metrics */}
            <motion.div
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                variants={containerVariants}
            >
                <MotionCard variants={cardVariants}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Storefronts</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_storefronts}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.active_storefronts} active, {stats.storefronts_with_custom_domains} with custom domains
                        </p>
                    </CardContent>
                </MotionCard>

                <MotionCard variants={cardVariants}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCompactNumber(stats.total_customers)}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all businesses
                        </p>
                    </CardContent>
                </MotionCard>

                <MotionCard variants={cardVariants}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.recent_signups}</div>
                        <p className="text-xs text-muted-foreground">
                            New user registrations
                        </p>
                    </CardContent>
                </MotionCard>

                <MotionCard variants={cardVariants}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.pending_withdrawals)}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting processing
                        </p>
                    </CardContent>
                </MotionCard>
            </motion.div>
        </motion.div >
    );
}

const MotionCard = motion(Card);
