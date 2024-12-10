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

    async render() {
        const { api } = this.app;
        const sendList = document.querySelector("#send-list");
        const receiveList = document.querySelector("#receive-list");
        const inviteBtn = document.querySelector("#action-friend");
        const selectedFriend = this.mainElement.querySelector("user-profile");
        selectedFriend.page = this;

        const sentInvites = await api.getSentGameInvites();
        const friends = await api.getFriends();
        const receivedInvites = await api.getReceivedGameInvites();

        const setupFriendItem = (friend, actionText, actionCallback) => {
            const friendItem = document.createElement("user-profile-small");
            friendItem.page = this;
            friendItem.setUser(friend);
            friendItem.addEventListener("click", () => {
                inviteBtn.classList.remove("d-none");
                inviteBtn.textContent = actionText;
                inviteBtn.onclick = actionCallback;
                selectedFriend.setUser(friend);
            });

            if (sentInvites.some(invite => invite.receiver.id === friend.id && invite.status === "pending")) {
                friendItem.appendPendingButton();
            }

            return friendItem;
        };

        friends.forEach(friend => {
            const friendItem = setupFriendItem(friend, "Invite", async () => {
                try {
                    await api.gameRequest(friend.id);
                    friendItem.appendPendingButton();
                    inviteBtn.classList.add("d-none");
                } catch (error) {
                    console.error(error);
                }
            });
            sendList.appendChild(friendItem);
        });

        receivedInvites.forEach(invite => {
            if (invite.status !== "pending") return;
            const friendItem = setupFriendItem(invite.sender, "Accept", async () => {
                try {
                    const response = await api.gameAccept(invite.id);
                    receiveList.removeChild(friendItem);
                    inviteBtn.classList.add("d-none");
                    console.log(response);
                    console.log("Starting game");
                } catch (error) {
                    console.error(error);
                }
            });
            receiveList.appendChild(friendItem);
        });

        inviteBtn.classList.add("d-none");
    }
}

export default OneVsOne;