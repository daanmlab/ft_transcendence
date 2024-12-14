import Cookies from "js-cookie";

class Pong extends HTMLElement {
    constructor({} = {}) {
        super();
        this.boundKeyDownHandler = this.keyDownHandler.bind(this);
        this.boundKeyUpHandler = this.keyUpHandler.bind(this);
        this.boundBeforeUnloadHandler = this.beforeUnloadHandler.bind(this);
        this.init();
    }


    set page(page) {
        this._page = page;
    }

    get page() {
        return this._page;
    }
    
    init() {
        this.ws = null;
        this.innerHTML = "";
        this.paddels = {
            left: document.createElement("span"),
            right: document.createElement("span"),
        };
        this.ball = document.createElement("span");
        this.scoreboard = document.createElement("span");
        this.paddels.left.setAttribute("id", "leftPaddle");
        this.paddels.right.setAttribute("id", "rightPaddle");
        this.ball.setAttribute("id", "ball");
        this.scoreboard.setAttribute("id", "scoreboard");
        this.append(
            this.paddels.left,
            this.paddels.right,
            this.ball,
            this.scoreboard
        );
        this.score = [0, 0];
        this.scoreboard.innerHTML = `${this.score[0]} - ${this.score[1]}`;
        this.pressedKeys = [];
        this.playersJoined = [];
    }

    setWebsocket(id) {
        this.setupEventListeners();
        this.ws = new WebSocket(
            `ws://localhost:8000/ws/${id}/?token=${Cookies.get("access_token")}`
        );
        this.ws.onopen = () => {
            console.log("Connected to server");
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data);
            switch (data.type) {
                case "join":
                    this.playersJoined.push(data.player);
                    console.log("Players joined:", this.playersJoined);
                    if (this.playersJoined.length === 2) {
                        console.log("Starting game...");
                        this.ws.send(JSON.stringify({ type: "start_game" }));
                    }
                    break;
                case "gameState":
                    this.setPositions({
                        leftPaddle: {
                            top: `calc(${data.paddles[0].y * 100}%)`,
                        },
                        rightPaddle: {
                            top: `calc(${data.paddles[1].y * 100}%)`,
                        },
                        ball: {
                            top: `calc(${data.ball.y * 100}%)`,
                            left: `calc(${data.ball.x * 100}%)`,
                        },
                    });
                    break;
                case "score":
                    this.score = data.score;
                    this.setScore();
                    break;
                case "endGame":
                    console.log("Game over");
                    this.score = data.score;
                    this.setScore();
                    this.ws.close();
                    break;
                case "error":
                    console.error(data.message);
                    break;
            }
        };
        this.ws.onclose = () => {
            console.log("Disconnected from server");
            this.removeEventListeners(); 
            this.ws = null;
            this.dispatchEvent(new CustomEvent("gameOver"));
        };
    }

    setScore() {
        this.scoreboard.innerHTML = `${this.score[0]} - ${this.score[1]}`;
    }

    setPositions({
        leftPaddle = { top: "calc(50% - 50px)" },
        rightPaddle = { top: "calc(50% - 50px)" },
        ball = { top: "calc(50% - 5px)", left: "calc(50% - 5px)" },
    } = {}) {
        this.paddels.left.style.top = leftPaddle.top;
        this.paddels.right.style.top = rightPaddle.top;
        this.ball.style.top = ball.top;
        this.ball.style.left = ball.left;
    }

    setupEventListeners() {
        document.addEventListener("keydown", this.boundKeyDownHandler);
        document.addEventListener("keyup", this.boundKeyUpHandler);
        window.addEventListener("beforeunload", this.boundBeforeUnloadHandler);
    }

    keyDownHandler(event) {
        console.log("keydown", event.key);
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            if (event.key === "w" || event.key === "s") {
                this.ws.send(
                    JSON.stringify({ type: "keydown", key: event.key })
                );
            }
        }
    }

    keyUpHandler(event) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            if (event.key === "w" || event.key === "s") {
                console.log("keyup", event.key);
                this.ws.send(JSON.stringify({ type: "keyup", key: event.key }));
            }
        }
    }

    beforeUnloadHandler() {
        if (this.ws) {
            this.ws.close();
        }
    }

    async startGame(gameId) {
        this.setWebsocket(gameId);
        try {
            while (this.ws && this.ws.readyState !== WebSocket.OPEN) {
                console.log("Waiting for connection...");
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.error("Error starting game:", error);
        }
    }

    connectedCallback() {
        // Add event listeners and start the game loop here
    }

    removeEventListeners() {
        document.removeEventListener("keydown", this.boundKeyDownHandler);
        document.removeEventListener("keyup", this.boundKeyUpHandler);
        window.removeEventListener("beforeunload", this.boundBeforeUnloadHandler);
    }

    disconnectedCallback() {
        this.removeEventListeners();
    }
}
if (!customElements.get("pong-game")) customElements.define("pong-game", Pong);
