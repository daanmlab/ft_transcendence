import { EMPTY_AVATAR_URL } from "../constants.js";

class UserProfileCard extends HTMLElement {
    constructor() {
        super().attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
            <style>
                .profile-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    margin-bottom: 1rem;
                }
                .profile-avatar {
                    border-radius: 50%;
                    object-fit: cover;
                    border: 1px solid #dee2e6;
                    transition: opacity 0.3s;
                }
                .profile-info, .profile-stats {
                    margin-bottom: 1rem;
                    transition: opacity 0.3s;
                }
                p {
                    margin: 0;
                }
                .profile-stats {
                    visibility: hidden;
                    opacity: 0;
                }
                .profile-stats.visible {
                    visibility: visible;
                    opacity: 1;
                }
            </style>
            <div class="profile-container">
                <div id="profile-info" class="profile-info">
                    <img id="profile-avatar" src="${EMPTY_AVATAR_URL}" alt="User Avatar" class="profile-avatar" width="150" height="150">
                    <p id="profile-username"></p>
                </div>
                <div id="profile-stats" class="profile-stats">
                    <p>Wins: <span id="profile-wins"></span></p>
                    <p>Losses: <span id="profile-losses"></span></p>
                </div>
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
        const winsEl = this.shadowRoot.getElementById("profile-wins");
        const lossesEl = this.shadowRoot.getElementById("profile-losses");
        const profileStats = this.shadowRoot.getElementById("profile-stats");
        const { auth } = this.page;
        const avatar_upload = await auth.loadAvatar(user.avatar_upload);

        avatarEl.style.opacity = 0;
        usernameEl.style.opacity = 0;
        profileStats.style.opacity = 0;

        setTimeout(() => {
            avatarEl.src = avatar_upload || user.avatar || EMPTY_AVATAR_URL;
            usernameEl.textContent = user.username;
            winsEl.textContent = user.wins;
            lossesEl.textContent = user.losses;
            profileStats.classList.add("visible");

            avatarEl.style.opacity = 1;
            usernameEl.style.opacity = 1;
            profileStats.style.opacity = 1;
        }, 300);
    }
}

if (!customElements.get("user-profile"))
    customElements.define("user-profile", UserProfileCard);