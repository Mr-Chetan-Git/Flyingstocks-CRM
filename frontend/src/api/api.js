import axios from "axios";

const api = axios.create({
    baseURL: "/api"
});

// Request Interceptor: Attach valid Bearer token, prevent undefined/null/malformed headers
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token && token !== "undefined" && token !== "null" && token.trim() !== "") {
        const cleanToken = token.startsWith("Bearer ") ? token.slice(7).trim() : token.trim();
        config.headers.Authorization = `Bearer ${cleanToken}`;
    } else {
        delete config.headers.Authorization;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor: Handle auth failures (401 or signature/expired error), clear stale token and redirect
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const msg = error.response?.data?.msg || error.response?.data?.message;

        if (status === 401 || (status === 422 && (msg === "Signature verification failed" || msg === "Token has expired"))) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            if (window.location.pathname !== "/" && window.location.pathname !== "/register") {
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    }
);

export default api;