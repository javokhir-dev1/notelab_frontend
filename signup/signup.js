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

    if (loginValue.length > 5 && passwordValue.length > 5) {
        const { data, error } = await request("userauth/register", "POST", "", { username: loginValue, password: passwordValue })
        if (!error) {
            window.location.href = "../login"
        } else {
            showToast({ text: error, type: "error", duration: 4000 });
        }
        console.log(data)
    } else {
        showToast({ text: "Login va password kamida 6ta belgidan iborat bo'lishi kerak!", type: "error", duration: 4000 });
    }
})