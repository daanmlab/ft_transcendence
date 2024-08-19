import {
    LoginPage,
    TestPage,
    NotFoundPage,
    RegisterPage,
    VerifyEmailPage,
} from "./pages/index.js";
import "../scss/styles.scss";
import * as bootstrap from "bootstrap";

class App {
    constructor() {
        this.mainElement = document.querySelector("#main");
        this.pages = {
            test: new TestPage(this),
            login: new LoginPage(this),
            register: new RegisterPage(this),
            404: new NotFoundPage(this),
            verifyEmail: new VerifyEmailPage(this),
        };
        this.currentPage = null;
        this.init();
    }

    navigate(path) {
        if (path === "/") {
            path = "/test";
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
            const queryParams = window.location.search;
            history.pushState({}, page.name, page.url + queryParams);
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
