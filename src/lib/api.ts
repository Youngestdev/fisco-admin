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

export async function getUsers(page = 1, limit = 10, inactive = false) {
    return fetchWithAuth(`/admin/users?page_number=${page}&page_size=${limit}&inactive=${inactive}`);
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
// Business & Storefront Types
// ============================================================================

export interface BusinessListItem {
    _id: string;
    name: string;
    email: string;
    phone_no: string;
    address: string;
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
    address: string;
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
    address: string;
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
    address: string;
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
    address: string;
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
    address: string;
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

