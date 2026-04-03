
function getToken() {
    return localStorage.getItem("accessToken");
}


async function register(userName, age, email, password) {
    const res = await fetch("/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, age, email, password }),
    });

    const data = await res.json();

    if (!res.ok) { throw new Error(data.error || "Ошибка при регистрации"); }
    return data.user;
}


async function login(email, password) {
    const res = await fetch("/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    const user = data.user;
    const message = data.message;
    const result = { user, message };

    if (!res.ok) { throw new Error(data.error || "Ошибка при входе"); }

    localStorage.setItem("accessToken", data.token || data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    return result;
}


async function forgotPassword(email) {
    const res = await fetch("/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) { throw new Error(data.error || "Ошибка при сбросе пароля"); }
    return data;
}


async function loadCart() {
    const res = await authFetch("/cart", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) { throw new Error(data.error || "Ошибка при загрузке корзины"); }
    return data;
}


async function addToCart(productId) {
    const res = await authFetch("/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
    });

    const data = await res.json();

    if (!res.ok) { throw new Error(data.error || "Ошибка при добавлении товара"); }
    return data;
}


async function decreaseCartItem(productId) {
    const res = await authFetch(`/cart/items/${productId}/decrease`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ }),
    });

    const data = await res.json();

    if (!res.ok) { throw new Error(data.error || "Ошибка при удалении товара"); }
    return data;
}


async function removeCartItem(productId) {
    const res = await authFetch(`/cart/items/${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ }),
    });

    const data = await res.json();

    if (!res.ok) { throw new Error(data.error || "Ошибка при удалении товара"); }
    return data;
}


function getCurrentUser() {
    const userJson = localStorage.getItem("user");
    return userJson ? JSON.parse(userJson) : null;
}


function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/login.html";
}


async function authFetch(url, options = {}) {
    const token = getToken();
    let headers = {};

    if (options.body instanceof FormData) {
        headers = {
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    } else {
        headers = {
            "Content-Type": "application/json",
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }


    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        logout();
    }
    return response;
}
