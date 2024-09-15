import Page from "./Page";
import axios from "axios";
import { Modal } from 'bootstrap';

class UserSettingsPage extends Page {
    constructor(app) {
        super({
            name: "settings",
            url: "/settings",
            pageElement: "#UserSettings",
            isProtected: true,
            app: app,
        });
    }

    render(app) {
        require("../main.js");
        this.setupEventListeners();
        this.setInitial2FASelection();
    }

    setInitial2FASelection() {
        const twoFactorElement = document.getElementById(`2fa-${this.auth.user.two_factor_method}`);
        if (twoFactorElement) twoFactorElement.checked = true;
    }

    setupEventListeners() {
        const elements = [
            { button: "#change-username button", input: "#new-username", field: "username", message: "Username successfully changed." },
            { button: "#change-email button", input: "#new-email", field: "email", message: "Email successfully changed. Please verify your new email address." },
            { button: "#change-password button", input: "#new-password", field: "new_password", message: "Password successfully changed.", confirmInput: "#confirm-password" }
        ];

        elements.forEach(({ button, input, field, message, confirmInput }) => {
            const btn = document.querySelector(button);
            const inp = document.querySelector(input);
            const confirmInp = confirmInput ? document.querySelector(confirmInput) : null;
            if (btn) btn.addEventListener("click", () => this.handleChange(field, inp.value, message, confirmInp?.value));
        });

        const update2FAButton = document.querySelector("#two-factor .btn");
        if (update2FAButton) {
            update2FAButton.addEventListener("click", () => {
                const selected2FAMethod = document.querySelector("input[name='2fa-method']:checked").id.split("-")[1];
                this.handleChange("two_factor_method", selected2FAMethod, "Two-factor authentication settings updated.");
            });
        }

        const deleteAccountButton = document.querySelector("#confirmDeleteAccount");
        if (deleteAccountButton) {
            deleteAccountButton.addEventListener("click", () => this.deleteAccount());
        }
    }

    deleteAccount() {
        this.sendRequest(null, "Account successfully deleted.");
        Modal.getInstance(document.getElementById('deleteAccountModal')).hide();
    }

    handleChange(field, newValue, successMessage, confirmPasswordValue = null) {
        newValue = newValue.trim();
        if (field === "new_password" && newValue !== confirmPasswordValue) {
            this.showMessage("Passwords do not match.", "error");
            return;
        }
        if (!newValue || newValue === this.auth.user[field]) {
            this.showMessage(`Enter a valid ${field.replace('_', ' ')}.`, "error");
            return;
        }
        this.sendRequest({ [field]: newValue }, successMessage);
    }

    sendRequest(data, successMessage) {
        axios({
            method: data ? 'patch' : 'delete',
            url: "http://localhost:8000/api/user",
            data: data || {},
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.auth.token}`,
            }
        })
            .then(() => {
                this.showMessage(successMessage, "success");
                setTimeout(() => this.app.navigate(this.url), 5000);
            })
            .catch(error => {
                const errors = error.response.data;
                for (const key in errors) {
                    if (errors[key]) {
                        this.showMessage(this.capitalizeFirstLetter(errors[key][0]), "error");
                        return;
                    }
                }
                this.showMessage("An error occurred while updating the settings.", "error");
            });
    }

    capitalizeFirstLetter(message) {
        return message.charAt(0).toUpperCase() + message.slice(1);
    }

    showMessage(message, type) {
        const existingMessageContainer = document.querySelector(".alert");
        if (existingMessageContainer) existingMessageContainer.remove();

        const messageContainer = document.createElement("div");
        messageContainer.className = `alert alert-${type === "success" ? "success" : "danger"} alert-dismissible fade show`;
        messageContainer.textContent = message;

        document.querySelector("#tab-content").appendChild(messageContainer);

        setTimeout(() => {
            messageContainer.classList.remove("show");
            setTimeout(() => messageContainer.remove(), 150);
        }, 5000);
    }
}

export default UserSettingsPage;