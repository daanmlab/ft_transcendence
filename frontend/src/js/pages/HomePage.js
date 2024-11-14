import Page from "./Page.js";

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
        const { getFriends, getInvites } = require('../dummyData.js');

        const { auth } = this;
        const userInfo = auth.user;
        console.log("userInfo", userInfo);

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
                friendItem.remove();
            });
            receiveList.appendChild(friendItem);
        });
    
        inviteBtn.classList.add("d-none");
    }
}

export default HomePage;