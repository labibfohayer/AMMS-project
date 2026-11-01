/* eslint-disable */
import axios from 'axios';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://amms-backend-8zzi.onrender.com';

export function getMediaUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE}${cleanPath}`;
}

const api = axios.create({ baseURL: API_BASE });

if (typeof window !== 'undefined') {
    // 🚀 Background Warmup: Prime backend immediately on page load so it never sleeps
    try {
        fetch(`${API_BASE}/api/health/`, { method: 'GET', keepalive: true }).catch(() => {});
    } catch (_) {}

    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    api.interceptors.response.use(
        (res) => res,
        async (error) => {
            if (error.response?.status === 401) {
            try {
                const refresh = localStorage.getItem('refresh_token');
                if (!refresh) throw new Error();
                const res = await axios.post(`${API_BASE}/api/auth/token/refresh/`, { refresh });
                localStorage.setItem('access_token', res.data.access);
                if (error.config.headers) {
                    error.config.headers.Authorization = `Bearer ${res.data.access}`;
                }
                return axios(error.config);
            } catch {
                localStorage.clear();
                window.location.href = '/login';
            }
            }
            return Promise.reject(error);
        }
    );
}

export default api;
