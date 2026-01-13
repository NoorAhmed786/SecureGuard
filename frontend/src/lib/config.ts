/**
 * Centralized configuration for the frontend.
 * Pulls and formats environment variables with logical fallbacks.
 */

export const CONFIG = {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',

    get WS_URL() {
        // Automatically derive WS URL from API URL
        const base = this.API_BASE_URL;
        const url = new URL(base);
        const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';

        // Handle localhost/127.0.0.1 consistency
        let host = url.hostname;
        if (typeof window !== 'undefined') {
            if (host === 'localhost' || host === '127.0.0.1') {
                host = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
            }
        }

        const port = url.port || (url.protocol === 'https:' ? '443' : '8000');
        return `${protocol}//${host}:${port}/ws/alerts`;
    }
};
