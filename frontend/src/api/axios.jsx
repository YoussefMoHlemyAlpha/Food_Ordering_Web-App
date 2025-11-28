import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:5000/api",
});

// Interceptor to add JWT to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;