"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, MousePointerClick, TrendingUp, Loader2 } from "lucide-react";
import { getMarketingStats, MarketingStats } from "@/lib/api";

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
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_campaigns}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_emails_sent.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total delivered</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{openRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.total_emails_opened.toLocaleString()} opened
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clickRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.total_emails_clicked.toLocaleString()} clicked
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.recent_campaigns.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No campaigns yet. Create your first campaign to get started!
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {stats.recent_campaigns.map((campaign) => (
                                <div key={campaign._id} className="flex items-center justify-between border-b pb-4 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium leading-none">{campaign.name}</p>
                                        <p className="text-sm text-muted-foreground mt-1 capitalize">
                                            {campaign.status}
                                        </p>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                                                campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                    campaign.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                        }`}>
                                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
