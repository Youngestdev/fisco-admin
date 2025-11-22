"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, MousePointerClick, TrendingUp, Loader2, ArrowRight } from "lucide-react";
import { getMarketingStats, MarketingStats } from "@/lib/api";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MarketingPage() {
    const [stats, setStats] = useState<MarketingStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await getMarketingStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to load marketing stats:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!stats) {
        return <div>Failed to load stats</div>;
    }

    const openRate = stats.total_emails_sent > 0
        ? ((stats.total_emails_opened / stats.total_emails_sent) * 100).toFixed(1)
        : "0.0";

    const clickRate = stats.total_emails_sent > 0
        ? ((stats.total_emails_clicked / stats.total_emails_sent) * 100).toFixed(1)
        : "0.0";

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Total Campaigns", value: stats.total_campaigns, subtitle: "All time", icon: TrendingUp, delay: 0 },
                    { title: "Emails Sent", value: stats.total_emails_sent.toLocaleString(), subtitle: "Total delivered", icon: Mail, delay: 0.1 },
                    { title: "Open Rate", value: `${openRate}%`, subtitle: `${stats.total_emails_opened.toLocaleString()} opened`, icon: Users, delay: 0.2 },
                    { title: "Click Rate", value: `${clickRate}%`, subtitle: `${stats.total_emails_clicked.toLocaleString()} clicked`, icon: MousePointerClick, delay: 0.3 },
                ].map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: stat.delay }}
                    >
                        <Card className="hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
                        <CardTitle className="flex items-center gap-2">
                            <span>Recent Campaigns</span>
                            <div className="flex-1" />
                            <Link href="/marketing/campaigns">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-normal"
                                >
                                    View all
                                    <ArrowRight className="h-3 w-3" />
                                </motion.button>
                            </Link>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {stats.recent_campaigns.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-12">
                                No campaigns yet. Create your first campaign to get started!
                            </p>
                        ) : (
                            <div className="divide-y">
                                {stats.recent_campaigns.map((campaign, index) => (
                                    <motion.div
                                        key={campaign._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                                    >
                                        <Link href={`/marketing/campaigns/${campaign._id}`}>
                                            <motion.div
                                                className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-300 cursor-pointer group"
                                                whileHover={{ x: 4 }}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                                                        {campaign.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2 capitalize flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                                                        {campaign.status}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow-sm ${campaign.status === 'completed' ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200' :
                                                        campaign.status === 'sending' ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200' :
                                                            campaign.status === 'scheduled' ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200' :
                                                                campaign.status === 'cancelled' ? 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200' :
                                                                    'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200'
                                                        }`}>
                                                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                                    </span>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </motion.div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
