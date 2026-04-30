console.log("products.js LOADED");

let state = { currentPage: 1, maxPage: 1, search: "", type: "", sort: "desc" };

renderSharedHeader(document.getElementById("siteHeader"), {
  searchPlaceholder: "Поиск товаров...",
  showSearch: true,
  showBack: false,
  showFavorites: true,
  showCart: true,
  showProfile: true,
  onSearchSubmit: function (searchValue) {
    state.search = searchValue;
    state.currentPage = 1;
    console.log(state);
    loadProducts();
  }
});


const productsList = document.getElementById("productsConteiner");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const pageInfo = document.getElementById("pageInfo");
const search = document.getElementById("inputSearch");
const sortSelect = document.getElementById("sortSelect");
const catalogCategories = document.querySelector(".catalog-categories");
const categoryChip = document.querySelectorAll(".category-chip");

const user = getCurrentUser();

const LIMIT = 8;




function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const page = parseInt(params.get("page"), 10);

  state.search = (params.get("search") || "").trim();
  state.type = (params.get("type") || "").trim();
  state.sort = params.get("sort") || "desc";
  state.currentPage = Number.isFinite(page) && page > 0 ? page : 1;

  search.value = state.search;
  for (const category of categoryChip) {
    category.classList.remove("category-chip-active");
    if (category.value === state.type) {
      category.classList.add("category-chip-active");
    }
  }
  sortSelect.value = state.sort;
}

function syncUrlWithState() {
  const params = new URLSearchParams(window.location.search);

  params.set("type", state.type);
  params.set("page", state.currentPage);
  params.set("sort", state.sort);
  params.set("search", state.search);

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  history.replaceState(state.type, "", newUrl);
}

function clampPage() {
  if (state.currentPage < 1) state.currentPage = 1;
  if (state.currentPage > state.maxPage) state.currentPage = state.maxPage;
}

function updatePageButtons() {
  btnPrev.disabled = state.currentPage === 1;
  btnNext.disabled = state.currentPage === state.maxPage;
}

function matchFavorites(itemFavorite, productsFavorites) {
  let foundItem = false;
  for (const productfavorite of productsFavorites) {
    if (productfavorite.product._id === itemFavorite._id) {
      foundItem = true;
      return productfavorite;
    }
  }
  return "";
}


function renderProducts(products, dataFavorites) {
  productsList.innerHTML = "";

  if (products.length === 0) {
    productsList.innerHTML = '<p class="empty-state">Такого у нас нет :(</p>';
    return;
  }

  for (const product of products) {
    const card = document.createElement("div");
    card.className = "product-card";

    console.log(product, dataFavorites);

    const foundItem = matchFavorites(product, dataFavorites)


    const ownerId = user ? user._id : null;

    const productOwnerId =
      product.owner && typeof product.owner === "object"
        ? product.owner._id
        : product.owner;

    const canEdit =
      ownerId && productOwnerId && String(ownerId) === String(productOwnerId);

    if (canEdit) {
      card.classList.add("owner-product");
    }


    card.innerHTML = `
    <div class="product-card-media">
    <span class="product-card-badge">${product.type ? product.type : "лот"}</span>
    <button class="favorite-toggle-btn" type="button" aria-label="Добавить в избранное">
    <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m12 21-1.45-1.32C5.4 15.02 2 11.9 2 8.09 2 5 4.42 2.5 7.5 2.5c1.74 0 3.41.81 4.5 2.09A6 6 0 0 1 16.5 2.5C19.58 2.5 22 5 22 8.09c0 3.81-3.4 6.93-8.55 11.6z"></path>
    </svg>
    </button>
    <img class="product-image" src="${product.imageOptimizedUrl || product.images?.[0]?.imageUrl || '/img/placeholder.png'}" alt="${product.name}" onerror="this.onerror=null;this.src='/img/placeholder.png';">
    </div>
    <div class="product-card-copy">
    <div class="product-card-topline">
    <h3>${product.name}</h3>
    </div>
    <div class="product-card-rating">
    <span class="product-card-star">★★★★★</span>
    <span class="product-card-rating-value">4.2</span>
    <span class="product-card-rating-count">(67)</span>
    </div>
    <p class="product-card-price">${product.price}₽</p>
    </div>
    `;
    const favoriteToggleBtn = card.querySelector(".favorite-toggle-btn");

    if (foundItem) {
      favoriteToggleBtn.classList.add("is-active");
    } else {
      favoriteToggleBtn.classList.remove("is-active")
    }

    card.dataset.productId = product._id;

    productsList.appendChild(card);
  }
}


catalogCategories.addEventListener("click", (e) => {
  const categoryActive = catalogCategories.querySelectorAll(".category-chip-active");
  let selectCategory = e.target.closest(".category-chip");
  if (!selectCategory) return;

  for (const category of categoryActive) {
    category.classList.remove("category-chip-active");
  }
  state.currentPage = 1;
  selectCategory.classList.add("category-chip-active");
  state.type = selectCategory.value;
  loadProducts();
});



productsList.addEventListener("click", async (e) => {
  const favoriteBtn = e.target.closest(".favorite-toggle-btn");
  const productCard = e.target.closest(".product-card");

  if (favoriteBtn) {
    const isActive = favoriteBtn.classList.contains("is-active")

    const id = productCard.dataset.productId;



    if (isActive) {
      await removeFavoriteItem(id);
    } else {
      await addToFavorite(id);
    }
    loadProducts();
    return
  }

  if (productCard) {
    const id = productCard.dataset.productId;
    window.location.href = `/product.html?id=${id}`;
    return;
  }

})

function print(data) {
  productsList.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

async function getJson(url) {
  const res = await fetch(url);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return data;
}

async function loadProducts() {
  syncUrlWithState();
  try {
    const data = await getJson(
      `/products?search=${state.search}&type=${state.type}&limit=${LIMIT}&page=${state.currentPage}&sort=${state.sort}`
    );

    state.maxPage = Math.max(1, Math.ceil(data.total / LIMIT));
    clampPage();
    pageInfo.textContent = state.currentPage;

    const favoritesCount = document.querySelector(".favorites-count");
    const favoritesLinkElement = document.querySelector(".favorites-link");

    await updateFavoriteCount(favoritesCount, favoritesLinkElement);

    let favoritesItems = []
    const dataFavorites = await loadFavorites();
    favoritesItems = dataFavorites.favorites.items;

    renderProducts(data.products, favoritesItems);
    updatePageButtons();
  } catch (e) {
    print({ error: e.message });
  }
}

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  state.currentPage = 1;
  loadProducts();
});

btnNext.onclick = () => {
  state.currentPage = Math.min(state.currentPage + 1, state.maxPage);
  loadProducts();
};

btnPrev.onclick = () => {
  state.currentPage = Math.max(state.currentPage - 1, 1);
  loadProducts();
};

readStateFromUrl();
loadProducts();
