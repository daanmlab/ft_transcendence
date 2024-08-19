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
        require("../customElements/Pong.js");


        const pongElement = this.mainElement.querySelector("pong-game");
        pongElement.startGame();
    }
}

export default TestPage;
