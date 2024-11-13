import Page from "./Page.js";
import "../customElements/UserProfileCard.js";
import "../customElements/UserProfileCardSm.js";
import "../customElements/Pong.js";

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

    getFriends() { // get dummy users
        return [
            {
                username: this.auth.user.username,
                avatar_upload: this.auth.user.avatar_upload,
                avatar: this.auth.user.avatar,
                wins: 20,
                losses: 0,
                date_joined: new Date(this.auth.user.date_joined).toLocaleDateString('en-GB'),
            },
            {
                username: "user2",
                avatar_upload: "avatar_upload2",
                avatar: "",
                wins: 1,
                losses: 1,
                date_joined: new Date("2021-02-01").toLocaleDateString('en-GB'),
            },
            {
                username: "user3",
                avatar_upload: "avatar_upload3",
                avatar: "",
                wins: 0,
                losses: 0,
                date_joined: new Date("2021-03-01").toLocaleDateString('en-GB'),
            }
        ];
    }

    getInvites() { // get dummy invites
        return [
            {
                username: "user4",
                avatar_upload: "",
                avatar: "",
                wins: 0,
                losses: 0,
                date_joined: new Date("2021-03-01").toLocaleDateString('en-GB'),
            }
        ];
    }

    render(app) {
        const { auth } = this;
        console.log("user info", auth.user);
    
        const sendList = document.querySelector("#send-list");
        const receiveList = document.querySelector("#receive-list");
        const inviteBtn = document.querySelector("#action-friend");
        const selectedFriend = this.mainElement.querySelector("user-profile");
    
        selectedFriend.page = this;
    
        const setupFriendItem = (friend, actionText, actionCallback) => {
            const friendItem = document.createElement("user-profile-small");
            friendItem.page = this;
            friendItem.updateProfile(friend);
            friendItem.addEventListener("click", () => {
                inviteBtn.classList.remove("d-none");
                inviteBtn.textContent = actionText;
                inviteBtn.onclick = actionCallback;
                selectedFriend.updateProfile(friend);
            });
            return friendItem;
        };
    
        this.getFriends().forEach(friend => {
            const friendItem = setupFriendItem(friend, "Invite", () => {
                friendItem.appendPendingButton();
                inviteBtn.classList.add("d-none");
            });
            sendList.appendChild(friendItem);
        });
    
        this.getInvites().forEach(invite => {
            const friendItem = setupFriendItem(invite, "Accept", () => {
                console.log("Starting game");
                const pongGame = document.querySelector("#pong-simulator");
                pongGame.classList.remove("d-none");
            });
            receiveList.appendChild(friendItem);
        });
    
        inviteBtn.classList.add("d-none");
    }
}

export default OneVsOne;