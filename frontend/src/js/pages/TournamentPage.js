import Page from "./Page.js";

class TournamentPage extends Page {
    constructor(app) {
        super({
            name: "tournament",
            url: "/tournament",
            pageElement: "#Tournament",
            isProtected: true,
            app: app,
        });
    }

    appendPendingButton(tournamentItem) {
        const existingPendingButtons = document.querySelectorAll(".pending");
        existingPendingButtons.forEach(button => button.remove());

        const pendingButton = document.createElement("button");
        pendingButton.className = "pending btn btn-primary";
        pendingButton.textContent = "Pending";
        tournamentItem.appendChild(pendingButton);
    }

    render(app) {
        require("../customElements/Bracket.js");

        const { auth } = this;
        const userInfo = auth.user;
        console.log(userInfo);
    
        const openTournaments = [
            { name: "Ass Cup", id: 1, totalParticipants: 4, participants: 2 },
            { name: "Balls Cup", id: 2, totalParticipants: 4, participants: 1 },
            { name: "Ass and Balls World Cup", id: 3, totalParticipants: 4, participants: 3 },
        ];
        
        const tournamentListElement = document.querySelector("#tournament-list");
        const createTournamentForm = document.querySelector("#create-tournament-form");
        const tournamentNameInput = document.querySelector("#tournament-name");
    
        openTournaments.forEach((tournament, index) => {
            const tournamentItem = document.createElement("li");
            tournamentItem.className = "list-group-item d-flex justify-content-between align-items-center cursor-pointer";
            tournamentItem.textContent = `${tournament.name} - ${tournament.participants} / ${tournament.totalParticipants}`;
            tournamentListElement.appendChild(tournamentItem);
            tournamentItem.addEventListener("click", () => {
                this.appendPendingButton(tournamentItem);
            });
        
            // Simulate tournament start
            if (index === 2) {
                tournamentItem.classList.add("bg-warning", "text-white");
                tournamentItem.addEventListener("click", () => {
                    const bracketElement = document.querySelector("tournament-bracket");
                    bracketElement.classList.remove("d-none");
                    bracketElement.init(["A", "B", "C", "D"], openTournaments[0].name);
                });
            }
        });
        createTournamentForm.addEventListener("submit", (event) => {
            event.preventDefault();
            let tournamentName = tournamentNameInput.value.trim();
            if (tournamentName.length > 30) {
                tournamentName = tournamentName.substring(0, 30);
            }
            if (tournamentName) {
                const tournamentItem = document.createElement("li");
                tournamentItem.className = "list-group-item";
                tournamentItem.textContent = `${tournamentName} - 1 / 4`;
                tournamentListElement.appendChild(tournamentItem);
                tournamentNameInput.value = "";
            }
        });


    }
}
export default TournamentPage;
