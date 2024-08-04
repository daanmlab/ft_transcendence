import "./main.js";
import axios from "axios";
import { Auth } from "./Auth.js";
import "./customElements/CustomForm.js";

const auth = new Auth();

const form = document.querySelector("custom-form");
console.log(form);
form.submitForm = async (formData) => {
    const response = await auth.login(formData.email, formData.password);
    console.log(response);
    if (response instanceof Error) {
        form.errorDiv.textContent =
            "Error submitting form: " + response.response.data.error;
    } else {
        console.log("Form submitted successfully", response);
    }
    return;
};
