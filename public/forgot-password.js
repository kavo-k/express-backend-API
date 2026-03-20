const submitBtn = document.getElementById("submitBtn");
const emailInput = document.getElementById("emailInput");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    errorMessage.textContent = "";
    successMessage.textContent = "";

    try {
        const email = emailInput.value.trim();
        const result = await forgotPassword(email);
        console.log("forgot password result:", result);
        successMessage.textContent = result.message || "Письмо для сброса пароля отправлено";

        if (result.resetToken) {
            window.location.href = `/reset-password.html?token=${result.resetToken}`;
        }
    } catch (e) {
        console.error("forgot password error:", e);
        errorMessage.textContent = e.message;
    }
});
