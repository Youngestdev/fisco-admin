"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Loader2 } from "lucide-react";
import { getCampaigns, Campaign } from "@/lib/api";
import { format } from "date-fns";
import Link from "next/link";

export default function CampaignsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadCampaigns() {
            try {
                const data = await getCampaigns();
                setCampaigns(data);
            } catch (error) {
                console.error("Failed to load campaigns:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadCampaigns();
    }, []);

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
                    <h3 className="text-lg font-medium">Campaigns</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage your email and SMS campaigns.
                    </p>
                </div>
                <Link href="/marketing/campaigns/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Campaign
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Sent/Scheduled</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                        No campaigns found. Create your first one!
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map((campaign) => (
                                    <tr key={campaign._id} className="border-b transition-colors hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/marketing/campaigns/${campaign._id}`)}>
                                        <td className="p-4 align-middle font-medium">{campaign.name}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                                                    campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                        campaign.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center">
                                                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {campaign.type === 'email' ? 'Email' : 'SMS'}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {campaign.sent_at ? format(new Date(campaign.sent_at), 'PPP') :
                                                campaign.scheduled_at ? format(new Date(campaign.scheduled_at), 'PPP') : '-'}
                                        </td>
                                        <td className="p-4 align-middle">
                                            {format(new Date(campaign.created_at), 'PPP')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
