import Page from "./Page";
import axios from "axios";

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
        console.log("this", this);

        require("../main.js");
        this.setupEventListeners();
    }

    setupEventListeners() {
        const changeUsernameButton = document.querySelector("#change-username button");
        const newUsernameInput = document.querySelector("#new-username");

        if (changeUsernameButton) {
            changeUsernameButton.addEventListener("click", (e) => {
                e.preventDefault();
                this.handleChangeUsername(newUsernameInput.value);
            });
        }
    }

    handleChangeUsername(newUsername) {
        if (!newUsername || newUsername.trim() === "") {
            this.showMessage("Please enter a valid username.", "error");
            return;
        }

        const requestData = {
            username: newUsername,
        };

        axios.put("http://localhost:8000/api/settings", requestData, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.auth.token}`,
            }
        })
            .then(response => {
                this.showMessage("Username successfully changed.", "success");
            })
            .catch(error => {
                const errors = error.response.data;
                if (errors.username) {
                    this.showMessage(this.capitalizeFirstLetter(errors.username[0]), "error");
                } else {
                    this.showMessage("An error occurred while changing the username.", "error");
                }
            });
    }

    capitalizeFirstLetter(message) {
        return message.charAt(0).toUpperCase() + message.slice(1);
    }

    showMessage(message, type) {
        const messageContainer = document.createElement("div");
        messageContainer.className = `alert alert-${type === "success" ? "success" : "danger"} fade`;
        messageContainer.textContent = message;

        const changeUsernameForm = document.querySelector("#change-username");
        changeUsernameForm.appendChild(messageContainer);

        setTimeout(() => {
            messageContainer.classList.add("show");
        }, 10);

        setTimeout(() => {
            messageContainer.classList.remove("show");
            setTimeout(() => {
                messageContainer.remove();
            }, 150);
        }, 3000);
    }

}

export default UserSettingsPage;
