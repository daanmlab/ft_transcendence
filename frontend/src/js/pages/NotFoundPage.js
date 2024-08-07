import Page from "./Page";

class NotFoundPage extends Page {
    constructor(app) {
        super({
            name: "404",
            url: "/404",
            pageElement: "#NotFound",
            isProtected: false,
            app: app,
        });
    }
}

export default NotFoundPage;
