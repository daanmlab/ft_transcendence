import axios from "axios";
import { API_URL, MEDIA_URL } from "./constants.js";

export class Api {
    constructor(auth) {
        this.auth = auth;
        this.client = axios.create({
            baseURL: API_URL,
        });
    }

    async request(method, url, data = null, config = {}) {
        const token = this.auth.accessToken;
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }
        try {
            const response = await this.client.request({
                method,
                url,
                data,
                ...config,
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 401 && this.auth.authenticated) {
                const refreshed = await this.auth.refreshAccessToken();
                if (refreshed) {
                    return this.request(method, url, data, config);
                }
            }
            throw error;
        }
    }

    /* User / Auth */
	async createUser(data) {
		return this.request("post", "/user", data);
	}

	async getUser() {
        return this.request("get", "/user");
    }

    async updateUser(data) {
        return this.request("patch", "/user", data);
    }

    async deleteUser() {
        return this.request("delete", "/user");
    }

    async login(email, password, otpToken = null) {
        return this.request("post", "/token/", {
            email: email,
            password: password,
            otp_token: otpToken,
        });
    }

    async verifyOtp(otp, otpToken) {
        return this.request("post", "/verify-otp", {
            otp: otp,
            otp_token: otpToken,
        });
    }

    /* User lists */
    async getUsers() {
        return this.request("get", "/users/");
    }

    /* Media */
    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append("avatar_upload", file);
        return this.request("patch", "/user", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    }

    async fetchAvatarObjectUrl(path) {
        try {
            const response = await this.request("get", `${MEDIA_URL}/${path}`, null, {
                responseType: "blob",
            });
            return URL.createObjectURL(response);
        } catch {
            return null;
        }
    }

    async fetchAvatarUrls(paths) {
        const requests = paths.map((path) => this.fetchAvatarUrl(path));
        return Promise.all(requests);
    }
}
