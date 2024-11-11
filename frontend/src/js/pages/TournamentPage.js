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

    render(app) {
        const { auth } = this;
        const userInfo = auth.user;
        console.log(userInfo);
    
        const openTournaments = [
            { name: "Ass Cup", id: 1, totalParticipants: 4, participants: 3 },
            { name: "Balls Cup", id: 2, totalParticipants: 4, participants: 0 },
            { name: "Ass and Balls World Cup", id: 3, totalParticipants: 4, participants: 1 },
        ];
        
        const tournamentListElement = document.querySelector("#tournament-list");
        const createTournamentForm = document.querySelector("#create-tournament-form");
        const tournamentNameInput = document.querySelector("#tournament-name");
    
        openTournaments.forEach((tournament) => {
            const tournamentItem = document.createElement("li");
            tournamentItem.className = "list-group-item";
            tournamentItem.textContent = `${tournament.name} - ${tournament.participants} / ${tournament.totalParticipants}`;
            tournamentListElement.appendChild(tournamentItem);
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
