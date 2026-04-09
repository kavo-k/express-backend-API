console.log("products.js LOADED");

renderSharedHeader(document.getElementById("siteHeader"), {
  searchPlaceholder: "Поиск товаров...",
  showSearch: true,
  showBack: false,
  showFavorites: true,
  showCart: true,
  showProfile: true,
});


const productsList = document.getElementById("productsConteiner");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const pageInfo = document.getElementById("pageInfo");
const search = document.getElementById("inputSearch");
const sortSelect = document.getElementById("sortSelect");
const profileBtn = document.getElementById("profileBtn");
const modalImage = document.getElementById("modalImage");

const user = getCurrentUser();

const LIMIT = 8;
let state = { currentPage: 1, maxPage: 1, search: "", sort: "desc" };


function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const page = parseInt(params.get("page"), 10);

  state.search = (params.get("search") || "").trim();
  state.sort = params.get("sort") || "desc";
  state.currentPage = Number.isFinite(page) && page > 0 ? page : 1;

  search.value = state.search;
  sortSelect.value = state.sort;
}

function clampPage() {
  if (state.currentPage < 1) state.currentPage = 1;
  if (state.currentPage > state.maxPage) state.currentPage = state.maxPage;
}

function updatePageButtons() {
  btnPrev.disabled = state.currentPage === 1;
  btnNext.disabled = state.currentPage === state.maxPage;
}

function renderProducts(products) {
  productsList.innerHTML = "";

  if (products.length === 0) {
    productsList.innerHTML = '<p class="empty-state">Такого у нас нет :(</p>';
    return;
  }

  for (const product of products) {
    const card = document.createElement("div");
    card.className = "product-card";


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

    console.log(product);


    card.innerHTML = `
      <div class="product-card-media">
        <span class="product-card-badge">${product.type ? product.type : "лот"}</span>
        <img class="product-image" data-full-image="${product.imageOptimizedUrl || product.imageUrl}" src="${product.imageOptimizedUrl || product.imageUrl || '/img/placeholder.png'}" alt="${product.name}" onerror="this.onerror=null;this.src='/img/placeholder.png';">
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

    card.dataset.productId = product._id;

    productsList.appendChild(card);
  }
}

productsList.addEventListener("click", (e) => {
  const productCard = e.target.closest(".product-card");

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
  try {
    const data = await getJson(
      `/products?search=${state.search}&limit=${LIMIT}&page=${state.currentPage}&sort=${state.sort}`
    );

    state.maxPage = Math.max(1, Math.ceil(data.total / LIMIT));
    clampPage();

    pageInfo.textContent = state.currentPage;

    renderProducts(data.products);
    updatePageButtons();
  } catch (e) {
    print({ error: e.message });
  }
}

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  state.currentPage = 1;
  loadProducts({ syncUrl: true, mode: "push" });
});

btnNext.onclick = () => {
  state.currentPage = Math.min(state.currentPage + 1, state.maxPage);
  loadProducts({ syncUrl: true, mode: "push" });
};

btnPrev.onclick = () => {
  state.currentPage = Math.max(state.currentPage - 1, 1);
  loadProducts({ syncUrl: true, mode: "push" });
};

readStateFromUrl();
loadProducts({ syncUrl: false });
