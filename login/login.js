import { checkToken, request, showToast } from "../functions.js"

const login = document.getElementById("login_input")
const password = document.getElementById("password_input")
const button = document.getElementById("form_btn")

document.addEventListener("DOMContentLoaded", async () => {
    const success = await checkToken()
    if (success) {
        window.location.href = "/"
    }
})


button.addEventListener("click", async () => {
    const loginValue = login.value
    const passwordValue = password.value

    if (loginValue.length > 3 && passwordValue.length > 3) {
        const { data, error } = await request("userauth/login", "POST", "", { username: loginValue, password: passwordValue })
        if (!error) {
            localStorage.setItem("token", data.access_token)
            localStorage.setItem("user_id", data.userId)
            window.location.href = "/"
        } else {
            showToast({ text: error, type: "error", duration: 4000 });
        }

        console.log(data)
    } else {
        showToast({ text: "Login va password kamida 4ta belgidan iborat bo'lishi kerak!", type: "error", duration: 4000 });
    }
})