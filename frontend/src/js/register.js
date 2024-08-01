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
            window.location.href = "/dashboard.html";
        })
        .catch((error) => {
            console.log(error);
            // window.location.href = "/login.html";
        });
}
