console.log("productForm.js Loaded");

const backBtn = document.getElementById("backBtn");
const creatorName = document.getElementById("creatorName");
const errorMessage = document.getElementById("errorMessage");
const submitBtn = document.getElementById("submitBtn");
const productForm = document.getElementById("productForm");
const typeSelect = document.getElementById("category");
const nameInput = document.getElementById("productName");
const priceInput = document.getElementById("price");
const descriptionInput = document.getElementById("description");


const user = getCurrentUser();

const id = new URLSearchParams(window.location.search).get("id");
const isEdit = Boolean(id);

async function outputInCard(id) {
    try {
        const res = await authFetch(`/products/${id}`);
        const product = await res.json();


        nameInput.value = product.name || ""
        priceInput.value = product.price ?? ""
        descriptionInput.value = product.description || ""
        typeSelect.value = product.type || ""
    } catch (err) {
        errorMessage.textContent = err.message;
    }
}

outputInCard(id);

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

    if (isEdit) {
        try {
            const res = await authFetch(`/products/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Ошибка Редактирования");

            window.location.href = "/";
        } catch (err) {
            errorMessage.textContent = err.message;
        }
    } else {
        try {
            const res = await authFetch("/products", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Ошибка создания");

            window.location.href = "/";
        } catch (err) {
            errorMessage.textContent = err.message;
        }
    }
});


if (user) {
    creatorName.textContent = `Продукт от лица: ${user ? user.userName : "null"}`;
} else {
    console.warn("tokenInfo element not found");
}

backBtn.addEventListener("click", () => {
    window.location.href = "/"
});