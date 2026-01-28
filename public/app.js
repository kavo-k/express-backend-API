const out = document.getElementById("out");

function print(data) {
  out.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

async function getJson(url) {
  const res = await fetch(url);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return data;
}

document.getElementById("btnUsers").addEventListener("click", async () => {
  try {
    print("loading...");
    const data = await getJson("/users?limit=5&page=1&sort=desc");
    print(data);
  } catch (e) {
    print({ error: e.message });
  }
});

document.getElementById("btnProducts").addEventListener("click", async () => {
  try {
    print("loading...");
    const data = await getJson("/products");
    print(data);
  } catch (e) {
    print({ error: e.message });
  }
});

document.getElementById("btnUserProducts").addEventListener("click", async () => {
  try {
    const userId = prompt("Вставь userId (_id) сюда:");
    if (!userId) return;

    print("loading...");
    const data = await getJson(`/users/${userId}/products`);
    print(data);
  } catch (e) {
    print({ error: e.message });
  }
});
