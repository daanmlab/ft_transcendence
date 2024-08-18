import Cookies from "js-cookie";
import axios from "axios";

export class Auth {
    constructor(isCurrentPageProtected, app) {
        this.isCurrentPageProtected = isCurrentPageProtected;
        this.user = null;
        this.authenticated = false;
        this.app = app;
        this.oauthPopup = null;
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

    async oAuthLogin() {
        if (this.oauthPopup) {
            try {
                this.oauthPopup.focus();
                return;
            } catch (e) {
                this.oauthPopup = null;
            }
        }

        this.oauthPopup = window.open("http://localhost:8000/api/oauth/42/", "OAuth Login", "width=600,height=600");

        if (!this.oauthPopup) {
            throw new Error("Popup blocked by browser, please unblock.");
        }

        console.log('Checking for token cookie');
        let attempts = 0;
        const maxAttempts = 10;

        const checkForTokenCookie = () => {
            const token = Cookies.get('token');
            if (token) {
                console.log('Token received:', token);
                this.app.navigate('/test');
                if (this.oauthPopup && !this.oauthPopup.closed) {
                    this.oauthPopup.close();
                }
                this.oauthPopup = null;
            } else {
                attempts++;
                if (attempts < maxAttempts) {
                    console.log("Token not received");
                    setTimeout(checkForTokenCookie, 1000);
                } else {
                    console.log('Token not received. Max attempts reached');
                }
            }
        };
        checkForTokenCookie();
    }


    logout() {
        console.log("Logging out");
        Cookies.remove("token");
        if (window.location.pathname !== "/login") {
            this.app.navigate("/login");
        }
    }
}
