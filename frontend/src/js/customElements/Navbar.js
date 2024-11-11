class Navbar extends HTMLElement {
    constructor() {
        super().attachShadow({ mode: "open" });
        this._page = null;
        this.shadowRoot.innerHTML = `
            <style>
                .navbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem 1rem;
                    background-color: #0d6efd;
                }
                .navbar a, .nav-link {
                    color: white;
                    text-decoration: none;
                    margin-right: 1rem;
                    font-weight: 500;
                }
                .navbar a:hover, .nav-link:hover {
                    color: lightgray;
                    cursor: pointer;
                }
                .navbar-brand {
                    font-size: 1.25rem;
                    font-weight: bold;
                }
                .navbar-center {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .navbar-nav {
                    display: flex;
                    gap: 1rem;
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                img.avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin-right: 0.5rem;
                }
                .username {
                    color: white;
                    font-weight: 500;
                }
            </style>
            <nav class="navbar">
                <a class="navbar-brand" data-href="/">Home</a>
                <div class="avatar navbar-center">
                    <img src="/static/images/empty-avatar.jpg" alt="Avatar" class="avatar" />
                    <span class="username"></span>
                </div>
                <ul class="navbar-nav">
                    <li class="login nav-item"><a class="nav-link" data-href="/login">Login</a></li>
                    <li class="register nav-item"><a class="nav-link" data-href="/register">Register</a></li>
                    <li class="settings nav-item"><a class="nav-link" data-href="/settings">Settings</a></li>
                    <li class="logout nav-item"><a class="nav-link" data-href="/logout">Logout</a></li>
                </ul>
            </nav>
        `;

        this.shadowRoot.querySelectorAll("[data-href]").forEach(element => {
            element.addEventListener("click", this.handleClick.bind(this));
        });
    }

    set page(page) {
        this._page = page;
        this.updateAuthValues();
    }

    get page() {
        return this._page;
    }

    handleClick(event) {
        event.preventDefault();
        const href = event.currentTarget.getAttribute("data-href");
        this.dispatchEvent(new CustomEvent("navigate", { detail: href, bubbles: true, composed: true }));
    }

    updateAuthValues() {
        const { auth } = this.page;
        const loginEl = this.shadowRoot.querySelector(".login");
        const registerEl = this.shadowRoot.querySelector(".register");
        const avatarEl = this.shadowRoot.querySelector(".avatar");
        const settingsEl = this.shadowRoot.querySelector(".settings");
        const logoutEl = this.shadowRoot.querySelector(".logout");

        if (auth.authenticated) {
            loginEl.style.display = "none";
            registerEl.style.display = "none";
            avatarEl.querySelector("img").src = auth.user.avatar || "/static/images/empty-avatar.jpg";
            avatarEl.querySelector(".username").textContent = auth.user.username;
        } else {
            avatarEl.style.display = "none";
            logoutEl.style.display = "none";
            settingsEl.style.display = "none";
        }
    }
}

if (!customElements.get("nav-bar"))
    customElements.define("nav-bar", Navbar);