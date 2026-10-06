import apiClient from "./client";
import { storage } from "../utils/storage";

apiClient.interceptors.request.use(
    (config) => {
        const token = storage.getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

apiClient.interceptors.response.use(
    (response) => response,

    (error) => {
        if (error.response?.status === 401) {
            storage.removeToken();
            if (
                window.location.pathname !== "/login" &&
                window.location.pathname !== "/register"
            ) {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    },
);

export default apiClient;
