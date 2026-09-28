import axios from 'axios';

// Single Axios instance for the whole app. Server Components pass no
// browser context, so this also works fine when imported during SSR -
// it just won't have a token attached (those calls use fetchServerSide
// below with an explicit cookie/header instead).
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
});

// Attach the JWT (stored client-side after login) to every outgoing
// browser request. Kept deliberately simple for the MVP; a production
// build would prefer an httpOnly cookie set by the API on login instead.
if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = window.localStorage.getItem('tesla_pool_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        window.localStorage.removeItem('tesla_pool_token');
        window.localStorage.removeItem('tesla_pool_user');
      }
      return Promise.reject(err);
    },
  );
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export function extractErrorMessage(err: unknown): string {
  const anyErr = err as any;
  return anyErr?.response?.data?.message ?? anyErr?.message ?? 'Something went wrong';
}
