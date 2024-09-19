import Page from "./Page.js";
import Games from "../api/Games.js";

class HomePage extends Page {
    constructor(app) {
        super({
            name: "home",
            url: "/home",
            pageElement: "#Home",
            isProtected: true,
            app: app,
        });
    }

    async render(app) {
        const { auth, mainElement } = this;
        const userInfo = auth.user;
        console.log(userInfo);
        const gamesApi = new Games();
        gamesApi.setAuthToken(auth.token);

        let games = {};
        try {
            games = await gamesApi.getGames();
            console.log("Games:", games);
        } catch (error) {
            console.error("Error fetching games:", error);
            return;
        }

        if (games.active_games.length > 0) {
            // set join game card
            mainElement
                .querySelector("#JoinActiveGame")
                .classList.remove("d-none");

            const friendId =
                games.active_games[0].player1 === userInfo.id
                    ? games.active_games[0].player2
                    : games.active_games[0].player1;

            mainElement
                .querySelector("#JoinActiveGame h5")
                .textContent.replace("{{ friend }}", friendId);

            mainElement
                .querySelector("#JoinActiveGame button")
                .addEventListener("click", () => {
                    this.app.navigate("/game/" + games.active_games[0].id);
                });
        } else {
            // set create game card
            mainElement
                .querySelector("#CreateNewGame")
                .classList.remove("d-none");
            const createGameCard = {
                inputElement: mainElement.querySelector("#CreateNewGame input"),
                buttonElement: mainElement.querySelector(
                    "#CreateNewGame button"
                ),
            };
            createGameCard.buttonElement.addEventListener("click", async () => {
                const opponentId = +createGameCard.inputElement.value;
                try {
                    const newGame = await gamesApi.createGame(opponentId);
                    console.log("New game:", newGame);
                    this.app.navigate(`/game/${newGame.id}`);
                } catch (error) {
                    console.error("Error creating game:", error);
                }
            });

            const invitedGamesElement =
                mainElement.querySelector("#InvitedGames");
            console.log(invitedGamesElement);
            const ogLi = invitedGamesElement.querySelector("li");
            console.log(ogLi);
            if (games.invited_games.length > 0) {
                // set invited games

                games.invited_games.forEach((game) => {
                    const listItemElement = ogLi.cloneNode(true);
                    const friendId =
                        game.player1 === userInfo.id
                            ? game.player2
                            : game.player1;
                    listItemElement.querySelector("p").textContent =
                        listItemElement
                            .querySelector("p")
                            .textContent.replace("{{ friend }}", friendId);
                    listItemElement
                        .querySelector("button")
                        .addEventListener("click", () => {
                            this.app.navigate(`/game/${game.id}`);
                        });
                    invitedGamesElement
                        .querySelector("ul")
                        .appendChild(listItemElement);
                });
            }
            ogLi.remove();
        }
    }
}

export default HomePage;
