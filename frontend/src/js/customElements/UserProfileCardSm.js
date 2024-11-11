import { EMPTY_AVATAR_URL } from "../constants.js";

class UserProfileCardSm extends HTMLElement {
    constructor() {
        super().attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
            <style>
                .profile-container {
                    display: flex;
                    align-items: center;
                    text-align: left;
                    margin-bottom: 0.5rem;
                    cursor: pointer;
                }
                .profile-avatar {
                    border-radius: 50%;
                    object-fit: cover;
                    border: 1px solid #dee2e6;
                    margin-right: 0.5rem;
                }
                .profile-username {
                    font-size: 1rem;
                    font-weight: bold;
                }
                .btn-warning {
					margin-left: 10px;
                    background-color: #ffc107;
                    border: none;
                    color: white;
                    padding: 0.25rem 0.5rem;
                    text-align: center;
                    text-decoration: none;
                    border-radius: 0.25rem;
                }
            </style>
            <div class="profile-container">
                <img id="profile-avatar" src="${EMPTY_AVATAR_URL}" alt="User Avatar" class="profile-avatar" width="50" height="50" />
                <span id="profile-username" class="profile-username"></span>
            </div>
        `;
    }

    set page(page) {
        this._page = page;
    }

    get page() {
        return this._page;
    }

    async updateProfile(user) {
        if (!user) return;

        const avatarEl = this.shadowRoot.getElementById("profile-avatar");
        const usernameEl = this.shadowRoot.getElementById("profile-username");
        const { auth } = this.page;
        const avatar_upload = await auth.loadAvatar(user.avatar_upload);

        avatarEl.src = avatar_upload || user.avatar || EMPTY_AVATAR_URL;
        usernameEl.textContent = user.username;
    }

    appendPendingButton() {
        const profileContainer = this.shadowRoot.querySelector(".profile-container");
        const existingPendingButton = profileContainer.querySelector(".btn-warning");
        if (!existingPendingButton) {
            const pendingButton = document.createElement("button");
            pendingButton.className = "btn-warning";
            pendingButton.innerText = "Pending";
            profileContainer.appendChild(pendingButton);
        }
    }
}

if (!customElements.get("user-profile-small"))
    customElements.define("user-profile-small", UserProfileCardSm);