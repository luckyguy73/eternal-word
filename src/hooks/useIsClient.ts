import { useState, useEffect } from "react";

/**
 * Hook to determine if the component has mounted on the client.
 * Useful for avoiding hydration mismatches when using localStorage or client-side APIs.
 */
export function useIsClient() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient;
}
