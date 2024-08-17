import Page from "./Page.js";

class LoginPage extends Page {
    constructor(app) {
        super({
            name: "login",
            url: "/login",
            pageElement: "#Login",
            isProtected: false,
            app: app,
            preserveParams: true,
        });
    }

    async render(app) {
        require("../main.js");
        require("../customElements/CustomForm.js");

        this.auth.logout();

        this.displayOauthErrorMessages();

        const form = this.mainElement.querySelector("custom-form");
        form.submitForm = async (formData) => {
            try {
                const response = await this.auth.login(
                    formData.email,
                    formData.password
                );
                return response;
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 401) {
                        form.showFormError("Invalid email or password");
                    }
                    else {
                        form.showFormError("An error ocurred");
                    }
                }
                console.error("Login: Error in form submission");
                throw error;
            }
        };
    }

    displayOauthErrorMessages() {
        try {
            const queryParams = new URLSearchParams(window.location.search);
            if (queryParams.get('error')) {
                const form = this.mainElement.querySelector("custom-form");
                form.showFormError("An error occurred trying to get your 42 account.");
            }
        } catch (error) {
            console.error("Error processing error messages", error);
        }
    }
}

export default LoginPage;
