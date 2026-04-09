function renderSharedHeader(container, options = {}) {
  if (!container) return;

  const {
    searchPlaceholder = "Поиск товаров...",
    showSearch = true,
    backHref = "",
    showBack = false,
    showFavorites = true,
    showCart = true,
    showProfile = true,
  } = options;


  const backLink = showBack
    ? `
  <a class="header-icon-link top-link" href="${backHref || "/"}" aria-label="Back">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m15 18-6-6 6-6"></path>
  </svg>
  </a>
  `
    : "";

  const searchBlock = showSearch
    ? `
  <form action="" id="searchForm" class="header-search">
  <span class="header-search-icon" aria-hidden="true">
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8"></circle>
  <path d="m21 21-4.3-4.3"></path>
  </svg>
  </span>
  <input id="inputSearch" class="search-input" type="text" placeholder="${searchPlaceholder}">
  </form>
  `
    : `<div class="header-search header-search-empty"></div>`;

  const favoritesLink = showFavorites
    ? `
  <a class="header-icon-link favorites-link" href="#" aria-label="Favorites">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m12 21-1.45-1.32C5.4 15.02 2 11.9 2 8.09 2 5 4.42 2.5 7.5 2.5c1.74 0 3.41.81 4.5 2.09A6 6 0 0 1 16.5 2.5C19.58 2.5 22 5 22 8.09c0 3.81-3.4 6.93-8.55 11.6z"></path>
  </svg>
  </a>
  `
    : "";

  const cartLink = showCart
    ? `
  <a class="header-icon-link cart-link " href="/cart.html" aria-label="Cart">
  <span class="cart-count"></span>
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="9" cy="21" r="1"></circle>
  <circle cx="20" cy="21" r="1"></circle>
  <path d="M1 1h4l2.68 13.39A2 2 0 0 0 9.64 16H19a2 2 0 0 0 1.95-1.57L23 6H6"></path>
  </svg>
  </a>
  `
    : "";

  const profileLink = showProfile
    ? `
  <div class="userMenu">
  <a href="/profile.html" id="profileBtn" class="header-icon-link profile-link" type="button" aria-label="Profile">
  <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
  <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
  <circle cx="12" cy="7" r="4"></circle>
  </svg>
  </a>
  <p id="TokenIsAvailable"></p>
  </div>
  `
    : "";

  container.className = "site-header";
  container.innerHTML = `
  <div class="header-bottom">
  <a class="brand-copy brand-mark" href="/">
  <span class="brand-mark-white">Market</span><span class="brand-mark-accent">Place</span>
  </a>
  
  ${searchBlock}
  
  <div class="header-actions">
  ${backLink}
  ${favoritesLink}
  ${cartLink}
  ${profileLink}
  </div>
  </div>
  `;

  const searchForm = document.getElementById("searchForm");
  const cartCount = container.querySelector(".cart-count");
  const cartLinkElement = container.querySelector(".cart-link");

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputSearch = document.getElementById("inputSearch").value.trim();
      syncUrlWithSearch(inputSearch);
      console.log("submit works")
    });
  }

  if (showCart) {
    updateCartCount(cartCount, cartLinkElement);
  }


}

async function updateCartCount(cartCount, cartLink) {
  if (cartCount && cartLink) {
    if (typeof loadCart === "function") {
      const data = await loadCart();
      console.log(data.totalItems)
      if (data.totalItems <= 0) {
        cartCount.textContent = "";
        cartLink.classList.remove("cart-link-active")
        cartLink.classList.add("cart-link-empty");
        cartCount.style.display = "none";
      } else {
        cartCount.textContent = data.totalItems.toString();
        cartLink.classList.remove("cart-link-empty");
        cartLink.classList.add("cart-link-active")
        cartCount.style.display = "grid";
      }
    }
  }
}

function syncUrlWithSearch(searchValue) {
  const params = new URLSearchParams(window.location.search);
  params.set("search", searchValue);

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  console.log(newUrl);
  window.location.href = newUrl;
}



window.renderSharedHeader = renderSharedHeader;
