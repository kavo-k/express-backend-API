console.log("productForm.js Loaded");

const backBtn = document.getElementById("backBtn");
const creatorName = document.getElementById("creatorName");
const errorMessage = document.getElementById("errorMessage");
const submitBtn = document.getElementById("submitBtn");
const productForm = document.getElementById("productForm");
const category = document.getElementById("category");
const productName = document.getElementById("productName");

const user = getCurrentUser();

productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(productForm);

    const payload = {
        name: formData.get("name")?.trim(),
        type: formData.get("type")?.trim(),
        description: formData.get("description")?.trim(),
        price: Number(formData.get("price")),
        valid: formData.get("valid") || undefined
    };

    console.log("payload", payload);


try {
    const res = await authFetch("/products", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Ошибка создания");

    window.location.href = "/profile.html";
} catch (err) {
    errorMessage.textContent = err.message;
}
});


if (user) {
    creatorName.textContent = `создать продукт от лица: ${user ? user.userName : "null"}`;
} else {
    console.warn("tokenInfo element not found");
}

backBtn.addEventListener("click", () => {
    window.location.href = "/"
});