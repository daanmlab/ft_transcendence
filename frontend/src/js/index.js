import {
    LoginPage,
    TestPage,
    NotFoundPage,
    RegisterPage,
    VerifyEmailPage,
} from "./pages/index.js";

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
