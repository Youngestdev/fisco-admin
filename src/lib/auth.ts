export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
const CLIENT_ID = process.env.NEXT_PUBLIC_ADMIN_CLIENT_ID || "";

export async function login(email: string, password: string, csrfToken?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    // Only add client-id if it exists
    const CLIENT_ID = process.env.NEXT_PUBLIC_ADMIN_CLIENT_ID || "";
    if (CLIENT_ID) {
        headers["client-id"] = CLIENT_ID;
    }

    // Only add CSRF token if it exists (won't exist on initial login)
    if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
    }

    const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email, password }),
        credentials: "include",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Login failed");
    }

    return response.json();
}

export async function logout(csrfToken?: string) {
    const headers: Record<string, string> = {
        "client-id": CLIENT_ID,
    };

    if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
    }

    const response = await fetch(`${API_BASE_URL}/admin/logout`, {
        method: "POST",
        headers,
        credentials: "include",
    });

    if (!response.ok) {
        console.error("Logout failed");
    }
}
