import Page from "./Page.js";
import { EMPTY_AVATAR_URL } from "../constants.js";

class OneVsOne extends Page {
    constructor(app) {
        super({
            name: "onevsone",
            url: "/onevsone",
            pageElement: "#OneVsOne",
            isProtected: true,
            app: app,
        });
    }

    getUsers() { // get dummy users
        return [
            {
                username: this.auth.user.username,
                avatar_upload: this.auth.user.avatar_upload,
                avatar: this.auth.user.avatar,
                wins: 0,
                losses: 0,
                date_joined: new Date(this.auth.user.date_joined).toLocaleDateString('en-GB'),
                matchHistory: [
                    { opponent: "opponent1", result: "win", date: "2021-01-10" },
                    { opponent: "opponent2", result: "loss", date: "2021-01-15" },
                    { opponent: "opponent3", result: "win", date: "2021-01-20" },
                ],
            },
            {
                username: "user2",
                avatar_upload: "avatar_upload2",
                avatar: "",
                wins: 0,
                losses: 0,
                date_joined: new Date("2021-02-01").toLocaleDateString('en-GB'),
                matchHistory: [
                    { opponent: "opponent1", result: "loss", date: "2021-02-10" },
                    { opponent: "opponent2", result: "win", date: "2021-02-15" },
                    { opponent: "opponent3", result: "loss", date: "2021-02-20" },
                ],
            },
            {
                username: "user3",
                avatar_upload: "avatar_upload3",
                avatar: "",
                wins: 0,
                losses: 0,
                date_joined: new Date("2021-03-01").toLocaleDateString('en-GB'),
                matchHistory: [
                    { opponent: "opponent1", result: "win", date: "2021-03-10" },
                    { opponent: "opponent2", result: "win", date: "2021-03-15" },
                    { opponent: "opponent3", result: "loss", date: "2021-03-20" },
                ],
            }
        ];
    }

    render(app) {
        require("../customElements/UserProfileCard.js");
        require("../customElements/UserProfileCardSm.js");
        const { auth } = this;
        console.log("user info", auth.user);

        const friendListElement = document.querySelector("#friend-list");
        const inviteButton = document.querySelector("#invite-friend");
        const selectedFriend = this.mainElement.querySelector("user-profile");

        selectedFriend.page = this;
        const friends = this.getUsers();
        
        friends.forEach(friend => {
            const friendItem = document.createElement("user-profile-small");
            friendItem.page = this;
            friendItem.updateProfile(friend);
            friendItem.addEventListener("click", () => {
                selectedFriend.updateProfile(friend);
                inviteButton.classList.remove("d-none");
                inviteButton.onclick = () => {
                    friendItem.appendPendingButton();
                    inviteButton.classList.add("d-none");
                };
            });
            friendListElement.appendChild(friendItem);
        });

        inviteButton.classList.add("d-none");

    }
}

export default OneVsOne;