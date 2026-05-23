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

const reviewRating = document.getElementById("reviewRating");
const reviewText = document.getElementById("reviewText");
const productReviewForm = document.querySelector(".product-review-form");
const productReviewSubmit = document.querySelector(".product-review-submit");
const productReviewsList = document.querySelector(".product-reviews-list");


let editProduct = document.getElementById("editProduct");

const id = new URLSearchParams(window.location.search).get("id");


async function syncCartControls(id) {
    try {
        const data = await loadCart()
        let itemFound = false;


        for (let i = 0; i < data.cart.items.length; i++) {
            if (data.cart.items[i].product._id === id) {
                itemFound = true;
                addToCartBtn.hidden = true;
                productQuantityControls.hidden = false;
                productCartQuantity.innerHTML = data.cart.items[i].quantity;
            }
        }

        if (!itemFound) {
            addToCartBtn.hidden = false;
            productQuantityControls.hidden = true;
        }
    } finally {
        const quantity = Number(productCartQuantity.textContent || 0);
        productPlusBtn.disabled = quantity >= 99;
        productMinusBtn.disabled = false;
    }
}

productPageImage.addEventListener("click", (e) => {
    const img = e.target.closest(".product-image");

    if (img) {
        return modalImage.ariaHidden = false;
    }
})


productReviewSubmit.addEventListener("click", async (e) => {
    e.preventDefault();
    const rating = reviewRating.value;
    const text = reviewText.value;

    try {
        await postReview(id, text, rating)
        loadReviews(id);
        return;
    } catch (err) {
        errorMessage.textContent = err.message;
        return;
    }

});


productPageActions.addEventListener("click", async (e) => {
    const addToCartBtnTg = e.target.closest(".cart-action-btn");
    const productMinusBtnTg = e.target.closest("#productMinusBtn");
    const productPlusBtnTg = e.target.closest("#productPlusBtn");
    let result = null;

    if (productPlusBtnTg) {
        productPlusBtn.disabled = true;
        productMinusBtn.disabled = true;
        result = await addToCart(id);
    }

    if (productMinusBtnTg) {
        productPlusBtn.disabled = true;
        productMinusBtn.disabled = true;
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

async function loadReviews(id) {
    try {
        const productReviewsCount = document.querySelector(".product-reviews-count");
        const productReviewScore = document.querySelector(".product-reviews-score");
        const productReviewsStars = document.querySelector(".product-reviews-stars");

        const productRaitingCount = document.querySelector(".product-rating-count");
        const productRaitingScore = document.querySelector(".product-rating-score");
        const productRaitingStars = document.querySelector(".product-rating-stars");

        productReviewsList.innerHTML = "";
        const reviews = await getReviews(id);
        const reviewsAllCount = reviews.reviews.length;
        let reviewsAllStars = 0;
        let averageReview = 0;

        productReviewsCount.textContent = `(${reviewsAllCount}) отзывов`;
        productRaitingCount.textContent = `(${reviewsAllCount}) отзывов`;

        console.log(user);
        for (const review of reviews.reviews) {
            const reviewCard = document.createElement("article");
            reviewCard.className = "product-review-card";

            const rating = Number(review.rating);
            const fullStars = "★".repeat(rating);
            const emptyStars = "☆".repeat(5 - rating);
            const stars = fullStars + emptyStars;
            const reviewerName = review.user.userName || review.user.name || "Пользователь";
            const reviewerInitial = reviewerName.trim()[0] || "?";
            const reviewerAvatar = review.user.avatarUrl || "";
            const reviewCreatedAt = new Date(review.createdAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long"
            });
            console.log(review)

            const canEdit = review.user._id === user._id ? true : false;

            if (canEdit) {
                reviewCard.classList.add("owner-product");
            }

            reviewCard.innerHTML = `
            <div class="product-review-card-top">
                <div class="product-review-user">
                    <div class="product-review-avatar">
                    ${reviewerAvatar
                    ? `<img src="${reviewerAvatar}" alt="${reviewerName}">`
                    : `<span>${reviewerInitial.toUpperCase()}</span>`}
                    </div>
                    <strong>${reviewerName}</strong>
                    ${canEdit ? `<span class="product-review-owner-badge">ваш отзыв</span>` : ``}
                </div>
                <div class="product-review-meta">
                    <span class="product-review-created">${reviewCreatedAt}</span>
                    <span class="product-review-stars">${stars}</span>
                    ${canEdit ? `
                    <div class="product-review-actions">
                        <button class="product-review-action-btn product-review-edit-btn" type="button">Изменить</button>
                    </div>` : ``}
                </div>
            </div>
            <div class="product-review-body">
                <p class="product-review-text">${review.text}</p>
                <div class="product-review-edit-form" hidden>
                    <textarea class="product-review-edit-textarea">${review.text}</textarea>
                    <div class="product-review-edit-actions">
                        <button class="product-review-save-btn" type="button">Сохранить</button>
                        <button class="product-review-cancel-btn" type="button">Отмена</button>
                    </div>
                </div>
            </div>`;

            reviewCard.dataset.reviewId = review._id;

            productReviewsList.appendChild(reviewCard);
            reviewsAllStars += review.rating;
            reviewCard.addEventListener("click", (e) => {
                const editBtn = e.target.closest(".product-review-edit-btn");
                const saveBtn = e.target.closest(".product-review-save-btn");
                const cancelBtn = e.target.closest(".product-review-cancel-btn");

                const productReviewEditBtn = reviewCard.querySelector(".product-review-edit-btn");
                const productReviewEditForm = reviewCard.querySelector(".product-review-edit-form");
                const productReviewText = reviewCard.querySelector(".product-review-text");

                if (editBtn) {
                    productReviewEditForm.hidden = false;
                    productReviewText.hidden = true;
                    productReviewEditBtn.hidden = true;
                }

                if (cancelBtn) {
                    productReviewEditForm.hidden = true;
                    productReviewText.hidden = false;
                    productReviewEditBtn.hidden = false;
                }

                if (saveBtn) {
                    productReviewEditForm.hidden = true;
                    productReviewText.hidden = false;
                    productReviewEditBtn.hidden = false;
                }
            })

        }


        if (reviewsAllCount > 0) {
            averageReview = (reviewsAllStars / reviewsAllCount);
        }

        productReviewScore.textContent = `${averageReview.toFixed(1)}`;
        productRaitingScore.textContent = `${averageReview.toFixed(1)}`;

        const fullStars = "★".repeat(Math.round(averageReview));
        const emptyStars = "☆".repeat(5 - Math.round(averageReview));
        const stars = fullStars + emptyStars;
        productReviewsStars.textContent = `${stars}`;
        productRaitingStars.textContent = `${stars}`;

    } catch (err) {
        errorMessage.textContent = err.message;
    }
};

loadProduct(id);
syncCartControls(id);
loadReviews(id);
