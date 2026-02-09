import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
});

// Request interceptor - attach JWT token
axiosInstance.interceptors.request.use(
    (config) => {
        // Check both token storage locations for backward compatibility
        const token = localStorage.getItem("accessToken") || localStorage.getItem("clinicAdminToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        // Prevent redirect for session check and login failures
        if (error.response?.status === 401 &&
            !originalRequest.url.includes("/auth/me") &&
            !originalRequest.url.includes("/auth/login")
        ) {
            // Token expired or invalid - clear storage
            localStorage.removeItem("accessToken");
            localStorage.removeItem("clinicAdminToken");
            localStorage.removeItem("clinicAdmin");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
