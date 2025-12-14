import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Address } from "./api";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formats an address for display
 * @param address - Either a string or an AddressDict object
 * @returns Formatted address string
 */
export function formatAddress(address: Address): string {
    if (typeof address === "string") {
        return address;
    }

    // Format address dictionary as a readable string
    const parts = [
        address.line1,
        address.city,
        address.state,
        address.zip,
        address.country,
    ].filter(Boolean);

    return parts.join(", ");
}
