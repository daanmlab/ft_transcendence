import Cookies from "js-cookie";
import axios from "axios";
import { API_URL, MEDIA_URL } from "./constants.js";

export class Auth {
    constructor(isCurrentPageProtected, app) {
        this.isCurrentPageProtected = isCurrentPageProtected;
        this.user = null;
        this.authenticated = false;
        this.app = app;
        this.token = Cookies.get("token");
        this.oauthPopup = null;
    }

    async authenticate() {
        this.token = Cookies.get("access_token");
        if (this.token) {
            try {
                const response = await axios.get(
                    `${API_URL}/user`,
                    {
                        headers: {
                            Authorization: `Bearer ${this.token}`,
                        },
                    }
                );
                Cookies.set("access_token", this.token);
                this.user = response.data;
                this.authenticated = true;
                return true;
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    console.log("Access token expired, attempting to refresh");
                    const refreshed = await this.refreshAccessToken();
                    if (refreshed) {
                        return this.authenticate();
                    }
                }
                console.error(error);
                this.token = null;
                Cookies.remove("access_token");
                this.authenticated = false;
                return false;
            }
        } else {
            this.authenticated = false;
            return false;
        }
    }
    
    async refreshAccessToken() {
        const refreshToken = Cookies.get("refresh_token");
        if (!refreshToken) {
            console.error("No refresh token available");
            return false;
        }
    
        try {
            const response = await axios.post(`${API_URL}/token/refresh`, {
                refresh: refreshToken
            });
            const newAccessToken = response.data.access;
            Cookies.set("access_token", newAccessToken);
            this.token = newAccessToken;
            console.log("Access token successfully refreshed");
            return true;
        } catch (error) {
            console.error("Error refreshing access token", error);
            this.logout();
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
                `${API_URL}/register`,
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
                `${API_URL}/login`,
                {
                    email: email,
                    password: password,
                    otp_token: otpToken ? otpToken : null,
                }
            );
            if (response.data.success) {
                console.log("Login successful");
                Cookies.set("access_token", response.data.access);
                Cookies.set("refresh_token", response.data.refresh);
                this.app.navigate("/home");
                return response;
            } else {
                Cookies.set("otp_token", response.data.otp_token);
                this.app.navigate("/two-factor-auth");
                return response;
            }
        } catch (error) {
            if (error.response) {
                console.error(
                    `Login error\n${error.response.data.error}\n${error.message}`
                );
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
            return this.app.navigate("/home");
        }

        if (this.oauthPopup) return; // CORS policy prevents checking if popup is open

        this.oauthPopup = window.open(
            `${API_URL}/oauth/42`,
            "OAuth Login",
            "width=600,height=600"
        );
        if (!this.oauthPopup) {
            throw new Error("Popup blocked by browser, please unblock.");
        }

        let attempts = 0;
        const maxAttempts = 30;

        const checkForTokenCookie = () => {
            // Automatically login if token is received
            const token = Cookies.get("access_token");
            if (token) {
                this.oauthPopup = null;
                return this.app.navigate("/home");
            }
            if (++attempts < maxAttempts) {
                return setTimeout(checkForTokenCookie, 1000);
            }
            console.log("Token not received. Max attempts reached");
            this.oauthPopup = null;
        };
        checkForTokenCookie();
    }

    logout() {
        console.log("Logging out");
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        if (window.location.pathname !== "/login") {
        this.app.navigate("/login");
        }
    }

    async verifyOtp(otp) {
        if (!otp) {
            throw new Error("Please enter your one-time password");
        }
        try {
            const response = await axios.post(
                `${API_URL}/verify-otp`,
                {
                    otp: otp,
                    otp_token: Cookies.get("otp_token"),
                }
            );
            if (response.data.success) {
                console.log("Login successful");
                Cookies.set("access_token", response.data.access);
                Cookies.set("refresh_token", response.data.refresh);
                Cookies.remove("otp_token");
                this.app.navigate("/home");
                return response;
            } else {
                throw new Error("An error occurred");
            }
        } catch (error) {
            console.error(
                `OTP error\n${error.response.data.error}\n${error.message}`
            );
            throw error;
        }
    }
    
    /* Fetches an array of avatar URLs */
    async fetchAvatarUrls(avatarPaths) {
        try {
            const requests = avatarPaths.map(path => this.loadAvatar(path));
            return await Promise.all(requests);
        } catch (error) {
            console.error("Failed to fetch avatar URLs", error);
            return avatarPaths.map(() => null);
        }
    }

    /* Fetches a single avatar URL */
    async loadAvatar(path) {
        try {
            const response = await axios.get(`${MEDIA_URL}/${path}`, {
                headers: { Authorization: `Bearer ${this.token}` },
                responseType: "blob"
            });
            return URL.createObjectURL(response.data);
        } catch (error) {
            console.warn(`Failed to load avatar at ${path}`, error);
            return null;
        }
    }

}
