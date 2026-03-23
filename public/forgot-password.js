const submitBtn = document.getElementById("submitBtn");
const emailInput = document.getElementById("emailInput");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");


const user = getCurrentUser();


submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    errorMessage.textContent = "";
    try {
        const email = emailInput.value.trim();
        const user = await forgotPassword(email);
        console.log("forgot password user:", user);
        successMessage.textContent = `Письмо для сброса пароля отправлено`;
        if (user.resetToken) {
            window.location.href = `/reset-password.html?token=${user.resetToken}`;
        }
    } catch (e) {
        console.error("forgot password error:", e);
        errorMessage.textContent = e.message;
    }
});