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
                console.log(error);
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
        try {
            if (password !== password_confirmation) {
                return {
                    response: { data: { error: "Passwords do not match" } },
                };
            }
            const response = await axios.post(
                "http://localhost:8000/api/register",
                { username, email, password }
            );
            Cookies.set("token", response.data.token, { expires: 7 });
            this.app.navigate("/dashboard");
            return response;
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    async login(email, password) {
        try {
            const response = await axios.post(
                "http://localhost:8000/api/login",
                {
                    email: email,
                    password: password,
                }
            );
            Cookies.set("token", response.data.token, { expires: 7 });
            console.log(this.app);
            this.app.navigate("/test");
            return response;
        } catch (error) {
            console.log("Error logging in", error);
            if (error.response) {
                console.error("Auth: Error response data:", error.response.data);
                console.error("Auth: Error response status:", error.response.status);
                console.error("Auth: Error response headers:", error.response.headers);
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
        window.location.href = "/login.html";
    }
}
