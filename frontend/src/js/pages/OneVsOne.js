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

    render(app) {
        const { auth } = this;
        const userInfo = auth.user;
        console.log(userInfo);

        const friends = [
            { username: "friend1", avatar: "" },
            { username: "friend2", avatar: "" },
            { username: "friend3", avatar: "" },
        ];

        const friendListElement = document.querySelector("#friend-list");
        const selectedFriendAvatar = document.querySelector("#selected-friend-avatar");
        const selectedFriendUsername = document.querySelector("#selected-friend-username");
        const inviteButton = document.querySelector("#invite-friend");

        selectedFriendAvatar.src = EMPTY_AVATAR_URL;

        friends.forEach(friend => {
            const avatarSrc = friend.avatar ? friend.avatar : EMPTY_AVATAR_URL;
            const friendItem = document.createElement("li");
            friendItem.className = "list-group-item d-flex justify-content-between align-items-center cursor-pointer";
            friendItem.innerHTML = `
                <div>
                    <img src="${avatarSrc}" alt="${friend.username}'s avatar" class="rounded-circle object-fit-cover border" width="50" height="50">
                    <span>${friend.username}</span>
                </div>
            `;
            friendItem.addEventListener("click", () => {
                selectedFriendAvatar.src = avatarSrc;
                selectedFriendUsername.textContent = friend.username;
                inviteButton.classList.remove("d-none");
                inviteButton.onclick = () => {
                    const existingPendingButton = friendItem.querySelector(".btn-warning");
                    if (!existingPendingButton) {
                        const pendingButton = document.createElement("button");
                        pendingButton.className = "btn btn-warning btn-sm";
                        pendingButton.innerText = "Pending";
                        friendItem.appendChild(pendingButton);
                    }
                    inviteButton.classList.add("d-none");
                };
            });
            friendListElement.appendChild(friendItem);
        });

        inviteButton.classList.add("d-none");
    }
}

export default OneVsOne;