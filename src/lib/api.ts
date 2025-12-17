import { API_BASE_URL } from "./auth";

const CLIENT_ID = process.env.NEXT_PUBLIC_ADMIN_CLIENT_ID || "";

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    // Extract CSRF token from cookies
    const getCsrfToken = () => {
        if (typeof document === "undefined") return "";
        const match = document.cookie.match(/csrf_token=([^;]+)/);
        return match ? match[1] : "";
    };

    const csrfToken = getCsrfToken();
    const method = options.method?.toUpperCase() || "GET";

    const headers: Record<string, string> = {
        ...options.headers as Record<string, string>,
        "client-id": CLIENT_ID,
    };

    // Add CSRF token for state-changing requests
    if (csrfToken && ["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
        headers["X-CSRF-Token"] = csrfToken;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
    });

    if (!response.ok) {
        if (response.status === 401) {
            // Handle unauthorized (redirect to login)
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

// ============================================================================
// Admin Profile
// ============================================================================

export interface AdminProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    is_active: boolean;
    created_at: string;
}

export async function getAdminProfile(): Promise<AdminProfile> {
    return fetchWithAuth("/admin/me");
}

export async function getUsers(page = 1, limit = 10, inactive = false): Promise<UserSearchResult[]> {
    const data = await fetchWithAuth(`/admin/users?page_number=${page}&page_size=${limit}&inactive=${inactive}`);
    if (Array.isArray(data)) {
        return data as UserSearchResult[];
    }
    if (data && Array.isArray((data as any).users)) {
        return (data as any).users as UserSearchResult[];
    }
    // Fallback to empty array if unexpected shape
    return [];
}

export async function getOrders() {
    return fetchWithAuth("/admin/orders");
}

export async function getUser(id: string) {
    return fetchWithAuth(`/admin/users/${id}`);
}

export async function activateUser(id: string) {
    return fetchWithAuth(`/admin/users/${id}/activate`, {
        method: "POST",
    });
}

export async function deactivateUser(id: string) {
    return fetchWithAuth(`/admin/users/${id}/deactivate`, {
        method: "POST",
    });
}

// Permissions
export async function getPermissions() {
    return fetchWithAuth("/admin/permissions");
}

export async function createPermission(data: { identifier: string; description: string }) {
    return fetchWithAuth("/admin/permissions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

export async function updatePermission(id: string, data: { description: string }) {
    return fetchWithAuth(`/admin/permissions/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

export async function deletePermission(id: string) {
    return fetchWithAuth(`/admin/permissions/${id}`, {
        method: "DELETE",
    });
}

// ============================================================================
// Address Types
// ============================================================================

export interface AddressDict {
    city: string;
    country: string;
    line1: string;
    state: string;
    zip: string;
}

export type Address = string | AddressDict;

// ============================================================================
// Business & Storefront Types
// ============================================================================

export interface BusinessListItem {
    _id: string;
    name: string;
    email: string;
    phone_no: string;
    address: Address;
    customers_count: number;
    orders_count: number;
    has_storefront: boolean;
    wallet_balance: number;
    created_at: string;
}

export interface Customer {
    name: string;
    email: string;
    phone_no: string;
    address: Address;
    vendor: string;
    orders: any[];
}

export interface OrderTimeline {
    date: string;
    status: string;
    note: string;
    location: string;
}

export interface OrderItem {
    item_id: string;
    quantity: number;
    name: string;
    price: number;
    image_url: string;
}

export interface OrderOwner {
    name: string;
    email: string;
    phone_no: string;
    address: Address;
    vendor: string;
}

export interface Order {
    id: string;
    name: string;
    reference: string;
    created_at: string;
    eta: string;
    timeline: OrderTimeline[];
    items: OrderItem[];
    owner: OrderOwner;
    source: string;
    channel: string;
    discount_applied: number;
}

export interface InventoryVariation {
    name: string;
    values: string[];
}

export interface VariantCombination {
    sku: string;
    combination: Record<string, string>;
    quantity_in_stock: number;
    price_adjustment: number;
}

export interface InventoryItem {
    _id: string;
    SKU: string;
    name: string;
    description: string;
    price: number;
    quantity_in_stock: number;
    image_url: string;
    // Optional fields that may be present in the API response
    reorder_point?: number;
    reorder_quantity?: number;
    unit_of_measure?: string;
    category_id?: string;
    category_name?: string;
    visible?: boolean;
    slug?: string;
    has_discount?: boolean;
    discount_price?: number;
    // Variations may be null or undefined
    has_variations?: boolean;
    variations?: InventoryVariation[] | null;
    variant_combinations?: VariantCombination[] | null;
}

export interface StorefrontInfo {
    id: string;
    name: string;
    description: string;
    subdomain: string;
    custom_domain?: string;
}

export interface Transaction {
    _id: string;
    type: "deposit" | "withdrawal";
    amount: number;
    created_at: string;
    status?: string;
    reference?: string;
    currency?: string;
    account_name?: string;
    bank_name?: string;
    failure_reason?: string;
}

export interface WalletDetail {
    _id: string;
    business_id: string;
    balance: number;
    has_pin: boolean;
    payout_details: any[];
    created_at: string;
    updated_at: string;
    transactions: Transaction[];
}

export interface BusinessDetail {
    _id: string;
    name: string;
    email: string;
    phone_no: string;
    address: Address;
    profile_photo_url?: string;
    website?: string;
    has_storefront: boolean;
    supported_currencies: string[];
    created_at: string;
    owner_id: string;
    customers_count: number;
    customers: Customer[];
    orders_count: number;
    orders: Order[];
    inventory_count: number;
    inventory: InventoryItem[];
    storefront?: StorefrontInfo;
    wallet?: WalletDetail;
}

export interface StorefrontListItem {
    _id: string;
    name: string;
    subdomain: string;
    custom_domain?: string;
    business_name: string;
    business_id: string;
    status: "active" | "disabled";
    items_count: number;
    created_at: string;
}

export interface BusinessSchema {
    id: string;
    address: Address;
    customers: number;
    email: string;
    name: string;
    phone_no: string;
    profile_photo_url?: string;
    website?: string;
    has_storefront: boolean;
    supported_currencies: string[];
}

export interface StorefrontDetail {
    _id: string;
    name: string;
    description: string;
    subdomain: string;
    custom_domain?: string;
    status: "active" | "disabled";
    theme: Record<string, any>;
    supported_currencies: string[];
    created_at: string;
    business: BusinessSchema;
    items_count: number;
    orders_count: number;
}

// ============================================================================
// Business API Functions
// ============================================================================

export async function getBusinesses(pageNumber = 1, pageSize = 10, hasStorefront?: boolean): Promise<BusinessListItem[]> {
    let url = `/admin/businesses?page_number=${pageNumber}&page_size=${pageSize}`;
    if (hasStorefront !== undefined) {
        url += `&has_storefront=${hasStorefront}`;
    }
    return fetchWithAuth(url);
}

export async function getBusiness(
    businessId: string,
    ordersLimit = 10,
    inventoryLimit = 10,
    transactionsLimit = 20
): Promise<BusinessDetail> {
    return fetchWithAuth(
        `/admin/businesses/${businessId}?orders_limit=${ordersLimit}&inventory_limit=${inventoryLimit}&transactions_limit=${transactionsLimit}`
    );
}

export async function getBusinessOrders(
    businessId: string,
    pageNumber = 1,
    pageSize = 10
): Promise<Order[]> {
    return fetchWithAuth(
        `/admin/businesses/${businessId}/orders?page_number=${pageNumber}&page_size=${pageSize}`
    );
}

export async function getBusinessCustomers(
    businessId: string,
    pageNumber = 1,
    pageSize = 10
): Promise<Customer[]> {
    return fetchWithAuth(
        `/admin/businesses/${businessId}/customers?page_number=${pageNumber}&page_size=${pageSize}`
    );
}

export async function getBusinessInventory(
    businessId: string,
    pageNumber = 1,
    pageSize = 10
): Promise<InventoryItem[]> {
    return fetchWithAuth(
        `/admin/businesses/${businessId}/inventory?page_number=${pageNumber}&page_size=${pageSize}`
    );
}

// ============================================================================
// Storefront API Functions
// ============================================================================

export async function getStorefronts(pageNumber = 1, pageSize = 10): Promise<StorefrontListItem[]> {
    return fetchWithAuth(`/admin/storefronts?page_number=${pageNumber}&page_size=${pageSize}`);
}

export async function getStorefront(storefrontId: string): Promise<StorefrontDetail> {
    return fetchWithAuth(`/admin/storefronts/${storefrontId}`);
}

// ============================================================================
// Dashboard Stats
// ============================================================================

export interface DashboardStats {
    total_businesses: number;
    active_businesses: number;
    businesses_with_storefronts: number;
    total_users: number;
    active_users: number;
    inactive_users: number;
    total_orders: number;
    orders_by_status: {
        created: number;
        processing: number;
        delivered: number;
        cancelled: number;
    };
    orders_today: number;
    orders_this_week: number;
    orders_this_month: number;
    total_wallet_balance: number;
    total_deposits: number;
    total_withdrawals: number;
    pending_withdrawals: number;
    total_inventory_items: number;
    total_inventory_value: number;
    low_stock_items: number;
    out_of_stock_items: number;
    total_customers: number;
    total_storefronts: number;
    active_storefronts: number;
    storefronts_with_custom_domains: number;
    recent_signups: number;
    recent_orders: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
    return fetchWithAuth("/admin/dashboard/stats");
}

// ============================================================================
// Wallet History
// ============================================================================

export async function getBusinessWalletHistory(
    businessId: string,
    pageNumber = 1,
    pageSize = 10
): Promise<Transaction[]> {
    return fetchWithAuth(
        `/admin/businesses/${businessId}/wallet-history?page_number=${pageNumber}&page_size=${pageSize}`
    );
}

// ============================================================================
// Search Endpoints
// ============================================================================

export interface UserSearchResult {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
    has_business: boolean;
    created_at: string;
    tier: string;
}

export interface BusinessSearchResult {
    _id: string;
    name: string;
    email: string;
    phone_no: string;
    address: Address;
    customers_count: number;
    orders_count: number;
    has_storefront: boolean;
    wallet_balance: number;
    created_at: string;
}

export interface StorefrontSearchResult {
    _id: string;
    name: string;
    subdomain: string;
    custom_domain?: string;
    business_name: string;
    business_id: string;
    status: "active" | "disabled";
    items_count: number;
    created_at: string;
}

export interface OrderSearchResult {
    id: string;
    name: string;
    reference: string;
    created_at: string;
    eta: string;
    timeline: OrderTimeline[];
    items: OrderItem[];
    owner: OrderOwner;
    source: string;
    channel: string;
    discount_applied: number;
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
    return fetchWithAuth(`/admin/users/search?q=${encodeURIComponent(query)}`);
}

export async function searchBusinesses(query: string): Promise<BusinessSearchResult[]> {
    return fetchWithAuth(`/admin/businesses/search?q=${encodeURIComponent(query)}`);
}

export async function searchStorefronts(query: string): Promise<StorefrontSearchResult[]> {
    return fetchWithAuth(`/admin/storefronts/search?q=${encodeURIComponent(query)}`);
}

export async function searchOrders(query: string): Promise<OrderSearchResult[]> {
    return fetchWithAuth(`/admin/orders/search?q=${encodeURIComponent(query)}`);
}


// ============================================================================
// Marketing API
// ============================================================================

export interface Campaign {
    _id: string;
    business_id?: string | null;
    name: string;
    subject: string;
    content: string;
    type: "email" | "sms";
    status: "draft" | "scheduled" | "sending" | "completed" | "cancelled";
    segment_id: string;
    scheduled_at?: string | null;
    sent_at?: string | null;
    created_at: string;
    updated_at: string;
    created_by: string;
    template?: string;
}

export interface CreateCampaignRequest {
    name: string;
    subject: string;
    content: string;
    type: "email" | "sms";
    segment_id: string;
    scheduled_at?: string;
}

export interface UpdateCampaignRequest {
    name?: string;
    subject?: string;
    content?: string;
    type?: "email" | "sms";
    segment_id?: string;
    scheduled_at?: string;
    template?: string;
}

export interface CampaignAnalytics {
    emails_sent: number;
    emails_delivered: number;
    emails_opened: number;
    emails_clicked: number;
    emails_bounced: number;
    emails_complained: number;
    ctr: number;
    open_rate: number;
}

export interface ClickDetail {
    recipient_email: string;
    clicked_at: string;
    clicked_link: string;
    ip_address: string;
    user_agent: string;
}

export interface OpenDetail {
    recipient_email: string;
    opened_at: string;
}

export interface CampaignDetailResponse {
    campaign: Campaign;
    analytics: CampaignAnalytics;
    click_details: ClickDetail[];
    open_details: OpenDetail[];
    total_recipients: number;
}

export interface Segment {
    _id: string;
    business_id?: string | null;
    name: string;
    description: string;
    type: "manual" | "dynamic";
    manual_user_ids: string[];
    criteria: Record<string, any> | null;
    created_at: string;
    updated_at: string;
}

export interface CreateSegmentRequest {
    name: string;
    description?: string;
    type: "manual" | "dynamic";
    manual_user_ids?: string[];
    criteria?: Record<string, any>;
}

export interface UpdateSegmentRequest {
    name?: string;
    description?: string;
    type?: "manual" | "dynamic";
    manual_user_ids?: string[];
    criteria?: Record<string, any>;
}

export interface WorkflowStep {
    type: "wait" | "send_email" | "send_sms" | "condition";
    duration?: number;
    template_id?: string;
    subject?: string;
    content?: string;
    template?: string;
    condition?: string;
}

export interface Workflow {
    _id: string;
    business_id?: string | null;
    name: string;
    description: string;
    trigger_type: "event" | "schedule";
    trigger_config: Record<string, any>;
    steps: WorkflowStep[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Pagination
export interface PaginatedResponse<T> {
    campaigns?: T[];
    segments?: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface CreateWorkflowRequest {
    name: string;
    description?: string;
    trigger_type: "event" | "schedule";
    trigger_config: Record<string, any>;
    steps: WorkflowStep[];
}

export interface UpdateWorkflowRequest {
    name?: string;
    description?: string;
    trigger_type?: "event" | "schedule";
    trigger_config?: Record<string, any>;
    steps?: WorkflowStep[];
}

// Campaigns
export async function getCampaigns(page = 1, pageSize = 10): Promise<PaginatedResponse<Campaign>> {
    return fetchWithAuth(`/admin/marketing/campaigns?page_number=${page}&page_size=${pageSize}`);
}

export async function getCampaign(campaignId: string): Promise<CampaignDetailResponse> {
    return fetchWithAuth(`/admin/marketing/campaigns/${campaignId}`);
}

export async function createCampaign(data: CreateCampaignRequest): Promise<Campaign> {
    return fetchWithAuth("/admin/marketing/campaigns", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

export async function sendCampaign(campaignId: string): Promise<{ message: string }> {
    return fetchWithAuth(`/admin/marketing/campaigns/${campaignId}/send`, {
        method: "POST",
    });
}

export async function updateCampaign(campaignId: string, data: UpdateCampaignRequest): Promise<Campaign> {
    return fetchWithAuth(`/admin/marketing/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

export async function deleteCampaign(campaignId: string): Promise<{ message: string }> {
    return fetchWithAuth(`/admin/marketing/campaigns/${campaignId}`, {
        method: "DELETE",
    });
}

export async function resendCampaign(campaignId: string): Promise<{ message: string }> {
    return fetchWithAuth(`/admin/marketing/campaigns/${campaignId}/resend`, {
        method: "POST",
    });
}

// Segments
export async function getSegments(page = 1, pageSize = 10): Promise<PaginatedResponse<Segment>> {
    return fetchWithAuth(`/admin/marketing/segments?page_number=${page}&page_size=${pageSize}`);
}

export async function getSegment(segmentId: string): Promise<Segment> {
    return fetchWithAuth(`/admin/marketing/segments/${segmentId}`);
}

export async function createSegment(data: CreateSegmentRequest): Promise<Segment> {
    return fetchWithAuth("/admin/marketing/segments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

export async function updateSegment(segmentId: string, data: UpdateSegmentRequest): Promise<Segment> {
    return fetchWithAuth(`/admin/marketing/segments/${segmentId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

export async function deleteSegment(segmentId: string): Promise<{ message: string }> {
    return fetchWithAuth(`/admin/marketing/segments/${segmentId}`, {
        method: "DELETE",
    });
}

export interface SegmentAudience {
    segment_id: string;
    segment_name: string;
    total_users: number;
    users: {
        _id: string;
        business_id: string;
        name: string;
        email: string;
        is_active: boolean;
        created_at: string;
    }[];
}

export async function getSegmentAudience(segmentId: string): Promise<SegmentAudience> {
    return fetchWithAuth(`/admin/marketing/segments/${segmentId}/audience`);
}

// Workflows
export async function getWorkflows(): Promise<Workflow[]> {
    return fetchWithAuth("/admin/marketing/workflows");
}

export async function getWorkflow(workflowId: string): Promise<Workflow> {
    return fetchWithAuth(`/admin/marketing/workflows/${workflowId}`);
}

export async function createWorkflow(data: CreateWorkflowRequest): Promise<Workflow> {
    return fetchWithAuth("/admin/marketing/workflows", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

export async function updateWorkflow(workflowId: string, data: UpdateWorkflowRequest): Promise<Workflow> {
    return fetchWithAuth(`/admin/marketing/workflows/${workflowId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

export async function updateWorkflowState(workflowId: string, isActive: boolean): Promise<Workflow> {
    return fetchWithAuth(`/admin/marketing/workflows/${workflowId}/state`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: isActive }),
    });
}

export async function deleteWorkflow(workflowId: string): Promise<{ message: string }> {
    return fetchWithAuth(`/admin/marketing/workflows/${workflowId}`, {
        method: "DELETE",
    });
}

export interface MarketingStats {
    total_campaigns: number;
    total_emails_sent: number;
    total_emails_opened: number;
    total_emails_clicked: number;
    recent_campaigns: Campaign[];
}

export async function getMarketingStats(): Promise<MarketingStats> {
    return fetchWithAuth("/admin/marketing/stats");
}

// ============================================================================
// Business Verifications API
// ============================================================================

export interface VerificationStatus {
    status: string;
    message: string;
    identityType: string;
}

export interface PendingVerification {
    user_id: string;
    user_name: string;
    user_email: string;
    business_id: string;
    business_name: string;
    business_email: string;
    document_url: string;
    verification_type: string;
    submitted_at: string;
    latest_status: VerificationStatus;
}

export interface ApproveVerificationResponse {
    message: string;
    user_id: string;
    user_email: string;
}

export interface RejectVerificationRequest {
    reason: string;
    additional_info?: string;
}

export interface RejectVerificationResponse {
    message: string;
    user_id: string;
    user_email: string;
    reason: string;
}

export async function getPendingVerifications(
    pageNumber = 1,
    pageSize = 10
): Promise<PendingVerification[]> {
    return fetchWithAuth(
        `/admin/verifications/pending?page_number=${pageNumber}&page_size=${pageSize}`
    );
}

export async function approveVerification(userId: string): Promise<ApproveVerificationResponse> {
    return fetchWithAuth(`/admin/verifications/${userId}/approve`, {
        method: "POST",
    });
}

export async function rejectVerification(
    userId: string,
    data: RejectVerificationRequest
): Promise<RejectVerificationResponse> {
    return fetchWithAuth(`/admin/verifications/${userId}/reject`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

// ============================================================================
// Admin Transfers API
// ============================================================================

export interface FailedTransferAttempt {
    attempt_number: number;
    error_type: string;
    error_message: string;
    created_at: string;
}

export interface Withdrawal {
    id: string;
    business_id: string;
    amount: number;
    status: "pending" | "processing" | "completed" | "failed" | "refunded";
    failed_attempts_count: number;
    created_at: string;
    transfer_code?: string;
    account_name?: string;
    bank_name?: string;
    failure_reason?: string;
}

export interface WithdrawalListResponse {
    total: number;
    page: number;
    per_page: number;
    withdrawals: Withdrawal[];
}

export interface WithdrawalDetail extends Withdrawal {
    failed_attempts: FailedTransferAttempt[];
    refunds: Refund[];
}

export interface FailedTransfer {
    id: string;
    withdrawal_id: string;
    business_id: string;
    attempt_number: number;
    error_type: string;
    error_message: string;
    created_at: string;
}

export interface FailedTransfersListResponse {
    total: number;
    page: number;
    per_page: number;
    failed_transfers: FailedTransfer[];
}

export interface Refund {
    _id: string;
    withdrawal_id: string;
    business_id: string;
    wallet_id: string;
    amount: number;
    reason: string;
    status: "pending" | "processing" | "completed" | "failed";
    created_at: string;
    processed_at?: string;
}

export interface RefundsListResponse {
    total: number;
    page: number;
    per_page: number;
    refunds: Refund[];
}

export interface CreateRefundRequest {
    withdrawal_id: string;
    reason: string;
}

export interface CreateRefundResponse {
    message: string;
    refund_id: string;
    amount_refunded: number;
}

export interface RetryWithdrawalResponse {
    message: string;
    withdrawal: Withdrawal;
}

export interface WithdrawalsQueryParams {
    business_id?: string;
    status?: string;
    page?: number;
    per_page?: number;
}

export interface FailedTransfersQueryParams {
    withdrawal_id?: string;
    business_id?: string;
    page?: number;
    per_page?: number;
}

export interface RefundsQueryParams {
    withdrawal_id?: string;
    business_id?: string;
    status?: string;
    page?: number;
    per_page?: number;
}

// List All Withdrawals
export async function getWithdrawals(
    params: WithdrawalsQueryParams = {}
): Promise<WithdrawalListResponse> {
    const { business_id, status, page = 1, per_page = 50 } = params;
    let url = `/admin/transfers/withdrawals?page=${page}&per_page=${per_page}`;
    if (business_id) url += `&business_id=${encodeURIComponent(business_id)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    return fetchWithAuth(url);
}

// Get Withdrawal Details
export async function getWithdrawal(withdrawalId: string): Promise<WithdrawalDetail> {
    return fetchWithAuth(`/admin/transfers/withdrawals/${withdrawalId}`);
}

// Retry Failed Withdrawal
export async function retryWithdrawal(withdrawalId: string): Promise<RetryWithdrawalResponse> {
    return fetchWithAuth(`/admin/transfers/withdrawals/${withdrawalId}/retry`, {
        method: "POST",
    });
}

// List Failed Transfers
export async function getFailedTransfers(
    params: FailedTransfersQueryParams = {}
): Promise<FailedTransfersListResponse> {
    const { withdrawal_id, business_id, page = 1, per_page = 50 } = params;
    let url = `/admin/transfers/failed?page=${page}&per_page=${per_page}`;
    if (withdrawal_id) url += `&withdrawal_id=${encodeURIComponent(withdrawal_id)}`;
    if (business_id) url += `&business_id=${encodeURIComponent(business_id)}`;
    return fetchWithAuth(url);
}

// Create Refund
export async function createRefund(data: CreateRefundRequest): Promise<CreateRefundResponse> {
    return fetchWithAuth("/admin/transfers/refunds", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

// List Refunds
export async function getRefunds(
    params: RefundsQueryParams = {}
): Promise<RefundsListResponse> {
    const { withdrawal_id, business_id, status, page = 1, per_page = 50 } = params;
    let url = `/admin/transfers/refunds?page=${page}&per_page=${per_page}`;
    if (withdrawal_id) url += `&withdrawal_id=${encodeURIComponent(withdrawal_id)}`;
    if (business_id) url += `&business_id=${encodeURIComponent(business_id)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    return fetchWithAuth(url);
}
