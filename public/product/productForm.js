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
const productImage = document.getElementById("productImage");
const modalImage = document.getElementById("modalImage");
const productGallery = document.querySelector(".product-form-gallery");
const productPageImage = document.getElementById("productPageImage");
const productFormFrame = document.querySelector(".product-form-preview");
const mainImageBtn = document.querySelector(".product-form-main-image-btn");
let selectedMainImagePublicId = "";
let selectedImagePublicId = 0;

const accessToken = localStorage.getItem("accessToken");
const isToken = Boolean(accessToken);
productFormFrame.hidden = true;

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
        productFormFrame.hidden = false;

        console.log(product);

        productImagePut.src = product.images[0].imageUrl || '/img/placeholder.png';

        for (let i = 0; i < product.images.length; i++) {
            const productThumb = document.createElement("div");
            productThumb.className = "product-gallery-thumb";

            if (i === 0) productThumb.classList.add("product-gallery-thumb-active");

            const productImg = document.createElement("img");
            productImg.src = product.images[i].imageOptimizedUrl;

            productThumb.appendChild(productImg);
            productGallery.appendChild(productThumb);


            productThumb.addEventListener("click", () => {
                const activeThumb = productGallery.querySelector(".product-gallery-thumb-active");
                if (activeThumb) activeThumb.classList.remove("product-gallery-thumb-active");
                productImagePut.src = product.images[i].imageUrl || '/img/placeholder.png';
                modalImage.src = product.images[i].imageUrl || '/img/placeholder.png';
                productThumb.classList.add("product-gallery-thumb-active");
                selectedImagePublicId = product.images[i].imagePublicId;
            });

        }

        productImagePut.hidden = false;

        nameInput.value = product.name || ""
        priceInput.value = product.price ?? ""
        descriptionInput.value = product.description || ""

        let findSelect = false;

        for (const select of typeSelect.options) {
            if (product.type === select.value) {
                findSelect = true;
            }
        }

        if (findSelect) {
            typeSelect.value = product.type
            otherCategoryContainer.hidden = true;
        } else {
            typeSelect.value = "customCategory";
            otherCategoryContainer.hidden = false;
            categoryInput.value = product.type;
        }
        mainImageBtn.addEventListener("click", () => {
            selectedMainImagePublicId = selectedImagePublicId;
            console.log(selectedMainImagePublicId);
        });
    } catch (err) {
        errorMessage.textContent = err.message;
    }
}

if (isId) {
    outputInCard(id);
} else {
    deleteBtn.hidden = true;
}




productImage.addEventListener("change", (e) => {
    const files = e.target.files;
    productGallery.innerHTML = "";
    for (const file of files) {
        const fileUrl = URL.createObjectURL(file);
        console.log(file);
        const productThumb = document.createElement("div");
        productThumb.className = "product-gallery-thumb";

        const productImg = document.createElement("img");
        productImg.src = fileUrl;

        productThumb.appendChild(productImg);
        productGallery.appendChild(productThumb);


        productThumb.addEventListener("click", () => {
            const activeThumb = productGallery.querySelector(".product-gallery-thumb-active");
            if (activeThumb) activeThumb.classList.remove("product-gallery-thumb-active");
            productImagePut.src = fileUrl || '/img/placeholder.png';
            modalImage.src = fileUrl || '/img/placeholder.png';
            productThumb.classList.add("product-gallery-thumb-active");
        });


        productImagePut.src = fileUrl || '/img/placeholder.png';
    }
    productImagePut.hidden = false;
});


productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessage.textContent = "";
    const categoryInputFix = categoryInput.value.trim()

    const formData = new FormData(productForm);
    formData.set("selectedMainImagePublicId", selectedMainImagePublicId);

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
