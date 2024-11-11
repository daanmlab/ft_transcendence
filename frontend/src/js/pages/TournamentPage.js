import Page from "./Page.js";

class TournamentPage extends Page {
    constructor(app) {
        super({
            name: "tournament",
            url: "/tournament",
            pageElement: "#Tournament",
            isProtected: true,
            app: app,
        });
    }

    render(app) {
        const { auth } = this;
        const userInfo = auth.user;
        console.log(userInfo);
        const mainElement = this.mainElement;

    }
}

export default TournamentPage;
