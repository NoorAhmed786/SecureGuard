/**
 * Centralized configuration for the frontend.
 * Pulls and formats environment variables with logical fallbacks.
 */

export const CONFIG = {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',

    get WS_URL() {
        const base = this.API_BASE_URL;
        const url = new URL(base);
        const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';

        // For local development, prioritize 127.0.0.1 to match backend listener
        // We do NOT use window.location.hostname because backend might only listen on IPv4 127.0.0.1
        // while localhost might resolve to IPv6 [::1]
        const host = url.hostname;

        const port = url.port || (url.protocol === 'https:' ? '443' : '8000');
        return `${protocol}//${host}:${port}/ws/alerts`;
    }
};
