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

    render() {
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
                console.error("error", error);
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

    formatErrorMessages(errorData) {
        if (errorData.detail) {
            return errorData.detail;
        } else {
            const firstKey = Object.keys(errorData)[0];
            if (errorData[firstKey].length > 0) {
                const msg = errorData[firstKey][0];
                return msg.charAt(0).toUpperCase() + msg.slice(1);
            }
        }
    }
}

export default RegisterPage;
