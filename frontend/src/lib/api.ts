/**
 * API Utility for SecureGuard Frontend
 * Centralizes backend communication and standardizes requests.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

/**
 * Standard fetch wrapper for API calls
 */
export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    
    // Construct URL with query parameters if provided
    let url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    if (params) {
        const queryParams = new URLSearchParams(params).toString();
        url += `?${queryParams}`;
    }

    // Set default headers
    const headers = new Headers(fetchOptions.headers || {});
    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    // Add Auth token if available
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token && !headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    const response = await fetch(url, {
        ...fetchOptions,
        headers,
    });

    if (!response.ok) {
        let errorMessage = 'An error occurred while fetching data';
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
            // Fallback to status text
            errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
    }

    // Handle empty responses
    if (response.status === 204) {
        return {} as T;
    }

    return response.json() as Promise<T>;
}

/**
 * Utility for login requests (formdata)
 */
export async function loginRequest(formData: URLSearchParams) {
    const url = `${API_BASE_URL}/auth/login`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
    }

    return response.json();
}
