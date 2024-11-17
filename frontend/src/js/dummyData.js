function getFriends() { // get dummy users
    return [
        {
            username: "user1",
            avatar_upload: "",
            avatar_oauth: "",
            wins: 20,
            losses: 5,
            date_joined: new Date("2021-02-01").toLocaleDateString('en-GB'),
        },
        {
            username: "user2",
            avatar_upload: "avatar_upload2",
            avatar_oauth: "",
            wins: 1,
            losses: 1,
            date_joined: new Date("2021-02-01").toLocaleDateString('en-GB'),
        },
        {
            username: "user3",
            avatar_upload: "avatar_upload3",
            avatar_oauth: "",
            wins: 0,
            losses: 0,
            date_joined: new Date("2021-03-01").toLocaleDateString('en-GB'),
        }
    ];
}

function getInvites() { // get dummy invites
    return [
        {
            username: "user4",
            avatar_upload: "",
            avatar_oauth: "",
            game_stats: {
                wins: 20,
                losses: 5,
            },
            date_joined: new Date("2021-03-01").toLocaleDateString('en-GB'),
        }
    ];
}

module.exports = {
    getFriends,
    getInvites
};