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

    render(app) {
        const { getFriends, getInvites } = require('../dummyData.js');

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
    
        getFriends().forEach(friend => {
            const friendItem = setupFriendItem(friend, "Invite", () => {
                friendItem.appendPendingButton();
                inviteBtn.classList.add("d-none");
            });
            sendList.appendChild(friendItem);
        });
    
        getInvites().forEach(invite => {
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