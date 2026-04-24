renderSharedHeader(document.getElementById("siteHeader"), {
    searchPlaceholder: "Поиск товаров...",
    showSearch: true,
    showBack: false,
    showFavorites: true,
    showCart: true,
    showProfile: true,
});

const productPageCard = document.getElementById("productPageCard");
const productPageImage = document.getElementById('productPageImage');
const productPageFullImage = document.getElementById(`productPageFullImage`);

const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productType = document.getElementById("productType");
const productDescription = document.getElementById("productDescription");
const productOwner = document.getElementById("productOwner");
const productCreatedAt = document.getElementById("productCreatedAt");
const errorMessage = document.getElementById("errorMessage");
const tokenInfo = document.getElementById("TokenIsAvailable");
const search = document.getElementById("inputSearch");
const modalImage = document.getElementById("modalImage");
const productGallery = document.querySelector(".product-gallery-strip");

const productPageActions = document.getElementById("productPageActions");
const addToCartBtn = document.getElementById("addToCartBtn");
const productPlusBtn = document.getElementById("productPlusBtn");
const productMinusBtn = document.getElementById("productMinusBtn");
const productCartQuantity = document.getElementById("productCartQuantity");
const productQuantityControls = document.getElementById("productQuantityControls");
productQuantityControls.hidden = true;

let editProduct = document.getElementById("editProduct");

const id = new URLSearchParams(window.location.search).get("id");


async function syncCartControls(id) {
    const data = await loadCart()
    let itemFound = false;

    console.log(data);

    for (let i = 0; i < data.cart.items.length; i++) {
        if (data.cart.items[i].product._id === id) {
            itemFound = true;
            addToCartBtn.hidden = true;
            productQuantityControls.hidden = false;
            productCartQuantity.innerHTML = data.cart.items[i].quantity;
            console.log(data.cart.items[i].product);
            productPlusBtn.disabled = data.cart.items[i].quantity >= 99;
        }
    }

    if (!itemFound) {
        addToCartBtn.hidden = false;
        productQuantityControls.hidden = true;
    }
}

productPageImage.addEventListener("click", (e) => {
    const img = e.target.closest(".product-image");

    if (img) {
        return modalImage.ariaHidden = false;
    }
})

productPageActions.addEventListener("click", async (e) => {
    const addToCartBtnTg = e.target.closest(".cart-action-btn");
    const productMinusBtnTg = e.target.closest("#productMinusBtn");
    const productPlusBtnTg = e.target.closest("#productPlusBtn");
    let result = null;

    if (productPlusBtnTg) {
        result = await addToCart(id);
    }

    if (productMinusBtnTg) {
        result = await decreaseCartItem(id);
    }

    if (addToCartBtnTg) {
        addToCartBtn.hidden = true;
        productQuantityControls.hidden = false;
        result = await addToCart(id);
    }

    const cartCount = document.querySelector(".cart-count");
    const cartLinkElement = document.querySelector(".cart-link");

    updateCartCount(cartCount, cartLinkElement);
    await syncCartControls(id);
    return result
});

modalImage.addEventListener("click", () => {
    modalImage.ariaHidden = true;
    return;
})


const user = getCurrentUser();

async function loadProduct(id) {
    try {
        const res = await authFetch(`/products/${id}`);
        const product = await res.json();
        let canEdit = false;
        let isAdmin = false;

        user && user.role === "admin" ? isAdmin = true : null;

        const ownerId = user ? user._id : null;
        let owner = product.owner._id;

        if (String(owner) === String(ownerId) || isAdmin === true) {
            canEdit = true;
            editProduct.hidden = false;
            editProduct.innerHTML = `Edit`;
            editProduct.href = `productForm.html?id=${product._id}`;
        }

        console.log(product);
        productPageImage.src = product.images[0].imageUrl || '/img/placeholder.png';
        productPageFullImage.src = product.images[0].imageUrl || '/img/placeholder.png';
        productPageFullImage.hidden = false;
        productPageImage.hidden = false;

        productName.innerHTML = product.name || "";
        productPrice.innerHTML = `Price: ${product.price ?? ""} ₽`;
        productDescription.innerHTML = `description: ${product.description || ""}`;
        productType.innerHTML = `type: ${product.type || ""}`;
        productOwner.innerHTML = `owner: ${product.owner.userName || product.owner.name || ""}`;
        productCreatedAt.innerHTML = `Created: ${new Date(product.createdAt).toLocaleDateString("ru-RU") || ""}`;

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
                productPageImage.src = product.images[i].imageUrl || '/img/placeholder.png';
                productPageFullImage.src = product.images[i].imageUrl || '/img/placeholder.png';
                productThumb.classList.add("product-gallery-thumb-active");
            });
        }
    } catch (err) {
        errorMessage.textContent = err.message;
    }
};


loadProduct(id);
syncCartControls(id);