import Page from "./Page.js";

class ProfilePage extends Page {
    constructor(app) {
        super({
            name: "profilepage",
            url: "/profile",
            pageElement: "#Profile",
            isProtected: true,
            app: app,
        });
    }


    render(app) {
        const user = {
            username: "username",
            avatar: "/static/images/empty-avatar.jpg",
            wins: 0,
            losses: 0,
            joined: "2021-01-01",
            matchHistory: [
                { opponent: "opponent1", result: "win", date: "2021-01-10" },
                { opponent: "opponent2", result: "loss", date: "2021-01-15" },
                { opponent: "opponent3", result: "win", date: "2021-01-20" },
            ],
        };
    
        const { auth } = this;
        const userInfo = auth.user;
        console.log(userInfo);
        const mainElement = this.mainElement;
    
        document.querySelector("#profile-avatar").src = user.avatar;
        document.querySelector("#profile-username").textContent = user.username;
        document.querySelector("#profile-wins").textContent = user.wins;
        document.querySelector("#profile-losses").textContent = user.losses;
        document.querySelector("#profile-joined").textContent = "joined: " + user.joined;
    
        const matchHistoryElement = document.querySelector("#match-history");
        user.matchHistory.forEach(match => {
            const matchItem = document.createElement("li");
            matchItem.className = "list-group-item";
            matchItem.textContent = `${match.opponent} - ${match.result} - ${match.date}`;
            matchHistoryElement.appendChild(matchItem);
        });
    }
}

export default ProfilePage;
