import Page from "./Page";
import { API_URL } from "../constants.js";

class VerifyEmailPage extends Page {
    constructor(app) {
        super({
            name: "verify-email",
			url: "/verify-email",
            pageElement: "#VerifyEmail",
            isProtected: false,
            app: app,
			preserveParams: true,
        });
    }

    render(app) {
        this.verifyEmail();
    }

    async verifyEmail() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const verificationMessageElement = document.getElementById('verification-message');

        if (!token) {
            verificationMessageElement.textContent = 'No token provided.';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/verify-email/${token}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                verificationMessageElement.textContent = data.message;
            } else {
                verificationMessageElement.textContent = data.error;
            }
        } catch (error) {
			console.error("error", error);
            verificationMessageElement.textContent = 'An error occurred while verifying the email.';
        }
    }
}

export default VerifyEmailPage;