// src/lib/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err?.response?.status === 401) {
      const here = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?next=${here}`;
    }
    return Promise.reject(err);
  }
);
