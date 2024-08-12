import Cookies from "js-cookie";
import axios from "axios";

export class Auth {
    constructor(isCurrentPageProtected, app) {
        this.isCurrentPageProtected = isCurrentPageProtected;
        this.user = null;
        this.authenticated = false;
        this.app = app;
        this.token = Cookies.get("token");
    }

    async authenticate() {
        this.token = Cookies.get("token");
        if (this.token) {
            try {
                this.user = (
                    await axios.get("http://localhost:8000/api/user", {
                        headers: {
                            Authorization: `Bearer ${this.token}`,
                        },
                    })
                ).data;
                this.authenticated = true;
                return true;
            } catch (error) {
                console.log(error);
                this.token = null;
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
            console.log(error);
            return error;
        }
    }

    logout() {
        Cookies.remove("token");
        window.location.href = "/login.html";
    }
}
