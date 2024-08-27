import Page from "./Page.js";

class HomePage extends Page {
    constructor(app) {
        super({
            name: "home",
            url: "/home",
            pageElement: "#Home",
            isProtected: true,
            app: app,
        });
    }

    render(app) {

        const { auth } = this;
        const userInfo = auth.user;
        console.log(userInfo);
        const mainElement = this.mainElement;
        const avatarElement = mainElement.querySelector("#avatar");
        const usernameElement = mainElement.querySelector("#username");

        const emptyAvatarUrl = '/static/images/empty-avatar.jpg'
        avatarElement.src = userInfo.avatar ? userInfo.avatar : emptyAvatarUrl;
        usernameElement.textContent = userInfo.username;

        const logOutButton = mainElement.querySelector("#logout");

        logOutButton.addEventListener("click", () => { this.auth.logout(); });
    }
}

export default HomePage;
