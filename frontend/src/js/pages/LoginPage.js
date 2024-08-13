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

        const form = this.mainElement.querySelector("custom-form");
        form.submitForm = async (formData) => {
            if (!formData.email || !formData.password) {
                form.showFormError("Email and password are required");
                return;
            }
            try {
                const response = await this.auth.login(
                    formData.email,
                    formData.password
                );
                console.log("Login response:", response);
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
                console.error("Login: Error in form submission:", error);
                throw error;
            }
        };
    }

    // Add any methods specific to the login page here
}

export default LoginPage;
