console.log("productForm.js Loaded");

const backBtn = document.getElementById("backBtn");
const creatorName = document.getElementById("creatorName");
const errorMessage = document.getElementById("errorMessage");
const submitBtn = document.getElementById("submitBtn");
const productForm = document.getElementById("productForm");
const typeSelect = document.getElementById("category");
const otherCategoryContainer = document.getElementById("otherCategoryContainer");

const categoryInput = document.getElementById("customCategory");
const nameInput = document.getElementById("productName");
const priceInput = document.getElementById("price");
const descriptionInput = document.getElementById("description");
const deleteBtn = document.getElementById("deleteBtn");
const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const deleteModalText = document.getElementById("deleteModalText");
const productImagePut = document.getElementById("productImagePut");
const modalImage = document.getElementById("modalImage");

const accessToken = localStorage.getItem("accessToken");
const isToken = Boolean(accessToken);

if (!isToken) {
    window.location.href = "/login.html";
}


const user = getCurrentUser();

const id = new URLSearchParams(window.location.search).get("id");
const isId = Boolean(id);

async function outputInCard(id) {
    try {
        const res = await authFetch(`/products/${id}`);
        const product = await res.json();

        productImagePut.src = product.imageOptimizedUrl || product.imageUrl || '/img/placeholder.png';
        productImagePut.hidden = false;

        nameInput.value = product.name || ""
        priceInput.value = product.price ?? ""
        descriptionInput.value = product.description || ""
        typeSelect.value = product.type || ""
        categoryInput.value = product.type || ""
    } catch (err) {
        errorMessage.textContent = err.message;
    }
}

if (isId) {
    outputInCard(id);
} else {
    deleteBtn.hidden = true;
}



productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessage.textContent = "";
    const categoryInputFix = categoryInput.value.trim()

    const formData = new FormData(productForm);

    if (typeSelect.value === "customCategory") {
        if (categoryInputFix) {
            formData.set("type", categoryInputFix);
            formData.delete("otherCategory");
        } else {
            errorMessage.textContent = "необходимо ввести свою категорию";
            return;
        }
    }
    console.log("formData:", Array.from(formData.entries()));


    if (isId) {
        try {
            const res = await authFetch(`/products/${id}`, {
                method: "PUT",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Ошибка Редактирования");

            window.location.href = "/";
            return;
        } catch (err) {
            errorMessage.textContent = err.message;
            return;
        }
    } else {
        try {
            const res = await authFetch(`/products`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Ошибка создания");

            window.location.href = "/";
            return;
        } catch (err) {
            errorMessage.textContent = err.message;
            return;
        }
    }
});


typeSelect.addEventListener("change", (e) => {
    if (typeSelect.value === "customCategory") {
        otherCategoryContainer.hidden = false;
    } else {
        otherCategoryContainer.hidden = true;
    }
});


productForm.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-product-btn");
    const img = e.target.closest(".product-image");

    if (img) {
        modalImage.ariaHidden = false;
        modalImage.innerHTML = `
    <img class="product-image" data-full-image="${img.imageOptimizedUrl || img.imageUrl}" src="${img.dataset.fullImage || img.src}" alt="${img.alt}" onerror="this.onerror=null;this.src='/img/placeholder.png';">`
        console.log("modalImage: ", modalImage);
    }

    modalImage.addEventListener("click", () => {
        modalImage.ariaHidden = true;
    })

    if (editBtn) {
        const id = editBtn.dataset.productId;
        window.location.href = `/productForm.html?id=${id}`;
        return;
    }
})

deleteBtn.onclick = () => {
    deleteModal.classList.add("open");
};

cancelDeleteBtn.addEventListener("click", () => {
    deleteModal.classList.remove("open");
});

confirmDeleteBtn.addEventListener("click", async () => {
    try {
        const res = await authFetch(`/products/${id}`, {
            method: "DELETE",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ошибка Удаления");
        deleteModalText.textContent = `Успешно удалено`;
        window.location.href = "/";
        return;
    } catch (err) {
        errorMessage.textContent = err.message;
        return;
    }
});

console.log(user);

if (user) {
    creatorName.textContent = `Продукт от лица: ${user ? user.userName || user.name : "null"}`;
} else {
    console.warn("tokenInfo element not found");
}

backBtn.addEventListener("click", () => {
    window.location.href = "/"
});