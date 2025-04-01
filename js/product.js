/**
 * ArtiConnect - Products Page JavaScript
 * Handles functionality for the products catalog page
 */

// Sample product data moved to js/main.js and exposed via window.articonnect.sampleProducts

document.addEventListener("DOMContentLoaded", function () {
  // Render initial products
  renderProducts(sampleProducts); // Render products first

  // Initialize filters functionality
  initFilters();

  // Initialize view switching (grid/list)
  initViewSwitcher();

  // Initialize sorting
  initSorting();

  // Initialize add to cart using event delegation
  initDynamicActions();

  // Initialize mobile filters
  initMobileFilters();

  // Update count based on initial render
  updateProductCount(sampleProducts.length);
});

/**
 * Render product cards into the grid
 * @param {Array} products - Array of product objects to render
 */
function renderProducts(products) {
  const productsGrid = document.querySelector(".products-grid");
  if (!productsGrid) return;

  // Clear existing products (except potential loading indicators)
  productsGrid.innerHTML = "";

  if (products.length === 0) {
    productsGrid.innerHTML = '<p class="no-products">Aucun produit trouvé.</p>';
    updateProductCount(0);
    return;
  }

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.dataset.productId = product.id; // Add product ID for easier targeting

    // Generate star rating HTML
    let starsHtml = "";
    const fullStars = Math.floor(product.rating);
    const halfStar = product.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < fullStars; i++)
      starsHtml += '<i class="fas fa-star"></i>';
    if (halfStar) starsHtml += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++)
      starsHtml += '<i class="far fa-star"></i>';

    productCard.innerHTML = `
            <a href="${product.detailUrl}" class="product-image">
                <img src="${product.imageUrl}" alt="${
      product.name
    }" loading="lazy" />
            </a>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">
                    <a href="${product.detailUrl}">${product.name}</a>
                </h3>
                <div class="product-artisan">
                    <a href="#">Par ${product.artisan}</a>
                </div>
                <div class="product-price">${product.price
                  .toFixed(2)
                  .replace(".", ",")} €</div>
                <div class="product-rating">
                    <div class="stars">${starsHtml}</div>
                    <span class="rating-count">(${product.ratingCount})</span>
                </div>
                <div class="product-actions">
                    <button class="btn btn--primary add-to-cart">
                        <i class="fas fa-shopping-cart"></i> Ajouter
                    </button>
                    <a href="${
                      product.detailUrl
                    }" class="btn btn--outline view-details">Détails</a>
                </div>
            </div>
        `;
    productsGrid.appendChild(productCard);
  });

  // Update the count after rendering
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

    // Handle Add to Cart Button Click
    const addToCartBtn = target.closest(".add-to-cart");
    if (addToCartBtn) {
      event.preventDefault();

      // Get product info
      const productCard = addToCartBtn.closest(".product-card");
      const productId = parseInt(productCard?.dataset.productId); // Ensure ID is number

      if (
        productId &&
        window.articonnect &&
        typeof window.articonnect.addToCart === "function"
      ) {
        // Find the full product data from the global list
        const productData = window.articonnect.sampleProducts.find(
          (p) => p.id === productId
        );

        if (productData) {
          // Prepare item to add (default quantity 1 from product list)
          const itemToAdd = {
            id: productData.id,
            name: productData.name,
            price: productData.price,
            imageUrl: productData.imageUrl,
            quantity: 1, // Default quantity when adding from list
            variant: null, // No variants selectable on list page
            detailUrl: productData.detailUrl,
            stock: productData.stock, // Pass stock info if available
          };
          window.articonnect.addToCart(itemToAdd);
          console.log(`${productData.name} ajouté au panier`); // Replaced showNotification
          // Header count updates automatically via 'cartUpdated' event listener in cart.js
        } else {
          console.error(`Product data not found for ID: ${productId}`);
          alert("Erreur: Impossible d'ajouter le produit.");
        }
      } else {
        console.error(
          "Could not add product to cart. Product ID or addToCart function missing."
        );
        alert("Erreur: Impossible d'ajouter le produit.");
      }
      return; // Stop further processing if add-to-cart button was clicked
    }
  });
}

// Note: The following lines (263-271 in the previous state) were removed
// as they were erroneously duplicated/misplaced HTML fragments.

/**
 * Initialize filters
 */

/**
 * Initialize filters
 */
function initFilters() {
  const filterOptions = document.querySelectorAll(
    '.filter-option input[type="checkbox"]'
  );
  const clearFiltersBtn = document.querySelector(".clear-filters");
  const priceApplyBtn = document.querySelector(".price-apply");
  const minPriceInput = document.getElementById("min-price");
  const maxPriceInput = document.getElementById("max-price");

  // Apply filters when checkboxes are changed
  if (filterOptions) {
    filterOptions.forEach((option) => {
      option.addEventListener("change", function () {
        applyFilters();
      });
    });
  }

  // Clear all filters
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", function () {
      // Uncheck all filter checkboxes
      filterOptions.forEach((option) => {
        option.checked = false;
      });

      // Reset price inputs
      if (minPriceInput) minPriceInput.value = "";
      if (maxPriceInput) maxPriceInput.value = "";

      applyFilters();
    });
  }

  // Apply price filter
  if (priceApplyBtn) {
    priceApplyBtn.addEventListener("click", function () {
      applyFilters();
    });
  }

  // See more categories or artisans
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
 * Apply active filters to products
 */
