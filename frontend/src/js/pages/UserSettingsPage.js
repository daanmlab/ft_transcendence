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
        const twoFactorMethod = this.auth.user.two_factor_method;
        const twoFactorElement = document.getElementById(`2fa-${twoFactorMethod}`);
        if (twoFactorElement) {
            twoFactorElement.checked = true;
        }
    }

    setupEventListeners() {
        const changeUsernameButton = document.querySelector("#change-username button");
        const newUsernameInput = document.querySelector("#new-username");
        const changeEmailButton = document.querySelector("#change-email button");
        const newEmailInput = document.querySelector("#new-email");
        const update2FAButton = document.querySelector("#two-factor .btn");

        this.handleButtonClick(changeUsernameButton, newUsernameInput, "username", "Username successfully changed.");
        this.handleButtonClick(changeEmailButton, newEmailInput, "email", "Email successfully changed. Please verify your new email address.");

        if (update2FAButton) {
            update2FAButton.addEventListener("click", (e) => {
                const selected2FAMethod = document.querySelector("input[name='2fa-method']:checked").id.split("-")[1];
                this.handleChange("two_factor_method", selected2FAMethod, "Two-factor authentication settings updated.");
            });
        }

        const deleteAccountButton = document.querySelector("#confirmDeleteAccount");
        if (deleteAccountButton) {
            deleteAccountButton.addEventListener("click", (e) => {
                this.deleteAccount();
            });
        }
    }

    deleteAccount() {
        this.sendRequest(null, "Account successfully deleted.");
        const deleteAccountModal = document.getElementById('deleteAccountModal');
        const modalInstance = Modal.getInstance(deleteAccountModal);
        modalInstance.hide()
    }

    handleButtonClick(button, input, field, successMessage) {
        if (button) {
            button.addEventListener("click", (e) => {
                this.handleChange(field, input.value, successMessage);
            });
        }
    }

    handleChange(field, newValue, successMessage) {
        newValue = newValue.trim();
    
        if (!newValue) {
            this.showMessage(`Enter a valid ${field.replace('_', ' ')}.`, "error");
            return;
        }
    
        if (newValue === this.auth.user[field]) {
            return;
        }
    
        const requestData = { [field]: newValue };
        this.sendRequest(requestData, successMessage);
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
            .then(response => {
                this.showMessage(successMessage, "success");
                setTimeout(() => {
                    this.app.navigate("/settings");
                }, 5000);
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
        if (existingMessageContainer) {
            existingMessageContainer.remove();
        }

        const messageContainer = document.createElement("div");
        messageContainer.className = `alert alert-${type === "success" ? "success" : "danger"} alert-dismissible fade show`;
        messageContainer.textContent = message;

        const tabContentDiv = document.querySelector("#tab-content");
        tabContentDiv.appendChild(messageContainer);

        setTimeout(() => {
            messageContainer.classList.remove("show");
            setTimeout(() => {
                messageContainer.remove();
            }, 150);
        }, 5000);
    }
}

export default UserSettingsPage;