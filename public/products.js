console.log("products.js LOADED");
const productsList = document.getElementById("product-card");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const LIMIT = 2;
const pageInfo = document.getElementById("pageInfo");


let state = { currentPage: 1, maxPage: 1 };



async function getJson(url) { 
  const res = await fetch(url);
  const data = await res.json().catch(() => null);
  
  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return data;
}

loadProducts();


function updatePageButtons() {
  btnPrev.disabled = state.currentPage === 1; 

  btnNext.disabled = state.currentPage === state.maxPage;
}


btnNext.onclick = () => {
  state.currentPage = Math.min(state.currentPage + 1, state.maxPage); // вернёт большее число из двух: либо currentPage(2) + 1, либо maxPage (не даст уйти дальше последней страницы)
  loadProducts();
}

btnPrev.onclick = () => {
  state.currentPage = Math.max(state.currentPage - 1, 1); // вернёт меньшее число из двух: либо currentPage - 1, либо 1 (не даст уйти в 0 или отрицательные страницы)
  loadProducts();
}


async function loadProducts() {
  try {
    pageInfo.textContent = state.currentPage;
    const data = await getJson(`/products?limit=${LIMIT}&page=${state.currentPage}&sort=desc`);
    console.log(data);
    state.maxPage = Math.max(1, Math.ceil(data.total / LIMIT));
    renderProducts(data.products);
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




