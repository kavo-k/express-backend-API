console.log("Profile page loaded");

renderSharedHeader(document.getElementById("siteHeader"), {
  searchPlaceholder: "Поиск товаров...",
  showSearch: true,
  showBack: true,
  showFavorites: true,
  showCart: true,
  showProfile: true,
  cartCount: "0"
});

const name = document.getElementById("name");
const email = document.getElementById("email");
const age = document.getElementById("age");
const logoutBtn = document.getElementById("logoutBtn");
const details = document.getElementById("details");
const backBtn = document.getElementById("backBtn");
const addProductBtn = document.getElementById("addProductBtn");
const myProductsList = document.getElementById("myProductsList");
const sortSelect = document.getElementById("sortSelect");
const pageInfo = document.getElementById("pageInfo");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const search = document.getElementById("inputSearch");

const LIMIT = 5;

let state = { currentPage: 1, maxPage: 1, search: "", sort: "desc" };

const user = getCurrentUser();

if (!getToken()) {
  window.location.href = "/login.html";
}


if (user) {
  name.textContent = user.userName || user.name || "";
  email.textContent = user.email || "";
  age.textContent = user.age || "не указано";
}

if (!user) {
  console.warn("No user data found, redirecting to login");
  window.location.href = "/login.html";
} else {
  details.innerHTML = `
    <p>Пользователь: ${user.userName || user.name} (id: ${user._id})</p>
    Открыть API: <a href="/users/${user._id}" target="_blank" rel="noopener noreferrer" > 
    /users/${user._id} (потом убрать)</a>`;
};


function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const page = parseInt(params.get("page"), 10);
  console.log(params);

  state.search = (params.get("search") || "").trim();
  state.sort = params.get("sort") || "desc";
  state.currentPage = Number.isFinite(page) && page > 0 ? page : 1;

  search.value = state.search;
  sortSelect.value = state.sort;
}

async function getJson(url) {
  const res = await authFetch(url);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return data;
}

function clampPage() {
  if (state.currentPage < 1) state.currentPage = 1;
  if (state.currentPage > state.maxPage) state.currentPage = state.maxPage;
}

function updatePageButtons() {
  btnPrev.disabled = state.currentPage === 1;
  btnNext.disabled = state.currentPage === state.maxPage;
}


async function loadProducts() {
  try {
    console.log(state);
    const data = await getJson(
      `/products/my?search=${state.search}&limit=${LIMIT}&page=${state.currentPage}&sort=${state.sort}`
    );
    console.log(data.page, data.limit, data.total, data.products);

    state.maxPage = Math.max(1, Math.ceil(data.total / LIMIT));

    const prevPage = state.currentPage;
    clampPage();

    pageInfo.textContent = state.currentPage;

    renderProducts(data.products);
    updatePageButtons();
  } catch (e) {
    print({ error: e.message });
  }
}


function renderProducts(products) {
  myProductsList.innerHTML = "";

  if (products.length === 0) {
    myProductsList.innerHTML = '<p class="profile-products-empty">You have no products yet.</p>';
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
      <img class="product-owner-image" data-full-image="${product.imageOptimizedUrl || product.imageUrl}" src="${product.imageOptimizedUrl || product.imageUrl || '/img/placeholder.png'}" alt="${product.name}" onerror="this.onerror=null;this.src='/img/placeholder.png';">
      <h3 href="/public/product.html" >${product.name}</h3>
      <p>Price: ${product.price}</p>
      <p>Type: ${product.type}</p>
      <a href="/users/${product.owner && typeof product.owner === "object" ? product.owner._id : product.owner}">
  Owner: ${product.owner && typeof product.owner === "object" ? product.owner.userName || product.owner.name : "-"}
</a>
      <p>Description: ${product.description || "-"}</p>
      <p>created at: ${new Date(product.createdAt).toLocaleDateString("ru-RU")}</p>
    `;

    card.dataset.productId = product._id;

    myProductsList.appendChild(card);
  }
}

function print(data) {
  myProductsList.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

myProductsList.addEventListener("click", (e) => {
  const productCard = e.target.closest(".product-card");

  if (productCard) {
    const id = productCard.dataset.productId;
    window.location.href = `/product.html?id=${id}`;
    return;
  }

})

addProductBtn.addEventListener("click", () => {
  window.location.href = "/productForm.html"
});


logoutBtn.addEventListener("click", () => {
  logout();
});

backBtn.addEventListener("click", () => {
  window.location.href = "/";
});

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