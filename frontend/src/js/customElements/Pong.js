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
        this.score = {
            left: 0,
            right: 0,
        };
        this.scoreboard.innerHTML = `${this.score.left} - ${this.score.right}`;
        this.pressedKeys = [];
    }

    setWebsockets() {
        this.setupEventListeners();
        // ws with headers
        this.ws = new WebSocket(
            `ws://localhost:8000/ws/?token=${Cookies.get("access_token")}`
        );
        this.ws.onopen = () => {
            console.log("Connected to server");
        };
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data);
            // data = {
            //     type: "state_update",
            //     objects: {
            //         type: "gameState",
            //         ball: {
            //             x: 0.49,
            //             y: 0.49,
            //             width: 0.02,
            //             height: 0.02,
            //             speed_x: 0.03,
            //             speed_y: 0,
            //         },
            //         paddles: [
            //             {
            //                 x: 0.42,
            //                 y: 0.42,
            //                 width: 0.02,
            //                 height: 0.15,
            //             },
            //             {
            //                 x: 0.42,
            //                 y: 0.42,
            //                 width: 0.02,
            //                 height: 0.15,
            //             },
            //         ],
            //     },
            // };
            // const paddleHeight = 0.15;
            if (data.type === "gameState") {
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
            }
        };
        this.ws.onclose = () => {
            console.log("Disconnected from server");
        };
        console.log(this.ws);
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

    connectedCallback() {
        // Add event listeners and start the game loop here
    }

    disconnectedCallback() {
        // Clean up resources and stop the game loop here
        // document.removeEventListener("keydown", );
    }
}
if (!customElements.get("pong-game")) customElements.define("pong-game", Pong);
