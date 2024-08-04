import Cookies from "js-cookie";
import axios from "axios";

export class Auth {
    constructor() {
        this.user = null;
        this.authenticated = null;
        (async () => {
            this.authenticated = await this.isAuthenticated();
            this.checkAuthtorization();
        })();
    }

    async isAuthenticated() {
        const token = Cookies.get("token");
        if (token) {
            try {
                this.user = await axios.get("http://localhost:8000/api/user", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                return true;
            } catch (error) {
                console.log(error);
                Cookies.remove("token");
                return false;
            }
        }
    }

    checkAuthtorization() {
        const allowed = ["login.html", "register.html"];
        const path = window.location.pathname.split("/").pop();
        if (!this.authenticated && !allowed.includes(path)) {
            window.location.href = "/login.html";
        } else if (this.authenticated && allowed.includes(path)) {
            window.location.href = "/dashboard.html";
        }
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
            window.location.href = "/dashboard.html";
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
            window.location.href = "/dashboard.html";
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
