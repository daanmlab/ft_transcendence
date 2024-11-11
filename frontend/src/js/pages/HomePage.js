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
    }
}

export default HomePage;