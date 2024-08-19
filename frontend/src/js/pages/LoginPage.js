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

        // Prevent the user from accessing the login page if they are already authenticated
        if (this.auth.authenticated) {
            this.app.navigate("/test");
            return;
        }
        
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

        const oAuthButton = this.mainElement.querySelector("#oauth");
        oAuthButton.addEventListener("click", () => {
            this.auth.oAuthLogin().catch((error) => {
                form.showFormError(error.message);
            });
        });
    }
}

export default LoginPage;
