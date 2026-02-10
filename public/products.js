console.log("products.js LOADED");
const productsList = document.getElementById("product-card");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const LIMIT = 2;
const pageInfo = document.getElementById("pageInfo");
const search = document.getElementById("inputSearch");
const btnSearch = document.getElementById("btnSearch");
const sortSelect = document.getElementById("sortSelect");


let state = { currentPage: 1, maxPage: 1, search: "", sort: "desc" };


function syncStateWithUrl() {
  const params = new URLSearchParams();

  params.set("page", String(state.currentPage));

  if (state.sort !== "desc") params.set("sort", state.sort);

  if (state.search) params.set("search", state.search);


  history.pushState(null, "", `?${params.toString()}`);
}


async function getJson(url) {
  const res = await fetch(url);
  const data = await res.json().catch(() => null);
  
  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return data;
}

readStateFromUrl();

loadProducts();

window.addEventListener("popstate", () => {
  readStateFromUrl();
  search.value = state.search;
  sortSelect.value = state.sort;
  pageInfo.textContent = state.currentPage;
  loadProducts();
});

sortSelect.addEventListener("change", (e) => {
  state.sort = sortSelect.value;
  state.currentPage = 1;
  loadProducts();
});

function updatePageButtons() {
  btnPrev.disabled = state.currentPage === 1;
  
  btnNext.disabled = state.currentPage === state.maxPage;
}

search.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    state.search = search.value.trim();
    state.currentPage = 1;
    loadProducts();
  }
});

btnNext.onclick = () => {
  state.currentPage = Math.min(state.currentPage + 1, state.maxPage); // вернёт большее число из двух: либо currentPage(2) + 1, либо maxPage (не даст уйти дальше последней страницы)
  loadProducts();
}

btnPrev.onclick = () => {
  state.currentPage = Math.max(state.currentPage - 1, 1); // вернёт меньшее число из двух: либо currentPage - 1, либо 1 (не даст уйти в 0 или отрицательные страницы)
  loadProducts();
}

function clampPage() {
  if (state.currentPage < 1) state.currentPage = 1;
  if (state.currentPage > state.maxPage) state.currentPage = state.maxPage;
}

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search); //
  state.search = params.get("search") || "";
  state.sort = params.get("sort") || "desc";
  state.currentPage = parseInt(params.get("page")) || 1;

  search.value = state.search;
  sortSelect.value = state.sort;
}


async function loadProducts() {
  try {
    const data = await getJson(`/products?search=${state.search}&limit=${LIMIT}&page=${state.currentPage}&sort=${state.sort}`);

    state.maxPage = Math.max(1, Math.ceil(data.total / LIMIT));

    const prevPage = state.currentPage;
    clampPage();

    if (state.currentPage !== prevPage) {
      syncStateWithUrl();
      return loadProducts();
    }

    console.log(data);
    
    syncStateWithUrl();
    pageInfo.textContent = state.currentPage;
    if (data.products.length === 0) {
      productsList.innerHTML = '<p class="empty-state">Такого у нас нет :(</p>';
    }
    else {
      renderProducts(data.products);
    }
    updatePageButtons();
  } catch (e) {
    print({ error: e.message });
  }
}



function renderProducts(products) {
  productsList.innerHTML = "";
  
  for (const product of products) {
    const card = document.createElement("div");
    card.className = "product-card";
    
    card.innerHTML = `
    <h3>${product.name}</h3>
    <p>Price: ${product.price}</p>
    <p>Type: ${product.type}</p>
    <p>Owner: ${product.owner && typeof product.owner === "object" ? product.owner.name : "-"}</p>
    `;
    
    productsList.appendChild(card);
  }
}


function print(data) {
  productsList.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}




