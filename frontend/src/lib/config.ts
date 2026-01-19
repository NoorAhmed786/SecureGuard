/**
 * Centralized configuration for the frontend.
 * Pulls and formats environment variables with logical fallbacks.
 */

export const CONFIG = {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',

    get WS_URL() {
        if (typeof window === 'undefined') return '';

        const base = this.API_BASE_URL;
        const url = new URL(base);

        // Use the same hostname as the browser if we're in local dev (localhost/127.0.0.1)
        // This avoids "Origin mismatch" and browser connection blocked errors.
        const currentHostname = window.location.hostname;
        const configHostname = url.hostname;

        const isLocalDev = configHostname === 'localhost' || configHostname === '127.0.0.1';
        const hostname = isLocalDev ? currentHostname : configHostname;

        const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        const port = url.port || (url.protocol === 'https:' ? '443' : '8000');

        return `${protocol}//${hostname}:${port}/ws/alerts`;
    }
};
