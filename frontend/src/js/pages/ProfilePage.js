import Page from "./Page.js";
import { EMPTY_AVATAR_URL } from "../constants.js";

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


    async render(app) {
        const { auth } = this;
        const avatar_upload = await auth.loadAvatar(auth.user.avatar_upload);
        const user = {
            username: auth.user.username,
            avatar: avatar_upload ? avatar_upload : EMPTY_AVATAR_URL,
            wins: 0,
            losses: 0,
            joined:  new Date(auth.user.date_joined).toLocaleDateString('en-GB'),
            matchHistory: [
                { opponent: "opponent1", result: "win", date: "2021-01-10" },
                { opponent: "opponent2", result: "loss", date: "2021-01-15" },
                { opponent: "opponent3", result: "win", date: "2021-01-20" },
            ],
        };
    
        const userInfo = auth.user;
        console.log(userInfo);
    
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
