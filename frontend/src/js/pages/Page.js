import { Auth } from "../Auth.js";

/**
 * Class representing a Page
 * @class
 * @abstract
 */
class Page {
    /**
     * @param {string} name - The name of the page
     * @param {string} url - The URL of the page
     * @param {string} pageElement - The element of the where we can find the content of the page
     * @param {boolean} isProtected - The User must be authenticated to access the page
     * @param {object} app - The app object
     * @param {boolean} [preserveParams=false] - Optional parameter to preserve URL parameters
     */
    constructor({ name, url, pageElement, isProtected, app, preserveParams = false }) {
        this.name = name;
        this.url = url;
        this.pageElement = document.querySelector(pageElement);
        this.mainElement = document.querySelector("#main");
        this.auth = new Auth(isProtected, app);
        this.app = app;
        this.handleClick = this.handleClick.bind(this);
        this.preserveParams = preserveParams;
    }

    async open(app) {
        await this.auth.authenticate();
        if (!this.auth.checkAuthorization()) return;
        document.querySelectorAll("section").forEach((section) => { section.remove() });
        const tempElement = document.createElement(this.pageElement.tagName);
        tempElement.innerHTML = this.pageElement.innerHTML;
        tempElement.querySelectorAll("[data-id]").forEach((element) => {
            element.id = element.getAttribute("data-id");
        });
        this.mainElement.innerHTML = tempElement.innerHTML;
        this.mainElement.querySelectorAll("[data-href]").forEach((element) => {
            element.addEventListener("click", (event) =>
                this.handleClick(event, app)
            );
        });
        document.title = this.name;
        this.renderNavbar(this);
        this.render(app);
    }

    close() {
        this.mainElement.querySelectorAll("[data-href]").forEach((element) => {
            element.removeEventListener("click", (event) =>
                this.handleClick(event, app)
            );
        });
        this.mainElement.innerHTML = "";
    }

    handleClick(event, app) {
        event.preventDefault();
        this.app.navigate(event.currentTarget.getAttribute("data-href"));
    }

    renderNavbar(page) {
        require("../customElements/Navbar.js");
        const navbarElement = document.createElement("nav-bar");
        navbarElement.page = this;
        this.mainElement.insertBefore(navbarElement, this.mainElement.firstChild);
    }

    /**
     * Renders the page
     * @param {object} app - The app object
     * @abstract
     */
    render(app) {
        console.warn(`TEST: Rendering ${this.name} page`);
    }
}

export default Page;
