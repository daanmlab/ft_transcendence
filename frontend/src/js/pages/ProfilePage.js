import Page from "./Page.js";
import "../customElements/UserProfileCardSm.js";

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
    getAuthUser() {
        return {
            username: this.auth.user.username,
            avatar_upload: this.auth.user.avatar_upload,
            avatar_oauth: this.auth.user.avatar_oauth,
            wins: this.auth.user.game_stats.wins,
            losses: this.auth.user.game_stats.losses,
            date_joined: new Date(this.auth.user.date_joined).toLocaleDateString('en-GB'),
            matchHistory: [
                { opponent: "opponent1", result: "win", date: "2021-01-10" },
                { opponent: "opponent2", result: "loss", date: "2021-01-15" },
                { opponent: "opponent3", result: "win", date: "2021-01-20" },
            ]
        };
    }

    async render(app) {
        const { auth } = this;
        const user = this.getAuthUser();
        console.log("user info", auth.user);

        const UserProfileCard = this.mainElement.querySelector("user-profile");
        UserProfileCard.page = this;
        UserProfileCard.updateProfile(user);

        document.querySelector("#profile-joined").textContent = "joined: " + user.date_joined;
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
