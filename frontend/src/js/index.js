import {
    LoginPage,
    TestPage,
    NotFoundPage,
    RegisterPage,
    VerifyEmailPage,
    OAuthResult,
    TwoFactorAuthPage,
    UserSettingsPage,
    HomePage,
    GamePage,
} from "./pages/index.js";
import "../scss/styles.scss";

class App {
    constructor() {
        this.mainElement = document.querySelector("#main");
        this.pages = {
            test: new TestPage(this),
            login: new LoginPage(this),
            register: new RegisterPage(this),
            404: new NotFoundPage(this),
            verifyEmail: new VerifyEmailPage(this),
            OAuthResult: new OAuthResult(this),
            twoFactorAuth: new TwoFactorAuthPage(this),
            settings: new UserSettingsPage(this),
            home: new HomePage(this),
            game: new GamePage(this),
        };
        this.currentPage = null;
        this.init();
        if (document.getElementById("noScript"))
            document.getElementById("noScript").remove();
    }

    parsePath(path) {
        const requestedPath = path.replace(/\/+$/, "");

        return Object.values(this.pages).reduce((match, page) => {
            if (match) return match; // If a match is found, skip further processing
            console.log("Checking page:", page);
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

    navigate(path) {
        if (path === "/") {
            path = "/home";
        }
        // handle query params example: /game/:id/:action
        const { page = null, params = null } = this.parsePath(path);

        console.log("Navigating to:", path, page, params);

        if (page) {
            page.params = params; // set the params for the page
            if (this.currentPage) {
                this.currentPage.close();
            }
            this.mainElement.setAttribute("data-page", page.name);
            this.currentPage = page;
            if (this.currentPage.preserveParams) {
                const queryParams = window.location.search;
                history.pushState({}, page.name, path + queryParams);
            } else {
                history.pushState({}, page.name, path);
            }
            console.log("Navigating to", page.name);
            page.open(this);
        } else {
            this.navigate("/404");
        }
    }

    init() {
        window.addEventListener("popstate", () => {
            this.navigate(window.location.pathname);
        });
        this.navigate(window.location.pathname);
    }
}

const app = new App();
