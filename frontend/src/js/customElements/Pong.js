import Cookies from "js-cookie";

class Pong extends HTMLElement {
    constructor({} = {}) {
        super();
        this.init();
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

    setWebsockets(id) {
        this.setupEventListeners();
        // ws with headers
        this.ws = new WebSocket(
            `ws://localhost:8000/ws/${id}/?token=${Cookies.get("access_token")}`
        );
        this.ws.onopen = () => {
            console.log("Connected to server");
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // {
            //     "type": "join",
            //     "player": self.scope["user"].username,
            //     "side": self.side
            // }
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
                    console.log("data", data);
                    this.score = data.score;
                    this.setScore();
                    break;
                case "endGame":
                    console.log("Game over");
                    this.score = data.score;
                    this.setScore();
                    this.ws.close();
                    this.dispatchEvent(new CustomEvent("gameOver"));
                    break;
            }
            this.ws.onclose = () => {
                console.log("Disconnected from server");
            };
            console.log(this.ws);
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
        document.addEventListener("keydown", (event) => {
            console.log("keydown", event.key);
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                console.log("keydown", event.key);
                this.ws.send(
                    JSON.stringify({ type: "keydown", key: event.key })
                );
            }
        });
        document.addEventListener("keyup", (event) => {
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                console.log("keyup", event.key);
                this.ws.send(JSON.stringify({ type: "keyup", key: event.key }));
            }
        });
    }

    async startGame(gameId) {
        this.setWebsockets(gameId);
        while (this.ws.readyState !== WebSocket.OPEN) {
            console.log("Waiting for connection...");
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        // this.ws.send(JSON.stringify({ type: "start_game" }));
    }

    connectedCallback() {
        // Add event listeners and start the game loop here
    }

    disconnectedCallback() {
        // Clean up resources and stop the game loop here
        // document.removeEventListener("keydown", );
    }
}
if (!customElements.get("pong-game")) customElements.define("pong-game", Pong);
