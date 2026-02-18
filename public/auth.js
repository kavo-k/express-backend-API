
function getToken() {
    return localStorage.getItem("accessToken");
}

async function login(email, password) {
    const res = await fetch("/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    
    if (!res.ok) { throw new Error(data.error || "Ошибка при входе"); }
    
    localStorage.setItem("accessToken", data.token || data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
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
    
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    
    return fetch(url, { ...options, headers });
}