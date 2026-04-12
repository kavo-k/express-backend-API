console.log("cart.js loaded");

renderSharedHeader(document.getElementById("siteHeader"), {
  showSearch: false,
  showBack: true,
  backHref: "/",
  showFavorites: false,
  showCart: false,
  showProfile: true
});

const cartItemsList = document.getElementById("cartItemsList");
const cartTotalItems = document.getElementById("cartTotalItems");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartTotalPrice = document.getElementById("cartTotalPrice");
const clearCartBtn = document.getElementById("clearCartBtn");
const deleteModal = document.getElementById("deleteModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmClearCartBtn = document.getElementById("confirmClearCartBtn");

async function initCart() {
  const data = await loadCart();
  console.log(data);
  cartTotalItems.innerHTML = data.totalItems;
  cartSubtotal.innerHTML = `${data.totalPrice} ₽`;
  cartTotalPrice.innerHTML = `${data.totalPrice} ₽`;
  renderProducts(data.cart.items);
}

async function renderProducts(products) {
  cartItemsList.innerHTML = "";

  if (products.length === 0) {
    cartItemsList.innerHTML = '<p class="cart-items-list">Похоже, у вас еще нет товаров.</p>';
    return;
  }

  for (const item of products) {
    if (!item.product) continue;
    const card = document.createElement("div");
    card.className = "cart-item-card";
    console.log(item);

    card.innerHTML = `
    <div class="cart-item-image">
    <img data-full-image="${item.product.imageOptimizedUrl || item.product.imageUrl}" src="${item.product.imageOptimizedUrl || item.product.imageUrl || '/img/placeholder.png'}" alt="${item.product.name}" onerror="this.onerror=null;this.src='/img/placeholder.png';">
    </div>
    <div class="cart-item-content">
    <div class="cart-item-copy">
    <h3>${item.product.name}</h3>
    <p class="cart-item-meta">${item.product.description || "-"}</p>
    </div>
    <div class="cart-item-controls">
    <div class="cart-quantity">
    <button class="minusBtn" type="button">-</button>
    <span>${item.quantity}</span>
    <button class="plusBtn" type="button">+</button>
    </div>
    <p class="cart-item-price">${item.product.price} ₽</p>
    <button class="delete-btn" type="button">Remove</button>
    </div>
    </div>
    `;

    const minusBtn = card.querySelector(".minusBtn");
    const plusBtn = card.querySelector(".plusBtn");
    const deleteBtn = card.querySelector(".delete-btn");

    plusBtn.dataset.productId = item.product._id;
    minusBtn.dataset.productId = item.product._id;
    deleteBtn.dataset.productId = item.product._id;
    card.dataset.productId = item.product._id;

    plusBtn.disabled = item.quantity >= 99;
    cartItemsList.appendChild(card);
  }
}


cartItemsList.addEventListener("click", async (e) => {
  const productCard = e.target.closest(".cart-item-card");
  const plusBtn = e.target.closest(".plusBtn");
  const minusBtn = e.target.closest(".minusBtn");
  const deleteBtn = e.target.closest(".delete-btn")
  const quantityZone = e.target.closest(".cart-quantity");

  if (plusBtn) {
    const id = plusBtn.dataset.productId;
    const result = await addToCart(id);
    initCart();
    return result;
  }

  if (minusBtn) {
    const id = minusBtn.dataset.productId;
    const result = await decreaseCartItem(id);
    initCart();
    return result;
  }

  if (quantityZone) { return; }

  if (deleteBtn) {
    const id = deleteBtn.dataset.productId;
    const result = await removeCartItem(id);
    initCart();
    return result;
  }

  if (productCard) {
    const id = productCard.dataset.productId;
    window.location.href = `/product.html?id=${id}`;
    return;
  }
})


clearCartBtn.onclick = () => {
  deleteModal.classList.add("open");
};

cancelDeleteBtn.addEventListener("click", () => {
  deleteModal.classList.remove("open");
});


confirmClearCartBtn.addEventListener("click", async () => {
  const result = await removeCartAllItems();
  initCart();
  deleteModal.classList.remove("open");
  return result;
})


initCart();