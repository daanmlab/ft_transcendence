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
            const response = await this.auth.login(
                formData.email,
                formData.password
            );
            if (response instanceof Error) {
                form.errorDiv.textContent =
                    "Error submitting form: " + response.response.data.error;
            } else {
                console.log("Form submitted successfully", response);
            }
            return;
        };
    }

    // Add any methods specific to the login page here
}

export default LoginPage;
