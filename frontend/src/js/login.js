import "./main.js";
import axios from "axios";
import Cookies from "js-cookie";

// debugger;

if (Cookies.get("token")) {
    console.log("Token exists");
    axios
        .get("http://localhost:8000/api/user", {
            headers: {
                Authorization: `Bearer ${Cookies.get("token")}`,
            },
        })
        .then((response) => {
            console.log(response);
            window.location.href = "/dashboard.html";
        })
        .catch((error) => {
            console.log(error);
        });
}

const form = document.querySelector("form");
console.log(form);
form.addEventListener(
    "submit",
    (event) => {
        event.preventDefault();
        console.log("submit");
        // event.stopPropagation();

        form.classList.add("was-validated");
        axios
            .post("http://localhost:8000/api/login", {
                email: document.getElementById("floatingInput").value,
                password: document.getElementById("floatingPassword").value,
            })
            .then((response) => {
                console.log(response);
                Cookies.set("token", response.data.token);
                window.location.href = "/dashboard.html";
            })
            .catch((error) => {
                console.log(error);
            });
        return false;
    },
    false
);
