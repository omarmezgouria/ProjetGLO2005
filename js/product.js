/**
 * ArtiConnect - Products Page JavaScript
 * Handles functionality for the products catalog page
 */

// Define the base URL for the API (ensure this is consistent)
const API_BASE_URL = "http://127.0.0.1:5000/api"; // Adjust if needed

// Store fetched products globally within this script's scope
let currentProductList = [];

document.addEventListener("DOMContentLoaded", function () {
  // Fetch and render products from API on initial load
  fetchAndRenderProducts(); // Replaces renderProducts(sampleProducts)

  // Initialize UI components
  initFilters();
  initViewSwitcher();
  initSorting();
  initDynamicActions();
  initMobileFilters();
});

/**
 * Fetches products from the API and triggers rendering.
 * Can accept query parameters for filtering/sorting.
 * @param {string} [queryParams=''] - Optional query string like '?category=Woodwork&sort=price-asc'
 */
async function fetchAndRenderProducts(queryParams = "") {
  const productsGrid = document.querySelector(".products-grid");
  if (!productsGrid) return;

  // Show loading state
  productsGrid.innerHTML =
    '<p class="loading-message">Chargement des produits...</p>'; // Simple loading text
  productsGrid.classList.add("loading"); // Add class for potential CSS styling
  updateProductCount(0); // Reset count while loading

  try {
    const response = await fetch(`${API_BASE_URL}/products${queryParams}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const products = await response.json();

    currentProductList = products; // Store the fetched list globally
    renderProducts(currentProductList); // Render the fetched products
  } catch (error) {
    console.error("Error fetching products:", error);
    productsGrid.innerHTML =
      '<p class="error-message">Impossible de charger les produits. Veuillez réessayer.</p>';
  } finally {
    // Remove loading state regardless of success or error
    productsGrid.classList.remove("loading");
    // Count will be updated by renderProducts on success
  }
}

/**
 * Render product cards into the grid
 * @param {Array} products - Array of product objects fetched from the API
 */
function renderProducts(products) {
  const productsGrid = document.querySelector(".products-grid");
  if (!productsGrid) return;

  // Clear previous content (loading message or old products)
  productsGrid.innerHTML = "";

  if (!products || products.length === 0) {
    productsGrid.innerHTML = '<p class="no-products">Aucun produit trouvé.</p>';
    updateProductCount(0);
    return;
  }

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.dataset.productId = product.id; // Use ID from API data

    // Rating - Assuming API doesn't provide rating yet, hide it
    const starsHtml = ""; // Hide stars for now
    // TODO: Generate starsHtml when API provides rating data

    // Construct detail URL
    const detailUrl = `../client/product_detail.html?id=${product.id}`; // Construct URL

    productCard.innerHTML = `
            <a href="${detailUrl}" class="product-image">
                <img src="${
                  product.imageUrl || "../images/placeholder.jpg"
                }" alt="${product.name}" loading="lazy" />
            </a>
            <div class="product-info">
                <div class="product-category">${product.category || "N/A"}</div>
                <h3 class="product-title">
                    <a href="${detailUrl}">${product.name}</a>
                </h3>
                <div class="product-artisan">
                    <a href="#">Par ${product.artisan || "N/A"}</a>
                    <!-- TODO: Link to artisan profile page when available -->
                </div>
                <div class="product-price">${product.price
                  .toFixed(2)
                  .replace(".", ",")} €</div>
                <div class="product-rating" style="display: none;"> <!-- Hide rating section for now -->
                    <div class="stars">${starsHtml}</div>
                    <span class="rating-count">(0)</span> <!-- Placeholder count -->
                </div>
                <div class="product-actions">
                    <button class="btn btn--primary add-to-cart">
                        <i class="fas fa-shopping-cart"></i> Ajouter
                    </button>
                    <a href="${detailUrl}" class="btn btn--outline view-details">Détails</a>
                </div>
            </div>
        `;
    productsGrid.appendChild(productCard);
  });

  // Update count after rendering
  updateProductCount(products.length);
}

/**
 * Initialize dynamic actions (add to cart) using event delegation
 */
function initDynamicActions() {
  const productsGrid = document.querySelector(".products-grid");
  if (!productsGrid) return;

  productsGrid.addEventListener("click", function (event) {
    const target = event.target;

    // Handle Add to Cart button click
    const addToCartBtn = target.closest(".add-to-cart");
    if (addToCartBtn) {
      event.preventDefault();

      const productCard = addToCartBtn.closest(".product-card");
      const productId = parseInt(productCard?.dataset.productId);

      // Ensure addToCart function exists (assumed from main.js or cart.js)
      if (productId && window.articonnect?.addToCart) {
        // Find product data in the globally stored list fetched from API
        const productData = currentProductList.find((p) => p.id === productId);

        if (productData) {
          // Prepare item to add (default quantity 1 from list page)
          const itemToAdd = {
            id: productData.id,
            name: productData.name,
            price: productData.price,
            imageUrl: productData.imageUrl || "../images/placeholder.jpg",
            quantity: 1,
            variant: null, // No variants on list page
            detailUrl: `../client/product_detail.html?id=${productData.id}`,
            stock: productData.stock, // Pass stock info if available from API
            type: productData.type, // Pass type info if available from API
          };
          window.articonnect.addToCart(itemToAdd);
          console.log(`${productData.name} added to cart`); // Replace with better notification if needed
          // Header count updates via 'cartUpdated' event listener in cart.js/main.js
        } else {
          console.error(
            `Product data not found in current list for ID: ${productId}`
          );
          alert("Erreur: Impossible d'ajouter le produit.");
        }
      } else {
        console.error(
          "Could not add product to cart. Product ID or addToCart function missing."
        );
        alert("Erreur: Impossible d'ajouter le produit.");
      }
      return; // Stop further processing if add to cart was clicked
    }
  });
}

/**
 * Initialize filters - Now triggers API refetch
 */
function initFilters() {
  const filterContainer = document.querySelector(".filters"); // Target the main filters container
  const clearFiltersBtn = document.querySelector(".clear-filters");
  const priceApplyBtn = document.querySelector(".price-apply");
  // Mobile filter apply button
  const mobileApplyFiltersBtn = document.querySelector(
    ".mobile-filters-actions .apply-filters"
  );

  // Apply filters when checkboxes change or price is applied
  if (filterContainer) {
    filterContainer.addEventListener("change", (event) => {
      // Apply immediately for checkboxes inside the main container
      if (event.target.matches('.filter-option input[type="checkbox"]')) {
        applyFilters();
      }
    });
  }
  if (priceApplyBtn) {
    priceApplyBtn.addEventListener("click", applyFilters);
  }
  if (mobileApplyFiltersBtn) {
    mobileApplyFiltersBtn.addEventListener("click", () => {
      applyFilters();
      closeMobileFilters(); // Close mobile panel after applying
    });
  }

  // Clear all filters
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", function () {
      const filterOptions = document.querySelectorAll(
        '.filter-option input[type="checkbox"]'
      );
      const minPriceInput = document.getElementById("min-price");
      const maxPriceInput = document.getElementById("max-price");

      filterOptions.forEach((option) => (option.checked = false));
      if (minPriceInput) minPriceInput.value = "";
      if (maxPriceInput) maxPriceInput.value = "";

      applyFilters(); // Refetch with no filters
    });
  }

  // See more categories/artisans (UI only, keep as is)
  const seeMoreLinks = document.querySelectorAll(".see-more");
  if (seeMoreLinks.length) {
    seeMoreLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const filterGroup = this.closest(".filter-group");
        const hiddenOptions = filterGroup.querySelectorAll(
          ".filter-option.hidden"
        );
        hiddenOptions.forEach((option) => option.classList.remove("hidden"));
        this.style.display = "none";
      });
    });
  }
}

/**
 * Collects active filters and triggers API refetch
 */
function applyFilters() {
  const params = new URLSearchParams();

  // Get selected categories
  const categoryCheckboxes = document.querySelectorAll(
    '.filter-group[data-filter-group="category"] .filter-option input:checked'
  );
  categoryCheckboxes.forEach((cb) => {
    // Assuming checkbox value is the category name/slug needed by API
    params.append("category", cb.value); // Use append for multiple categories if backend supports it
    // If backend only supports one category filter, use set: params.set('category', cb.value); and maybe take the first checked one.
    // For now, assuming backend handles single category param like '?category=Woodwork'
    if (!params.has("category")) {
      // Simple approach: take the first checked category if multiple are selected but backend only handles one
      params.set("category", cb.value);
    }
  });

  // Get selected artisans (if filter exists and backend supports it)
  // const artisanCheckboxes = document.querySelectorAll('.filter-group[data-filter-group="artisan"] .filter-option input:checked');
  // artisanCheckboxes.forEach(cb => params.append('artisan', cb.value)); // Example

  // Get price range (if backend supports it)
  // const minPrice = document.getElementById("min-price")?.value;
  // const maxPrice = document.getElementById("max-price")?.value;
  // if (minPrice) params.set('min_price', minPrice);
  // if (maxPrice) params.set('max_price', maxPrice);

  // Get sorting (add from sorting dropdown if needed)
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect && sortSelect.value) {
    params.set("sort", sortSelect.value);
  }

  console.log("Applying filters with params:", params.toString());
  fetchAndRenderProducts(`?${params.toString()}`);
}

/**
 * Update product count in the toolbar
 * @param {number} count - The number of products currently displayed
 */
function updateProductCount(count) {
  const productCountElement = document.querySelector(".products-count span");
  if (productCountElement) {
    productCountElement.textContent = `${count} produit${
      count !== 1 ? "s" : ""
    }`; // Correct pluralization
  }
}

/**
 * Initialize view switching (grid/list) - Keep as is (UI only)
 */
function initViewSwitcher() {
  const viewOptions = document.querySelectorAll(".view-option");
  const productsContent = document.querySelector(".products-content");

  if (viewOptions.length && productsContent) {
    viewOptions.forEach((option) => {
      option.addEventListener("click", function () {
        viewOptions.forEach((opt) => opt.classList.remove("active"));
        this.classList.add("active");
        const viewMode = this.dataset.view;
        productsContent.className = `products-content view-${viewMode}`; // Simpler class setting
        localStorage.setItem("articonnect_product_view", viewMode);
      });
    });

    const savedView =
      localStorage.getItem("articonnect_product_view") || "grid"; // Default to grid
    const targetOption = document.querySelector(
      `.view-option[data-view="${savedView}"]`
    );
    if (targetOption) {
      // Simulate click to apply initial view and active state
      targetOption.click();
    } else if (viewOptions.length > 0) {
      viewOptions[0].click(); // Fallback to first option if saved view invalid
    }
  }
}

/**
 * Initialize sorting - Now triggers API refetch via applyFilters
 */
function initSorting() {
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      applyFilters(); // Re-apply filters which will include the new sort parameter
    });
  }
}

/**
 * Initialize mobile filters - Keep as is (UI only, apply button triggers applyFilters)
 */
function initMobileFilters() {
  const mobileFiltersBtn = document.querySelector(".mobile-filters-button");
  const mobileFiltersOverlay = document.querySelector(
    ".mobile-filters-overlay"
  );
  const mobileFiltersContainer = document.querySelector(
    ".mobile-filters-container"
  );
  const closeBtn = document.querySelector(".mobile-filters-close");

  if (!mobileFiltersBtn || !mobileFiltersOverlay || !mobileFiltersContainer)
    return;

  mobileFiltersBtn.addEventListener("click", function () {
    mobileFiltersOverlay.classList.add("active");
    mobileFiltersContainer.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  function closeMobileFiltersInternal() {
    // Renamed to avoid conflict
    mobileFiltersOverlay.classList.remove("active");
    mobileFiltersContainer.classList.remove("active");
    document.body.style.overflow = "";
  }
  // Assign the internal function to the global scope if needed elsewhere, or pass it
  window.closeMobileFilters = closeMobileFiltersInternal;

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMobileFiltersInternal);
  }
  mobileFiltersOverlay.addEventListener("click", closeMobileFiltersInternal);
  mobileFiltersContainer.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // Apply button logic moved to initFilters
}

// Removed redundant/unused functions like updateCartCount, showNotification
