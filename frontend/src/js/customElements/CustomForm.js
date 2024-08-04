class CustomForm extends HTMLElement {
    constructor() {
        console.log("CustomForm constructor");
        super().attachShadow({ mode: "open" });

        this.errorDiv = document.createElement("div");
        this.errorDiv.classList.add("error");
        this.appendChild(this.errorDiv);

        this.state = {
            loading: false,
            formData: {},
        };

        this.shadowRoot.innerHTML = `
            <style>
                .loading {
                    pointer-events: none;
                    opacity: 0.6;
                }
                .error {
                    color: red;
                }
                .spinner-border {
                    width: 1rem;
                    height: 1rem;
                    border-width: 0.2em;
                }
            </style>
            <form class="needs-validation" novalidate>
                <slot></slot>
            </form>
        `;
    }

    connectedCallback() {
        this.form = this.shadowRoot.querySelector("form");

        if (this.form) {
            this.form.addEventListener("submit", this.handleSubmit.bind(this));
            this.form.addEventListener(
                "input",
                this.handleInputChange.bind(this)
            );
            this.querySelectorAll("input, select, textarea").forEach(
                (input) => {
                    this.state.formData[input.id.toLowerCase()] = input.value;
                }
            );
            this.querySelector("button[type='submit']").addEventListener(
                "click",
                (event) => {
                    event.preventDefault();
                    this.form.dispatchEvent(new Event("submit"));
                }
            );
        }
    }

    disconnectedCallback() {
        if (this.form) {
            this.form.removeEventListener("submit", this.handleSubmit);
            this.form.removeEventListener("input", this.handleInputChange);
        }
    }

    handleInputChange(event) {
        const { id, value } = event.target;
        this.state.formData[id.toLowerCase()] = value;
    }

    async handleSubmit(event) {
        event.preventDefault();
        if (this.form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            this.loading = true;
            try {
                const response = await this.submitForm(this.formData);
                // handle successful form submission
                console.log("Form submitted successfully", response);
            } catch (error) {
                // handle error in form submission
                console.log(error);
                this.errorDiv.textContent =
                    "Error submitting form: " + error.message;
            } finally {
                this.loading = false;
            }
        }
        this.form.classList.add("was-validated");
    }

    get formData() {
        return this.state.formData;
    }

    get loading() {
        return this.state.loading;
    }

    /**
     * @param {boolean} isLoading
     * @type {boolean}
     */
    set loading(isLoading) {
        this.state.loading = isLoading;
        const inputs = this.querySelectorAll("input, select, textarea");
        const buttons = this.querySelectorAll('button[type="submit"]');

        inputs.forEach((input) => (input.disabled = isLoading));

        buttons.forEach((button) => {
            if (isLoading) {
                button.disabled = true;
                button.setAttribute("data-original-text", button.textContent);
                button.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`;
            } else {
                button.disabled = false;
                button.innerHTML = button.getAttribute("data-original-text");
            }
        });
    }

    async submitForm(formData) {
        // Simulate a form submission request
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 2000);
        });
    }
}

customElements.define("custom-form", CustomForm);
