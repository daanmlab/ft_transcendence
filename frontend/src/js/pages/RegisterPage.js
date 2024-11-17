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
        require("../customElements/CustomForm.js");

        const form = this.mainElement.querySelector("custom-form");
        form.submitForm = async (formData) => {
            try {
                const response = await this.app.auth.register(
                    formData.username,
                    formData.email,
                    formData.password,
                    formData.confirmpassword
                );
                const successMessage = "User registered successfully. Please verify your email.";
                form.showFormSuccess(successMessage);
                this.mainElement.querySelector("#login-success").textContent = successMessage;
                form.style.display = "none";
            } catch (error) {
                let errorMessage = "An unknown error occurred";
                if (error.response && error.response.data) {
                    errorMessage = this.formatErrorMessages(error.response.data);
                } else {
                    errorMessage = error.message || errorMessage;
                }
                form.showFormError(errorMessage);
            }
        };
    }

    formatErrorMessages(errorData) { // This is horrible and should be simplified
        const errorMessages = [];
        if (errorData.detail) {
            errorMessages.push(errorData.detail);
        } else {
            for (const key in errorData) {
                if (errorData[key].length > 0) {
                    errorData[key].forEach(msg => {
                        errorMessages.push(msg.charAt(0).toUpperCase() + msg.slice(1));
                    });
                }
            }
        }
        return errorMessages.join(' ');
    }
}

export default RegisterPage;
