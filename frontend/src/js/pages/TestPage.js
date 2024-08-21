import Page from "./Page.js";

class TestPage extends Page {
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
        //headerElement.style.color = "red";

        // or we can add event listeners
        const buttonElement = mainElement.querySelector("button");
        buttonElement.addEventListener("click", () => {
            headerElement.style.color = "green";
        });

        // we can also access the auth object
        const { auth } = this;
        console.log(auth.user);
        // Insert user data into the DOM
        const userInfo = auth.user;

        const avatarElement = mainElement.querySelector("#avatar");
        const usernameElement = mainElement.querySelector("#username");

        const emptyAvatarUrl = '/static/images/empty-avatar.jpg'
        avatarElement.src = userInfo.avatar ? userInfo.avatar : emptyAvatarUrl;
        usernameElement.textContent = userInfo.username;


        const logOutButton = mainElement.querySelector("#logout");

        logOutButton.addEventListener("click", () => { this.auth.logout(); });
        // to navigate to another page we can use the app object
        // () => {
        //        this.app.navigate("/login");
        //    };
        // it can also be done by using the data-href attribute
        // on the element
        // <a href="#" data-href="/login">Login</a>
    }
}

export default TestPage;
