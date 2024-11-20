import axios from "axios";
import { API_URL, MEDIA_URL } from "./constants.js";

/**
 * Api class handles all API requests.
 */
export class Api {
    constructor(auth) {
        this.auth = auth;
        this.client = axios.create({
            baseURL: API_URL,
        });
    }

    /**
     * Makes an HTTP request using axios.
     * @param {string} method - The HTTP method (e.g., 'get', 'post').
     * @param {string} url - The URL endpoint.
     * @param {Object} [data=null] - The request payload.
     * @param {Object} [config={}] - Additional axios configuration.
     * @returns {Promise<Object>} The response data.
     * @throws {Error} If the request fails.
     */
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

    /**
     * Creates a new user.
     * @param {Object} data - The user data.
     * @returns {Promise<Object>} The response data.
     */
    async createUser(data) {
        return this.request("post", "/user", data);
    }

    /**
     * Retrieves the authenticated user's data.
     * @returns {Promise<Object>} The response data.
     */
    async getUser() {
        return this.request("get", "/user");
    }

    /**
     * Updates the authenticated user's data.
     * @param {Object} data - The updated user data.
     * @returns {Promise<Object>} The response data.
     */
    async updateUser(data) {
        return this.request("patch", "/user", data);
    }

    /**
     * Deletes the authenticated user's account.
     * @returns {Promise<Object>} The response data.
     */
    async deleteUser() {
        return this.request("delete", "/user");
    }

    /**
     * Logs in a user.
     * @param {string} email - The user's email.
     * @param {string} password - The user's password.
     * @param {string} [otpToken=null] - The OTP token for two-factor authentication.
     * @returns {Promise<Object>} The response data.
     */
    async login(email, password, otpToken = null) {
        return this.request("post", "/token/", {
            email: email,
            password: password,
            otp_token: otpToken,
        });
    }

    /**
     * Verifies the one-time password (OTP) for two-factor authentication.
     * @param {string} otp - The one-time password.
     * @param {string} otpToken - The OTP token.
     * @returns {Promise<Object>} The response data.
     */
    async verifyOtp(otp, otpToken) {
        return this.request("post", "/verify-otp", {
            otp: otp,
            otp_token: otpToken,
        });
    }

    /* User lists */

    /**
     * Retrieves a list of users.
     * @returns {Promise<Object>} The response data.
     */
    async getUsers() {
        return this.request("get", "/users/");
    }

    /**
     * Retrieves a list of friends that can be invited.
     * @returns {Promise<Object>} The response data.
     */
    async getFriendsInvitable() {
        return this.request("get", "/friends-invitable/");
    }

    /**
     * Retrieves a list of friend requests.
     * @returns {Promise<Object>} The response data.
     */
    async getFriendRequests() {
        return this.request("get", "/friends-requests/");
    }

    /**
     * Retrieves a list of friends.
     * @returns {Promise<Object>} The response data.
     */
    async getFriends() {
        return this.request("get", "/friends/");
    }

    /* Friends */

    /**
     * Sends a friend request to a user.
     * @param {string} userId - The ID of the user to send a friend request to.
     * @returns {Promise<Object>} The response data.
     */
    async friendRequest(userId) {
        return this.request("post", `/friend-request/${userId}`, {});
    }

    /**
     * Accepts a friend request from a user.
     * @param {string} userId - The ID of the user whose friend request is being accepted.
     * @returns {Promise<Object>} The response data.
     */
    async friendAccept(userId) {
        return this.request("post", `/friend-accept/${userId}`, {});
    }

    /* Media */

    /**
     * Uploads an avatar image for the authenticated user.
     * @param {File} file - The avatar image file.
     * @returns {Promise<Object>} The response data.
     */
    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append("avatar_upload", file);
        return this.request("patch", "/user", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    }

    /**
     * Fetches the avatar image as a blob object URL.
     * @param {string} path - The path to the avatar image.
     * @returns {Promise<string|null>} The object URL of the avatar image, or null if the request fails.
     */
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
}