const newPasswordInput = document.getElementById("newPasswordInput");
const confirmPasswordInput = document.getElementById("confirmPasswordInput");
const resetSubmitBtn = document.getElementById("resetSubmitBtn");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

const token = new URLSearchParams(window.location.search).get("token");

resetSubmitBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const password1 = newPasswordInput.value;
    const password2 = confirmPasswordInput.value;

    let password = "";

    if (password1 === password2) {
        password = password2;

        const result = await newPassword(token, password);

        if (result) {
            console.log(result);
            errorMessage.textContent = "";
            successMessage.textContent = result.message || "Пароль успешно изменен";
            window.location.href = "/login.html";
        }
    } else {
        errorMessage.textContent = "Пароли не совпадают";
    }
});

async function newPassword(token, password) {
    try {
        const res = await fetch(`/users/reset-password`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
        });
        const data = await res.json();

        if (!res.ok) { throw new Error(data.error); }
        return data;
    } catch (err) {
        errorMessage.textContent = err.message;
    }
}
