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

    checkAuthorization() {
        if (!this.authenticated && this.isCurrentPageProtected) {
            this.app.navigate("/login");
            return false;
        }
        return true;
    }

    checkOtpToken() {
        if (!Cookies.get("otp_token")) {
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
            const otpToken = Cookies.get("otp_token");
            const response = await axios.post(
                "http://localhost:8000/api/login",
                {
                    email: email,
                    password: password,
                }, { headers: otpToken ? { 'Authorization': `Bearer ${otpToken}` } : {}}
            );
            if (response.data.success) {
                console.log("Login successful");
                Cookies.set("token", response.data.token);
                this.app.navigate("/test");
                return response;
            } else {
                console.log(response.data.message);
                Cookies.set("otp_token", response.data.otp_token);
                this.app.navigate("/two-factor-auth");
                return response;
            }
        } catch (error) {
            if (error.response) {
                console.error(`Login error\n${error.response.data.error}\n${error.message}`);
            } else if (error.request) {
                console.error("No response received:", error.request);
            } else {
                console.error("Axios configuration error:", error.message);
            }
            throw error;
        }
    }

    async oAuthLogin() {
        await this.authenticate();
        if (this.authenticated) {
            return this.app.navigate('/test');
        }

        if (this.oauthPopup) return; // CORS policy prevents checking if popup is open

        this.oauthPopup = window.open("http://localhost:8000/api/oauth/42/", "OAuth Login", "width=600,height=600");
        if (!this.oauthPopup) {
            throw new Error("Popup blocked by browser, please unblock.");
        }

        let attempts = 0;
        const maxAttempts = 10;

        const checkForTokenCookie = () => { // Automatically login if token is received
            const token = Cookies.get('token');
            if (token) {
                this.oauthPopup = null;
                return this.app.navigate('/test');
            }
            if (++attempts < maxAttempts) {
                return setTimeout(checkForTokenCookie, 1000);
            }
            console.log('Token not received. Max attempts reached');
            this.oauthPopup = null;
        };
        checkForTokenCookie();
    }

    logout() {
        Cookies.remove("token");
        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
    }

    async verifyOtp(otp) {
        if (!otp) {
            throw new Error("Please enter your one-time password");
        }
        try {
            const response = await axios.post(
                "http://localhost:8000/api/verify-otp",
                {
                    otp: otp,
                    otp_token: Cookies.get("otp_token"),
                }
            );
            if (response.data.token) {
                Cookies.set("token", response.data.token);
                Cookies.remove("otp_token");
                this.app.navigate("/test");
                return response;
            } else {
                throw new Error("An error occurred");
            }
        } catch (error) {
            console.error(`OTP error\n${error.response.data.error}\n${error.message}`);
            throw error;
        }
    }
}
