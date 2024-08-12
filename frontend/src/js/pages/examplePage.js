import Page from "./Page.js";

class ExamplePage extends Page {
    constructor(app) {
        super({
            name: "test",
            url: "/test",
            pageElement: "#Test",
            isProtected: true,
            app: app,
        });
    }

    render(app) {
        // first you require the necessary files
        require("../main.js");
        require("../customElements/CustomForm.js");

        // then whenever we needs to change something in the page
        // we can do it here by selecting the elements from the mainElement
        const { mainElement } = this;
        const headerElement = mainElement.querySelector("h1");
        headerElement.style.color = "red";

        const newElement = document.createElement("p");
        newElement.textContent = JSON.stringify(
            { ...this.auth.user, token: this.auth.token },
            null,
            "\t"
        );
        mainElement.insertBefore(newElement, headerElement);
        this.auth.token;
        // or we can add event listeners
        const buttonElement = mainElement.querySelector("button");
        buttonElement.addEventListener("click", () => {
            headerElement.style.color = "green";
        });

        // we can also access the auth object
        const { auth } = this;
        console.log(auth.user);

        // to navigate to another page we can use the app object
        () => {
            this.app.navigate("/login");
        };
        // it can also be done by using the data-href attribute
        // on the element
        // <a href="#" data-href="/login">Login</a>
    }
}

export default ExamplePage;
