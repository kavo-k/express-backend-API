console.log("register.js LOADED");

const submitBtn = document.getElementById("submitBtn");
const userNameInput = document.getElementById("userNameInput");
const ageInput = document.getElementById("ageInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const confirmPasswordInput = document.getElementById("confirmPasswordInput");
const errorMessage = document.getElementById("errorMessage");


submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    errorMessage.textContent = "";

    console.log("Attempting registration with:", {
        userName: userNameInput.value,
        age: ageInput.value,
        email: emailInput.value,
        password: passwordInput.value,
        confirmPassword: confirmPasswordInput.value,
    });

    try {
        if (passwordInput.value !== confirmPasswordInput.value) {
            errorMessage.textContent = "Пароли не совпадают";
            return;
        }

        const payload = {
            userName: userNameInput.value.trim(),
            age: ageInput.value ? Number(ageInput.value) : undefined,
            email: emailInput.value.trim(),
            password: passwordInput.value,
        };

        const user = await register(payload.userName, payload.age, payload.email, payload.password);
        console.log("Registered user:", user);
        window.location.href = "/login.html";
    } catch (e) {
        console.error("Registration error:", e);
        errorMessage.textContent = e.message;
    }
});