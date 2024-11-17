import Cookies from "js-cookie";
import { API_URL } from "./constants.js"; // TODO: handle oauth in Api.js

export class Auth {
    constructor(app) {
        this.app = app;
        this.user = null;
        this.authenticated = false;
        this.accessToken = Cookies.get("access_token");
        this.oauthPopup = null;
    }

    async authenticate() {
        if (this.accessToken) {
            try {
                const response = await this.app.api.getUser();
                this.user = response;
                this.authenticated = true;
                return true;
            } catch (error) {
                console.error(error);
                this.accessToken = null;
                Cookies.remove("access_token");
                Cookies.remove("refresh_token");
                this.authenticated = false;
                return false;
            }
        } else {
            console.log("No access token found");
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
            const response = await this.app.api.request("post", "/token/refresh/", {
                refresh: refreshToken
            });
            Cookies.set("access_token", response.access);
            this.accessToken = response.access;
            console.log("Access token successfully refreshed");
            return true;
        } catch (error) {
            console.error("Error refreshing access token", error);
            this.logout();
            return false;
        }
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
        try {
            return await this.app.api.createUser({ username, email, password });
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
            const responseData = await this.app.api.login(email, password, otpToken ? otpToken : null);
            if (responseData.success) {
                console.log("Login successful");
                Cookies.set("access_token", responseData.access);
                Cookies.set("refresh_token", responseData.refresh);
                this.accessToken = responseData.access;
                this.app.navigate("/home");
                return responseData;
            } else {
                console.log("2FA required");
                Cookies.set("otp_token", responseData.otp_token);
                this.app.navigate("/two-factor-auth");
                return responseData;
            }
        } catch (error) {
            if (error.response) {
                console.error(
                    `Login error\n${error.response.error}\n${error.message}`
                );
            } else {
                console.error("Axios configuration error:", error.message);
            }
            throw error;
        }
    }

    // two-factor-auth one-time password
    async verifyOtp(otp) {
        if (!otp) {
            throw new Error("Please enter your one-time password");
        }
        try {
            const otpToken = Cookies.get("otp_token");
            const responseData = await this.app.api.verifyOtp(otp, otpToken);
            if (responseData.success) {
                console.log("2FA successful");
                Cookies.set("access_token", responseData.access);
                Cookies.set("refresh_token", responseData.refresh);
                this.accessToken = responseData.access;
                this.authenticated = true;
                Cookies.remove("otp_token");
                return responseData;
            } else {
                throw new Error("An error occurred");
            }
        } catch (error) {
            console.error(
                `OTP error\n${error.response.error}\n${error.message}`
            );
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
        this.accessToken = null;
        this.authenticated = false;
        this.app.navigate("/login");
    }
}
