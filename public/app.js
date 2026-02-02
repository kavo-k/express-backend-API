console.log("app.js LOADED v2");
const out = document.getElementById("out");
const page =   document.querySelector(".row_right");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");

page.classList.add("hidden");
let state = { currentPage: 1 };


async function getJson(url) {
  const res = await fetch(url);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return data;
}


function print(data) {
  if (data === "loading") {
    page.classList.add("hidden");
    out.textContent = "loading...";
    return;
  }

  if ( state.currentPage === 1) {
  btnPrev.classList.add("hidden");
  }
  else {
  btnPrev.classList.remove("hidden");
  }

  if (state.currentPage === state.maxPage) {
    btnNext.classList.add("hidden");
  }
  else {
    btnNext.classList.remove("hidden");
  }

  out.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}


async function loadUsers() {
  try {
    print("loading");
    page.classList.remove("hidden");
    const data = await getJson(`/users?limit=5&page=${state.currentPage}&sort=desc`);
    state.maxPage = Math.max(1, Math.ceil(data.total / data.limit));
    print(data);
  } catch (e) {
    print({ error: e.message });
  }
}

async function loadProducts() {
  try {
    print("loading");
    page.classList.remove("hidden");
    const data = await getJson(`/products?limit=5&page=${state.currentPage}&sort=desc`);
    state.maxPage = Math.max(1, Math.ceil(data.total / data.limit));
    console.log(data);
    print(data);
  } catch (e) {
    print({ error: e.message });
  }
}



document.getElementById("btnNext").onclick = () => {
  state.currentPage = Math.min(state.maxPage, state.currentPage + 1);
  loadUsers();
};


document.getElementById("btnPrev").onclick = () => {
  console.log("BtnLeft =", btnPrev);
  state.currentPage = Math.max(1, state.currentPage - 1); 
  loadUsers();
};




document.getElementById("btnUsers").onclick = () => {
    try {
  page.classList.remove("hidden");
  state.currentPage = 1;
  loadUsers();
    } catch (e) {
    print({ error: e.message });
  }
};



document.getElementById("btnProducts").onclick = () => {
  try {
    page.classList.remove("hidden");
    state.currentPage = 1;
    loadProducts()
  } catch (e) {
    print({ error: e.message });
  }
};

document.getElementById("btnUserProducts").addEventListener("click", async () => {
  try {
    const userId = prompt("Вставь userId (_id) сюда:");
    if (!userId) return;
    print("loading");
    const data = await getJson(`/users/${userId}/products`);
    print(data);
  } catch (e) {
    print({ error: e.message });
  }
});


document.getElementById("btnText").onclick = () => {
    try {
      print("loading");
      print("просто текст для проверки");
        } catch (e) {
    print({ error: e.message });
  }
};