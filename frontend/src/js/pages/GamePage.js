import Page from "./Page.js";

export default class GamePage extends Page {
    constructor(app) {
        super({
            name: "game",
            url: "/game/:id",
            pageElement: "#Game",
            isProtected: true,
            app: app,
        });
    }

    async render(app) {
        const { auth, mainElement, params } = this;
        const gameId = params.get("id");
        console.log("Game ID:", gameId);
    }
}
