/**
 * SecureGuard Phishing Protection Widget
 * Embeddable JavaScript widget for real-time link protection
 */
(function () {
    'use strict';

    // Get API key from script tag
    const scriptTag = document.currentScript || document.querySelector('script[data-api-key]');
    const API_KEY = scriptTag ? scriptTag.getAttribute('data-api-key') : null;
    // Use HTTPS if served over HTTPS, otherwise fallback to local dev default
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const API_URL = `${protocol}//localhost:8000/api/v1/widget`; // TODO: In prod, this should point to api.secureguard.ai

    if (!API_KEY) {
        console.error('SecureGuard: No API key provided');
        return;
    }

    // Cache for checked URLs (to avoid redundant API calls)
    const urlCache = new Map();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    /**
     * Check if URL is safe using SecureGuard API
     */
    async function checkURL(url) {
        // Check cache first
        const cached = urlCache.get(url);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.result;
        }

        try {
            const response = await fetch(`${API_URL}/check-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                console.error('SecureGuard: API request failed');
                return null;
            }

            const result = await response.json();

            // Cache the result
            urlCache.set(url, {
                result,
                timestamp: Date.now()
            });

            return result;
        } catch (error) {
            console.error('SecureGuard: Error checking URL', error);
            return null;
        }
    }

    /**
     * Show warning modal to user
     */
    function showWarningModal(url, threatInfo) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.id = 'secureguard-modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #1e293b;
            border-radius: 16px;
            padding: 32px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            border: 2px solid #ef4444;
        `;

        const severityColor = threatInfo.threat_score > 0.8 ? '#ef4444' : '#f59e0b';

        modal.innerHTML = `
            <div style="text-align: center;">
                <div style="width: 64px; height: 64px; background: ${severityColor}20; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${severityColor}" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>
                <h2 style="color: white; font-size: 24px; font-weight: bold; margin: 0 0 12px;">⚠️ Security Warning</h2>
                <p style="color: #94a3b8; margin: 0 0 24px;">
                    This link may be dangerous. SecureGuard detected potential ${threatInfo.threat_type}.
                </p>
                <div style="background: #0f172a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                    <p style="color: #64748b; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; font-weight: 600;">Suspicious URL</p>
                    <p style="color: #cbd5e1; font-size: 14px; margin: 0; word-break: break-all; font-family: monospace;">${url}</p>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button id="sg-cancel" style="flex: 1; background: #475569; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
                        Go Back (Safe)
                    </button>
                    <button id="sg-proceed" style="flex: 1; background: transparent; color: #ef4444; border: 2px solid #ef4444; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        Proceed Anyway
                    </button>
                </div>
                <p style="color: #64748b; font-size: 12px; margin: 20px 0 0;">
                    Protected by <strong style="color: #3b82f6;">SecureGuard</strong>
                </p>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Add hover effects
        const cancelBtn = modal.querySelector('#sg-cancel');
        const proceedBtn = modal.querySelector('#sg-proceed');

        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = '#64748b';
        });
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = '#475569';
        });

        proceedBtn.addEventListener('mouseenter', () => {
            proceedBtn.style.background = '#ef4444';
            proceedBtn.style.color = 'white';
        });
        proceedBtn.addEventListener('mouseleave', () => {
            proceedBtn.style.background = 'transparent';
            proceedBtn.style.color = '#ef4444';
        });

        return new Promise((resolve) => {
            cancelBtn.onclick = () => {
                document.body.removeChild(overlay);
                resolve(false);
            };

            proceedBtn.onclick = () => {
                document.body.removeChild(overlay);
                resolve(true);
            };

            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                    resolve(false);
                }
            };
        });
    }

    /**
     * Intercept link clicks
     */
    function interceptLinks() {
        document.addEventListener('click', async (e) => {
            // Find the clicked link
            let target = e.target;
            while (target && target.tagName !== 'A') {
                target = target.parentElement;
            }

            if (!target || !target.href) return;

            // Skip internal links and anchors
            const url = target.href;
            if (url.startsWith('#') || url.startsWith('javascript:') || url.startsWith('mailto:')) {
                return;
            }

            // Check if it's an external link
            const currentDomain = window.location.hostname;
            const linkDomain = new URL(url).hostname;

            // Only check external links
            if (linkDomain === currentDomain) return;

            // Prevent default navigation
            e.preventDefault();
            e.stopPropagation();

            // Check URL safety
            const result = await checkURL(url);

            if (!result) {
                // API failed, allow navigation
                window.location.href = url;
                return;
            }

            if (result.is_safe) {
                // URL is safe, proceed
                window.location.href = url;
            } else {
                // URL is dangerous, show warning
                const proceed = await showWarningModal(url, result);
                if (proceed) {
                    window.location.href = url;
                }
            }
        }, true); // Use capture phase to intercept early
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', interceptLinks);
    } else {
        interceptLinks();
    }

    console.log('SecureGuard: Phishing protection active');
})();
