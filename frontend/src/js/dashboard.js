import "./main.js";
import axios from "axios";
import Cookies from "js-cookie";

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
        })
        .catch((error) => {
            console.log(error);
            window.location.href = "/login.html";
        });
} else {
    console.log("Token does not exist");
    window.location.href = "/login.html";
}