function applyFilters() {
  // In a real implementation, this would likely make an AJAX request to the server
  // or filter the products in-place if they're client-side loaded
  console.log("Filters applied");

  // For demo purposes, simulate filter application with a loading state
  const productsGrid = document.querySelector(".products-grid");
  if (productsGrid) {
    productsGrid.classList.add("loading");

    setTimeout(() => {
      productsGrid.classList.remove("loading");
      updateProductCount();
    }, 500);
  }
}

/**
 * Update product count in the toolbar
 * @param {number} count - The number of products to display
 */
function updateProductCount(count) {
  const productCountElement = document.querySelector(".products-count span");
  if (productCountElement) {
    productCountElement.textContent = `${count} produit${count > 1 ? "s" : ""}`;
  }
}

/**
 * Initialize view switching (grid/list)
 */
function initViewSwitcher() {
  const viewOptions = document.querySelectorAll(".view-option");
  const productsContent = document.querySelector(".products-content");

  if (viewOptions.length && productsContent) {
    viewOptions.forEach((option) => {
      option.addEventListener("click", function () {
        // Remove active class from all options
        viewOptions.forEach((opt) => opt.classList.remove("active"));

        // Add active class to clicked option
        this.classList.add("active");

        // Set view mode
        const viewMode = this.dataset.view;

        if (viewMode === "grid") {
          productsContent.classList.add("view-grid");
          productsContent.classList.remove("view-list");
        } else if (viewMode === "list") {
          productsContent.classList.add("view-list");
          productsContent.classList.remove("view-grid");
        }

        // Save preference in localStorage
        localStorage.setItem("articonnect_product_view", viewMode);
      });
    });

    // Set initial view based on saved preference
    const savedView = localStorage.getItem("articonnect_product_view");
    if (savedView) {
      // Adjusted querySelector syntax
      const targetOption = document.querySelector(
        '.view-option[data-view="' + savedView + '"]'
      );
      if (targetOption) {
        targetOption.click();
      }
    }
  }
}

/**
 * Initialize sorting
 */
function initSorting() {
  const sortSelect = document.getElementById("sort-select");

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      const sortValue = this.value;
      console.log(`Sorting by: ${sortValue}`); // Added semicolon

      // In a real implementation, this would make an AJAX request or sort in-place
      // For demo purposes, simulate sorting with a loading state
      const productsGrid = document.querySelector(".products-grid");
      if (productsGrid) {
        productsGrid.classList.add("loading");

        setTimeout(() => {
          productsGrid.classList.remove("loading");

          // Demo: Just move a few products around to show something happened
          if (sortValue === "price-low" || sortValue === "price-high") {
            // Sort by price demo - just move items
            const productCards = Array.from(
              document.querySelectorAll(".product-card")
            );
            if (productCards.length > 1) {
              // Move the first product to the end or vice versa
              const firstCard = productCards[0];
              const lastCard = productCards[productCards.length - 1];

              if (sortValue === "price-low") {
                productsGrid.removeChild(lastCard);
                productsGrid.insertBefore(lastCard, firstCard);
              } else {
                productsGrid.removeChild(firstCard);
                productsGrid.appendChild(firstCard);
              }
            }
          }
        }, 500);
      }
    });
  }
}

// initFavorites function removed as its logic is now in initDynamicActions

/**
 * Initialize mobile filters
 */
function initMobileFilters() {
  const mobileFiltesBtn = document.querySelector(".mobile-filters-button");
  const mobileFiltersOverlay = document.querySelector(
    ".mobile-filters-overlay"
  );
  const mobileFiltersContainer = document.querySelector(
    ".mobile-filters-container"
  );
  const closeBtn = document.querySelector(".mobile-filters-close");

  if (!mobileFiltesBtn || !mobileFiltersOverlay || !mobileFiltersContainer)
    return;

  // Open mobile filters
  mobileFiltesBtn.addEventListener("click", function () {
    mobileFiltersOverlay.classList.add("active");
    mobileFiltersContainer.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent scrolling
  });

  // Close mobile filters
  function closeMobileFilters() {
    mobileFiltersOverlay.classList.remove("active");
    mobileFiltersContainer.classList.remove("active");
    document.body.style.overflow = ""; // Enable scrolling
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMobileFilters);
  }

  mobileFiltersOverlay.addEventListener("click", closeMobileFilters);

  // Prevent clicks inside container from closing
  mobileFiltersContainer.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // Apply filters button in mobile view
  const applyFiltersBtn = document.querySelector(
    ".mobile-filters-actions .apply-filters"
  );
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", function () {
      applyFilters();
      closeMobileFilters();
    });
  }
}

// initAddToCart function removed as its logic is now in initDynamicActions

/**
 * Update cart count in header
 */
function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");
  if (cartCount) {
    let count = parseInt(cartCount.textContent) || 0;
    count += 1;
    cartCount.textContent = count;

    // Add animation
    cartCount.classList.add("pulse");
    setTimeout(() => {
      cartCount.classList.remove("pulse");
    }, 500);
  }
}

// showNotification function removed.

// Removed dynamically added CSS - styles moved to css/pages/products.css
