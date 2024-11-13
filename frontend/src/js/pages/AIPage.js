import Page from "./Page.js";

class AIPage extends Page {
    constructor(app) {
        super({
            name: "ai",
            url: "/ai",
            pageElement: "#AI",
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

export default AIPage;