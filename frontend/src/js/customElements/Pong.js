class Pong extends HTMLElement {
    constructor({} = {}) {
        super();
        this.init();
    }

    init() {
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

    startGame() {
        this.setupEventListeners();
        let ballDirection = {
            x: 1,
            y: 0,
        };
        const ballSpeed = 20;
        const gameLoop = () => {
            const ball = this.ball.getBoundingClientRect();
            const rightPaddle = this.paddels.right.getBoundingClientRect();
            const leftPaddle = this.paddels.left.getBoundingClientRect();
            const game = this.getBoundingClientRect();
            // check for collisions with paddles
            if (ballDirection.x > 0) {
                if (
                    ball.right > rightPaddle.left &&
                    ball.top < rightPaddle.bottom &&
                    ball.bottom > rightPaddle.top
                ) {
                    ballDirection.x = -1;
                    ballDirection.y = Math.random() > 0.5 ? 1 : -1;
                }

                if (ball.right > game.width) {
                    this.score.left++;
                    ballDirection.x = -1;
                    ballDirection.y = 0;
                    this.reset(gameLoop);
                    return;
                }
            } else {
                if (
                    ball.left < leftPaddle.right &&
                    ball.top < leftPaddle.bottom &&
                    ball.bottom > leftPaddle.top
                ) {
                    ballDirection.x = 1;
                    ballDirection.y = Math.random() > 0.5 ? 1 : -1;
                }
                if (ball.left < game.left) {
                    this.score.right++;
                    ballDirection.x = 1;
                    ballDirection.y = 0;
                    this.reset(gameLoop);
                    return;
                }
            }
            if (ball.top < game.top || ball.bottom > game.bottom) {
                ballDirection.y *= -1;
            }

            this.movePaddle();
            // move ball in x direction
            this.ball.style.top = ball.top + ballSpeed * ballDirection.y + "px";
            this.ball.style.left =
                ball.left + ballSpeed * ballDirection.x + "px";
            requestAnimationFrame(gameLoop);
        };
        requestAnimationFrame(gameLoop);
    }

    async reset(gameLoop) {
        this.ball.style.top = "calc(50% - 5px)";
        this.ball.style.left = "calc(50% - 5px)";
        this.paddels.left.style.top = "calc(50% - 50px)";
        this.paddels.right.style.top = "calc(50% - 50px)";
        this.scoreboard.innerHTML = `${this.score.left} - ${this.score.right}`;

        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("3");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("2");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("1");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        gameLoop();
    }

    movePaddle() {
        if (this.pressedKeys.includes("ArrowUp")) {
            this.paddels.right.style.color = "red";
            this.paddels.right.style.top =
                this.paddels.right.getBoundingClientRect().top - 10 + "px";
        }
        if (this.pressedKeys.includes("ArrowDown")) {
            this.paddels.right.style.top =
                this.paddels.right.getBoundingClientRect().top + 10 + "px";
        }
        if (this.pressedKeys.includes("w")) {
            this.paddels.left.style.top =
                this.paddels.left.getBoundingClientRect().top - 10 + "px";
        }
        if (this.pressedKeys.includes("s")) {
            this.paddels.left.style.top =
                this.paddels.left.getBoundingClientRect().top + 10 + "px";
        }
    }

    setupEventListeners() {
        document.addEventListener("keydown", (event) => {
            if (this.pressedKeys.includes(event.key)) return;
            this.pressedKeys.push(event.key);
        });
        document.addEventListener("keyup", (event) => {
            const index = this.pressedKeys.indexOf(event.key);
            if (index > -1) {
                this.pressedKeys.splice(index, 1);
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
