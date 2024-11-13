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
    AIPage
} from "./pages/index.js";
import "../scss/styles.scss";

class App {
    constructor() {
        this.mainElement = document.querySelector("#main");
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
            AI: new AIPage(this)
        };
        this.currentPage = null;
        this.init();
        if (document.getElementById("noScript"))
            document.getElementById("noScript").remove();

        document.addEventListener("navigate", (event) => { // Custom event dispatched from Navbar.handleClick()
            this.navigate(event.detail);
        });
    }



    navigate(path) {
        console.log("path", path);
        if (path === "/") {
            path = "/home";
        } else if (path === "/logout") {
            if (this.currentPage) {
                this.currentPage.auth.logout();
                return
            }
        }
        const page = Object.values(this.pages).find(
            (page) => page.url === path
        );
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
        } else {
            this.navigate("/404");
        }
    }

    init() {
        window.addEventListener("popstate", () => {
            this.navigate(window.location.pathname.toLowerCase());
        });
        this.navigate(window.location.pathname.toLowerCase());
        window.addEventListener("load", () => {
            document.body.classList.remove("loading");
        });
    }
}

const app = new App();
