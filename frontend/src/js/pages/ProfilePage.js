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
    getMatchHistory() {
        return [{ opponent: "opponent1", result: "win", date: "2021-01-10" },
        { opponent: "opponent2", result: "loss", date: "2021-01-15" },
        { opponent: "opponent3", result: "win", date: "2021-01-20" },]
    }

    async render(app) {
        const { auth, api } = this.app;
        const user = auth.user;
        console.log("user info", auth.user);

        const UserProfileCard = this.mainElement.querySelector("user-profile#user");
        UserProfileCard.page = this;
        UserProfileCard.setUser(user);

        document.querySelector("#profile-joined").textContent = "joined: " + user.date_joined;
        const matchHistoryElement = document.querySelector("#match-history");
        this.getMatchHistory().forEach(match => {
            const matchItem = document.createElement("li");
            matchItem.className = "list-group-item";
            matchItem.textContent = `${match.opponent} - ${match.result} - ${match.date}`;
            matchHistoryElement.appendChild(matchItem);
        });

        const friendList = document.querySelector("#friend-list");
        const selectedFriend = this.mainElement.querySelector("user-profile#selected-friend");
        selectedFriend.page = this;

        const setupFriendItem = (friend) => {
            const friendItem = document.createElement("user-profile-small");
            friendItem.page = this;
            friendItem.setUser(friend);
            friendItem.addEventListener("click", () => {
                selectedFriend.setUser(friend);
            });
            return friendItem;
        };

        const friends = await api.getFriends();
        friends.forEach(friend => {
            const friendItem = setupFriendItem(friend);
            friendList.appendChild(friendItem);
        });
    }
}

export default ProfilePage;
