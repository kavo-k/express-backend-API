console.log("products.js LOADED");

const productsList = document.getElementById("product-card");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const pageInfo = document.getElementById("pageInfo");
const search = document.getElementById("inputSearch");
const btnSearch = document.getElementById("btnSearch");
const sortSelect = document.getElementById("sortSelect");

const LIMIT = 2;
let state = { currentPage: 1, maxPage: 1, search: "", sort: "desc" };

function syncUrlWithState(mode = "replace") {
  const params = new URLSearchParams();
  params.set("page", String(state.currentPage));

  if (state.sort !== "desc") params.set("sort", state.sort);
  if (state.search) params.set("search", state.search);

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  if (mode === "push") {
    history.pushState(null, "", newUrl);
  } else {
    history.replaceState(null, "", newUrl);
  }
}

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
    card.innerHTML = `
      <h3>${product.name}</h3>
      <p>Price: ${product.price}</p>
      <p>Type: ${product.type}</p>
      <a href="/users/${product.owner && typeof product.owner === "object" ? product.owner._id : product.owner}">
  Owner: ${product.owner && typeof product.owner === "object" ? product.owner.name : "-"}
</a>
      <p>owner id: ${product.owner._id}</p>  
      <p>product id: ${product._id}</p>
    `;
    productsList.appendChild(card);
  }
}

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

async function loadProducts({ syncUrl = true, mode = "replace" } = {}) {
  try {
    const data = await getJson(
      `/products?search=${state.search}&limit=${LIMIT}&page=${state.currentPage}&sort=${state.sort}`
    );

    state.maxPage = Math.max(1, Math.ceil(data.total / LIMIT));

    const prevPage = state.currentPage;
    clampPage();
    if (state.currentPage !== prevPage) {
      if (syncUrl) syncUrlWithState("replace");
      return loadProducts({ syncUrl: false, mode });
    }

    pageInfo.textContent = state.currentPage;
    if (syncUrl) syncUrlWithState(mode);

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

search.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    state.search = search.value.trim();
    state.currentPage = 1;
    loadProducts({ syncUrl: true, mode: "push" });
  }
});

btnNext.onclick = () => {
  state.currentPage = Math.min(state.currentPage + 1, state.maxPage);
  loadProducts({ syncUrl: true, mode: "push" });
};

btnPrev.onclick = () => {
  state.currentPage = Math.max(state.currentPage - 1, 1);
  loadProducts({ syncUrl: true, mode: "push" });
};

window.addEventListener("popstate", () => {
  readStateFromUrl();
  loadProducts({ syncUrl: false });
});

readStateFromUrl();
loadProducts({ syncUrl: false });