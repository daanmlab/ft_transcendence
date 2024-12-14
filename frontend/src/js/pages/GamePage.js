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
        console.log(params);
        const gameId = params["id"];
        console.log("Game ID:", gameId);

        const gameElement = mainElement.querySelector("pong-game");
        gameElement.page = this;
        
        const gameResultElement = mainElement.querySelector("#game-result");
        gameElement.startGame(gameId);
        gameElement.addEventListener("gameOver", () => {
            console.log("Game over from Pong component");
            this.app.currentGame = false;
            gameElement.remove();
            gameResultElement.classList.remove("d-none");
        });
    }
}
