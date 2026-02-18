console.log("Profile page loaded");

const name = document.getElementById("name");
const email = document.getElementById("email");
const age = document.getElementById("age");
const logoutBtn = document.getElementById("logoutBtn");
const details = document.getElementById("details");
const backBtn = document.getElementById("backBtn");
const addProductBtn = document.getElementById("addProductBtn");

const user = getCurrentUser();


if (user) {
    name.textContent = user.userName || "";
    email.textContent = user.email || "";
    age.textContent = user.age || "не указано";
}

if (!user) {
    console.warn("No user data found, redirecting to login");
    window.location.href = "/login.html";
} else {
    details.innerHTML = `
<p>Пользователь: ${user.userName} (id: ${user._id})</p>
Открыть API: <a href="/users/${user._id}" target="_blank" rel="noopener noreferrer"> 
/users/${user._id} </a>`;
};


addProductBtn.addEventListener("click", () => {
    window.location.href = "/productForm.html"
});


logoutBtn.addEventListener("click", () => {
    logout();
});

backBtn.addEventListener("click", () => {
    window.location.href = "/";
});