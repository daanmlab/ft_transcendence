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
            try {
                const response = await this.auth.register(
                    formData.username,
                    formData.email,
                    formData.password,
                    formData.confirmpassword
                );
                form.showFormSuccess("User registered successfully. Please verify your email.");
            } catch (error) {
                const errorMessage = error.response?.data?.error || error.message || "An unknown error occurred";
                form.showFormError(errorMessage);
            }
        };
    }
}

export default RegisterPage;
