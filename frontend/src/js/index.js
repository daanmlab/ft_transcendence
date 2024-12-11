import Cookies from "js-cookie";

import {
    LoginPage,
    NotFoundPage,
    RegisterPage,
    VerifyEmailPage,
    OAuthResultPage,
    TwoFactorAuthPage,
    UserSettingsPage,
    HomePage,
    OneVsOne,
    TournamentPage,
    ProfilePage,
    AIPage,
    GamePage,
} from "./pages/index.js";
import "../scss/styles.scss";
import { Api } from "./Api.js";
import { Auth } from "./Auth.js";

/**
 * App class initializes the application, manages page navigation, and handles authentication.
 */
class App {
    constructor() {
        this.mainElement = document.querySelector("#main");
        this.auth = new Auth(this);
        this.api = new Api(this.auth);
        this.pages = {
            login: new LoginPage(this),
            register: new RegisterPage(this),
            404: new NotFoundPage(this),
            verifyEmail: new VerifyEmailPage(this),
            OAuthResult: new OAuthResultPage(this),
            twoFactorAuth: new TwoFactorAuthPage(this),
            settings: new UserSettingsPage(this),
            home: new HomePage(this),
            oneVsOne: new OneVsOne(this),
            tournament: new TournamentPage(this),
            gameStats: new ProfilePage(this),
            AI: new AIPage(this),
            game: new GamePage(this),
        };
        this.currentPage = null;
        this.ws = null;
        this.init();
        if (document.getElementById("noScript"))
            document.getElementById("noScript").remove();
    }

    parsePath(path) {
        const requestedPath = path.replace(/\/+$/, "");

        return Object.values(this.pages).reduce((match, page) => {
            if (match) return match; // If a match is found, skip further processing
            const pagePath = page.url.replace(/\/+$/, "");
            const pageParts = pagePath.split("/").filter(Boolean);
            const requestedParts = requestedPath.split("/").filter(Boolean);

            if (pageParts.length !== requestedParts.length) return null;

            const params = {};
            const isMatch = pageParts.every((part, i) => {
                if (part.startsWith(":")) {
                    params[part.slice(1)] = requestedParts[i];
                    return true;
                }
                return part === requestedParts[i];
            });

            return isMatch ? { page, params } : null;
        }, null);
    }

    /**
     * Navigates to the specified path and updates the current page.
     * @param {string} path - The path to navigate to.
     */
    navigate(path) {
        console.log("path", path);
        if (path === "/") {
            path = "/home";
        } else if (path === "/logout") {
            return this.auth.logout();
        }

        const result = this.parsePath(path);
        if (result === null) {
            console.error("No matching page found for path:", path);
            return;
        }
    
        const { page, params } = result;
        if (page) {
            if (this.currentPage) {
                this.currentPage.close();
            }
            this.mainElement.setAttribute("data-page", page.name);
            this.currentPage = page;
            if (this.currentPage.preserveParams) {
                const queryParams = window.location.search
                history.pushState({}, page.name, page.url + queryParams);
            } else {
                history.pushState({}, page.name, page.url);
            }
            console.log("Navigating to", page.name);
            page.open(this);
            this.initListeningToInvitations();
        } else {
            this.navigate("/404");
        }
    }

    /**
     * Starts listening to WebSocket invitations if authenticated.
     */
    initListeningToInvitations() {
        if (this.auth.authenticated && !this.ws) {
            this.listenToInvitations();
        }
    }

    /**
     * Listens to WebSocket invitations.
     */
    listenToInvitations() {
        if (!this.auth || !this.auth.user) {
            console.log("Cannot establish WebSocket connection: User is not authenticated.");
            return;
        }

        const userId = this.auth.user.id;
        console.log("Establishing WebSocket connection for user:", userId);
        this.ws = new WebSocket(`ws://localhost:8000/ws/game-invitation/${userId}/?token=${Cookies.get("access_token")}`);

        this.ws.addEventListener("open", () => {
            console.log("WebSocket connection established for user:", userId);
        });

        this.ws.addEventListener("message", (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "game_accepted") {
                console.log("Game invitation accepted:", data);
                console.log(`Redirecting to game: ${data.game_url}`);
                this.navigate(data.game_url);
            }
        });

        this.ws.addEventListener("error", (error) => {
            console.error("WebSocket error:", error);
            this.ws = null;
        });

        this.ws.addEventListener("close", () => {
            console.warn("WebSocket connection closed.");
            this.ws = null;
        });

        // Clean up on page unload
        window.addEventListener("beforeunload", () => {
            if (this.ws) {
                this.ws.close();
                this.ws = null;
            }
        });
    }

    /**
     * Initializes the application, sets up event listeners, and handles initial navigation.
     */
    init() {
        window.addEventListener("popstate", () => {
            this.navigate(window.location.pathname.toLowerCase());
        });
        this.navigate(window.location.pathname.toLowerCase());
        window.addEventListener("load", () => {
            document.body.classList.remove("loading");
            this.initListeningToInvitations();
        });
    }
}

const app = new App();