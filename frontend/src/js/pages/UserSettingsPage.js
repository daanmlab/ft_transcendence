import Page from "./Page";

class UserSettingsPage extends Page {
    constructor(app) {
        super({
            name: "settings",
			url: "/settings",
            pageElement: "#UserSettings",
            isProtected: false,
            app: app,
        });
    }

    render(app) {
        require("../main.js");
    }

}

export default UserSettingsPage;