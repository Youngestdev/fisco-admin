"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Loader2 } from "lucide-react";
import { getCampaigns, Campaign } from "@/lib/api";
import { format } from "date-fns";
import Link from "next/link";
import { motion } from "framer-motion";

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
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Campaigns</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage your email and SMS campaigns.
                    </p>
                </div>
                <Link href="/marketing/campaigns/new">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Campaign
                        </Button>
                    </motion.div>
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
                                campaigns.map((campaign, index) => (
                                    <motion.tr
                                        key={campaign._id}
                                        className="border-b transition-all hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent cursor-pointer group"
                                        onClick={() => router.push(`/marketing/campaigns/${campaign._id}`)}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        whileHover={{ x: 4 }}
                                    >
                                        <td className="p-4 align-middle font-medium group-hover:text-primary transition-colors">{campaign.name}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow-sm ${campaign.status === 'completed' ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200' :
                                                campaign.status === 'sending' ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200' :
                                                    campaign.status === 'scheduled' ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200' :
                                                        campaign.status === 'cancelled' ? 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200' :
                                                            'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200'
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
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
