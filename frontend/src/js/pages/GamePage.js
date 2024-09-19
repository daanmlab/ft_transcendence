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
        require("../customElements/Pong.js");
        const { auth, mainElement, params } = this;
        console.log(params);
        const gameId = params["id"];
        console.log("Game ID:", gameId);

        const gameElement = mainElement.querySelector("pong-game");
        gameElement.startGame(gameId);
        gameElement.addEventListener("gameover", () => {
            console.log("Game over from game page");
            app.navigate("/home");
        });
    }
}
