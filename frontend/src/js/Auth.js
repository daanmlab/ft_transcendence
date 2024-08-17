import Cookies from "js-cookie";
import axios from "axios";

export class Auth {
    constructor(isCurrentPageProtected, app) {
        this.isCurrentPageProtected = isCurrentPageProtected;
        this.user = null;
        this.authenticated = false;
        this.app = app;
    }

    async authenticate() {
        const token = Cookies.get("token");
        if (token) {
            try {
                this.user = await axios.get("http://localhost:8000/api/user", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                this.authenticated = true;
                return true;
            } catch (error) {
                console.error(error);
                Cookies.remove("token");
                this.authenticated = false;
                return false;
            }
        } else {
            this.authenticated = false;
            return false;
        }
    }

    checkAuthtorization() {
        if (!this.authenticated && this.isCurrentPageProtected) {
            this.app.navigate("/login");
            return false;
        }
        return true;
    }

    async register(username, email, password, password_confirmation) {
        if (!username || !email || !password || !password_confirmation) {
            throw new Error("All fields are required");
        }
        if (password !== password_confirmation) {
            throw new Error("Passwords do not match");
        }
        if (email.indexOf("@") === -1) {
            throw new Error("Invalid email address");
        }
        try {
            const response = await axios.post(
                "http://localhost:8000/api/register",
                { username, email, password }
            );
            return response;
        } catch (error) {
            console.error("Auth: Error response data:", error.response.data);
            throw error;
        }
    }

    async login(email, password) {
        if (!email || !password) {
            throw new Error("Email and password are required");
        }
        try {
            const response = await axios.post(
                "http://localhost:8000/api/login",
                {
                    email: email,
                    password: password,
                }
            );
            Cookies.set("token", response.data.token, { expires: 7 });
            this.app.navigate("/test");
            return response;
        } catch (error) {
            if (error.response) {
                console.error("Auth: Error response data:", error.response.data);
                console.error("Auth: Error response message:", error.message);
            } else if (error.request) {
                console.error("No response received:", error.request);
            } else {
                console.error("Axios configuration error:", error.message);
            }
            throw error;
        }
    }

    logout() {
        Cookies.remove("token");
        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
    }
}
