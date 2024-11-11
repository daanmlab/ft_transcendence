import Page from "./Page.js";

class TwoFactorAuthPage extends Page {
	constructor(app) {
		super({
			name: "two-factor-auth",
			url: "/two-factor-auth",
			pageElement: "#TwoFactorAuth",
			isProtected: false,
			app: app,
		});
	}

	async render(app) {
		require("../customElements/CustomForm.js");

		if (this.auth.authenticated){ return this.app.navigate("/home") }
		if (!this.auth.checkOtpToken()) return;

		const form = this.mainElement.querySelector("custom-form");
		form.submitForm = async (formData) => {
			try {
				const response = await this.auth.verifyOtp(
					formData.otp,
				);
				this.app.navigate("/home");
				return response;
			} catch (error) {
				if (error.response) {
					if (error.response.status === 400 || error.response.status === 410) {
						form.showFormError("One-time password expired. Please login again.");
					} else if (error.response.status === 401) {
						form.showFormError("Invalid one-time password.");
					} else if (error.response.status === 500) {
						form.showFormError("An error ocurred, please try again later.");
					}
				} else {
					form.showFormError(error.message);
				}
				throw error;
			}
		};
	}
}

export default TwoFactorAuthPage;
