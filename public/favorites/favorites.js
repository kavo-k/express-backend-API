console.log("favorites.js loaded");
renderSharedHeader(document.getElementById("siteHeader"), {
  showSearch: false,
  showBack: true,
  backHref: "/",
  showFavorites: false,
  showCart: true,
  showProfile: true,
});

const favoritesItemsList = document.getElementById("favoritesItemsList");
const favoritesTotalItems = document.getElementById("favoritesTotalItems");
const openCatalogBtn = document.getElementById("openCatalogBtn");

const clearFavoritesBtn = document.getElementById("clearFavoritesBtn");
const deleteModal = document.getElementById("deleteModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmClearFavoritesBtn = document.getElementById("confirmClearFavoritesBtn");

async function initFavorites() {
  const dataFavorites = await loadFavorites();
  const dataCart = await loadCart();
  favoritesTotalItems.innerHTML = dataFavorites.favorites.items.length;
  renderProducts(dataFavorites.favorites.items, dataCart.cart.items);
}

function matchItems(itemFavorite, productsCart) {
  let foundItem = false;
  for (const productCart of productsCart) {
    if (productCart.product._id === itemFavorite.product._id) {
      foundItem = true;
      return productCart;
    }
  }
  return "";
}


async function renderProducts(productsFavorites, productsCart) {
  favoritesItemsList.innerHTML = "";

  if (productsFavorites.length === 0) {
    favoritesItemsList.innerHTML = '<p class="cart-items-list">Похоже, у вас еще нет товаров.</p>';
    return;
  }
  for (const item of productsFavorites) {
    if (!item.product) continue;
    const card = document.createElement("div");
    card.className = "cart-item-card";
    console.log(item);
    const foundItem = matchItems(item, productsCart)

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
    <p class="cart-item-price">${item.product.price} ₽</p>
    <div class="favorites-card-actions">
    <div class="favorites-purchase-panel">
    <button class="cart-action-btn product-add-btn favorites-cart-btn favorites-add-to-cart-btn" type="button">В корзину</button>
    
    <div class="product-quantity-card favorites-quantity-controls" hidden>
    <button class="product-qty-btn favorites-minus-btn" type="button" aria-label="Decrease quantity">-</button>
    <span class="product-qty-value favorites-quantity-value">${foundItem.quantity || ""}</span>
    <button class="product-qty-btn favorites-plus-btn" type="button" aria-label="Increase quantity">+</button>
    </div>
    </div>
    </div>
    <button class="delete-btn favorites-remove-btn" type="button">Убрать</button>
    </div>
    </div>
    `;

    const addToCartBtninRr = card.querySelector(".cart-action-btn");
    const quantityZoneinRr = card.querySelector(".product-quantity-card");

    if (foundItem.quantity > 0) {
      addToCartBtninRr.hidden = true;
      quantityZoneinRr.hidden = false;
    }

    card.dataset.productId = item.product._id;

    favoritesItemsList.appendChild(card);
  }
}


favoritesItemsList.addEventListener("click", async (e) => {
  const card = e.target.closest(".cart-item-card");
  const plusBtn = e.target.closest(".favorites-plus-btn");
  const minusBtn = e.target.closest(".favorites-minus-btn");
  const deleteBtn = e.target.closest(".favorites-remove-btn");
  const addToCartBtnTg = e.target.closest(".cart-action-btn");
  const quantityZoneTg = e.target.closest(".product-quantity-card");


  let id, quantityZone, cartLinkElement, cartCount;

  if (card) {
    id = card.dataset.productId;
    quantityZone = card.querySelector(".product-quantity-card");
    cartLinkElement = document.querySelector(".cart-link");
    cartCount = document.querySelector(".cart-count");
  }


  if (addToCartBtnTg) {
    await addToCart(id);
    addToCartBtnTg.hidden = true;
    quantityZone.hidden = false;
    initFavorites();
    updateCartCount(cartCount, cartLinkElement);
    return;
  }

  if (plusBtn) {
    await addToCart(id);
    initFavorites();
    updateCartCount(cartCount, cartLinkElement);
    return;
  }

  if (minusBtn) {
    await decreaseCartItem(id);
    initFavorites();
    updateCartCount(cartCount, cartLinkElement);
    return;
  }

  if (deleteBtn) {
    await removeFavoriteItem(id);
    initFavorites();
    return;
  }

  if (quantityZoneTg) {
    return;
  }

  if (card) {
    window.location.href = `/product.html?id=${id}`;
    return;
  }
})

clearFavoritesBtn.onclick = () => {
  deleteModal.classList.add("open");
};

cancelDeleteBtn.addEventListener("click", () => {
  deleteModal.classList.remove("open");
});


confirmClearFavoritesBtn.addEventListener("click", async () => {
  await removeFavoriteAllItems();
  initFavorites();
  deleteModal.classList.remove("open");
  return;
})


initFavorites();
