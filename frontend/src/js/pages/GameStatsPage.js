import Page from "./Page.js";

class GameStatsPage extends Page {
    constructor(app) {
        super({
            name: "gamestatspage",
            url: "/gamestatspage",
            pageElement: "#GameStats",
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

export default GameStatsPage;
