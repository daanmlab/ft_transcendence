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
                    width: 200px;
                    height: 200px;
                }
                .profile-info, .profile-stats {
                    margin-bottom: 1rem;
                }
				p {
					margin: 0;
				}
				.profile-stats {
					visibility: hidden;	
				}
            </style>
            <div class="profile-container">
                <div id="profile-info" class="profile-info">
                    <img id="profile-avatar" src="${EMPTY_AVATAR_URL}" alt="User Avatar" class="profile-avatar" />
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
		
        avatarEl.src = avatar_upload || user.avatar || EMPTY_AVATAR_URL;
        usernameEl.textContent = user.username;
        winsEl.textContent = user.wins;
        lossesEl.textContent = user.losses;
		profileStats.style.visibility = "visible";
    }
}

if (!customElements.get("user-profile"))
    customElements.define("user-profile", UserProfileCard);