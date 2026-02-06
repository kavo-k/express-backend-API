console.log("products.js LOADED");
const productsList = document.getElementById("product-card");

loadProducts();

async function loadProducts() {
  try {
    const data = await getJson(`/products?limit=5&page=1&sort=desc`);
    console.log(data);
    renderProducts(data.products);
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

async function getJson(url) {
  const res = await fetch(url);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return data;
}



