import axios from "axios";
import { store } from "../redux/store";
import { logoutUser } from "../redux/authSlice";

// Centralized API configuration pointing to local or deployed backend
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://codearena-backend-ntph.onrender.com",
    withCredentials: true, // Crucial for cookie transmission
    headers: {
        "Content-Type": "application/json"
    }
});

// Interceptor to format errors nicely
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Automatically log out user if session becomes invalid (e.g. user manually deleted)
            store.dispatch(logoutUser());
        }
        const message = error.response?.data || error.message || "An unexpected error occurred";
        return Promise.reject(new Error(message));
    }
);

// AuthService Layer
export const authService = {
    signup: async (signupData) => {
        // signupData: { firstName, lastName, emailId, password }
        const response = await API.post("/user/register", signupData);
        return response.data;
    },
    registerAdminOrUser: async (userData) => {
        // userData: { firstName, lastName, emailId, password, role }
        const response = await API.post("/user/admin/register", userData);
        return response.data;
    },
    deleteAccount: async () => {
        const response = await API.delete("/user/delete");
        return response.data;
    },
    verifyOtp: async (emailId, otp) => {
        const response = await API.post("/user/verify-otp", { emailId, otp });
        return response.data;
    },
    resendOtp: async (emailId) => {
        const response = await API.post("/user/resend-otp", { emailId });
        return response.data;
    },
    login: async (emailId, password) => {
        const response = await API.post("/user/login", { emailId, password });
        return response.data;
    },
    logout: async () => {
        const response = await API.post("/user/logout");
        return response.data;
    },
    getProfile: async () => {
        const response = await API.get("/user/getProfile");
        return response.data;
    }
};

// ProblemService Layer
export const problemService = {
    getAllProblems: async () => {
        const response = await API.get("/problem/getAllProblem");
        return response.data;
    },
    getProblemById: async (id) => {
        const response = await API.get(`/problem/getProblem/${id}`);
        return response.data;
    },
    getSolvedProblems: async () => {
        const response = await API.get("/problem/problemsolved");
        return response.data;
    },
    createProblem: async (problemData) => {
        const response = await API.post("/problem/create", problemData);
        return response.data;
    }
};

// SubmissionService Layer
export const submissionService = {
    submit: async (id, code, language) => {
        const response = await API.post(`/code/submit/${id}`, { code, language });
        return response.data;
    },
    run: async (id, code, language) => {
        const response = await API.post(`/code/run/${id}`, { code, language });
        return response.data;
    },
    getSubmissions: async () => {
        const response = await API.get("/code/submissions");
        return response.data;
    }
};

export default API;
