import Page from "./Page.js";
import { EMPTY_AVATAR_URL } from "../constants.js";

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

    async render(app) {
        const { auth } = this;
        const userInfo = auth.user;
        console.log("userInfo", userInfo);

        const mainElement = this.mainElement;
        const avatarElement = mainElement.querySelector("#avatar");
        const usernameElement = mainElement.querySelector("#username");

        const avatar_upload = await auth.loadAvatar(auth.user.avatar_upload);
        avatarElement.src = avatar_upload ? avatar_upload : EMPTY_AVATAR_URL;
        usernameElement.textContent = userInfo.username;

        // Fetch and log multiple avatar URLs
        const avatarPaths = ["nonexistent", "avatars/DSCF0659.3.jpg", "avatars/ftroiter.jpg"];
        const avatarUrls = await auth.fetchAvatarUrls(avatarPaths);
        console.log("Fetched avatar URLs:", avatarUrls);
    
        const logOutButton = mainElement.querySelector("#logout");
        logOutButton.addEventListener("click", () => {
            auth.logout();
        });
    }
}

export default HomePage;