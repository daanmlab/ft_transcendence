import Page from "./Page";

class RegisterPage extends Page {
    constructor(app) {
        super({
            name: "register",
            url: "/register",
            pageElement: "#Register",
            isProtected: false,
            app: app,
        });
    }

    render(app) {
        require("../main.js");
        require("../customElements/CustomForm.js");

        const form = this.mainElement.querySelector("custom-form");
        form.submitForm = async (formData) => {
            const response = await this.auth.register(
                formData.username,
                formData.email,
                formData.password,
                formData.confirmpassword
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
}

export default RegisterPage;
