console.log("login.js LOADED");

const submitBtn = document.getElementById("submitBtn");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const errorMessage = document.getElementById("errorMessage");


submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    errorMessage.textContent = "";

    try {
        const user = await login(emailInput.value, passwordInput.value);
        console.log("Logged in user:", user);
        window.location.href = "/";
    } catch (e) {
        console.error("Login error:", e);
        errorMessage.textContent = e.message;
    }
});