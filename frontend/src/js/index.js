import {
    LoginPage,
    TestPage,
    NotFoundPage,
    RegisterPage,
} from "./pages/index.js";

class App {
    constructor() {
        this.pages = {
            test: new TestPage(this),
            login: new LoginPage(this),
            register: new RegisterPage(this),
            404: new NotFoundPage(this),
        };
        this.currentPage = null;
        this.init();
    }

    navigate(path) {
        const page = Object.values(this.pages).find(
            (page) => page.url === path
        );
        if (page) {
            this.currentPage = page;
            history.pushState({}, page.name, page.url);
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
