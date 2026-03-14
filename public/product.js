const productPageCard = document.getElementById("productPageCard");
const productPageImage = document.getElementById('productPageImage');

const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productType = document.getElementById("productType");
const productDescription = document.getElementById("productDescription");
const productOwner = document.getElementById("productOwner");
const productCreatedAt = document.getElementById("productCreatedAt");
const errorMessage = document.getElementById("errorMessage");
const tokenInfo = document.getElementById("TokenIsAvailable");
const searchForm = document.getElementById("searchForm");
const search = document.getElementById("inputSearch");
const modalImage = document.getElementById("modalImage");

let editProduct = document.getElementById("editProduct");

const id = new URLSearchParams(window.location.search).get("id");

let state = { search: "" };

productPageCard.addEventListener("click", (e) => {
    const img = e.target.closest(".product-image");

    if (img) {
        modalImage.ariaHidden = false;
        modalImage.innerHTML = `
    <img class="product-image" data-full-image="${img.imageOptimizedUrl || img.imageUrl}" src="${img.dataset.fullImage || img.src}" alt="${img.alt}" onerror="this.onerror=null;this.src='/img/placeholder.png';">`
        console.log("modalImage: ", modalImage);
        console.log(img);
        return;
    }
})

modalImage.addEventListener("click", () => {
    modalImage.ariaHidden = true;
    return;
})


const user = getCurrentUser();

console.log('user:', user);

async function loadProduct(id) {
    try {
        const res = await authFetch(`/products/${id}`);
        const product = await res.json();
        let canEdit = false;
        let isAdmin = false;

        user && user.role === "admin" ? isAdmin = true : null;

        const ownerId = user ? user._id : null;
        let productOwner = product.owner._id;

        if (String(productOwner) === String(ownerId) || isAdmin === true) {
            canEdit = true;
            editProduct.hidden = false;
            editProduct.innerHTML = `Edit`;
            editProduct.href = `productForm.html?id=${product._id}`;
        }


        productPageImage.src = product.imageOptimizedUrl || product.imageUrl || '/img/placeholder.png';
        productPageImage.hidden = false;

        console.log(product);

        productName.innerHTML = product.name || "";
        productPrice.innerHTML = `Price: ${product.price ?? ""} ₽`;
        productDescription.innerHTML = `description: ${product.description || ""}`;
        productType.innerHTML = `type: ${product.type || ""}`;
        productOwner.innerHTML = `owner: ${product.owner.userName || product.owner.name || ""}`;
        productCreatedAt.innerHTML = `Created: ${new Date(product.createdAt).toLocaleDateString("ru-RU") || ""}`;

    } catch (err) {
        errorMessage.textContent = err.message;
    }
};

if (tokenInfo) {
    tokenInfo.textContent = ` ${user ? `user:${user.userName}` : ""}`;
} else {
    console.warn("tokenInfo element not found");
}


searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    state.search = search.value.trim();
    window.location.href = `/` + `?search=${state.search}`;
});


loadProduct(id);