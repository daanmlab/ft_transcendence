import Page from "./Page.js";

class LoginPage extends Page {
    constructor(app) {
        super({
            name: "login",
            url: "/login",
            pageElement: "#Login",
            protected: false,
            app: app,
        });
    }

    render(app) {
        require("../main.js");
        require("../customElements/CustomForm.js");

        this.auth.logout();

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

    // Add any methods specific to the login page here
}

export default LoginPage;
