/**
 * ArtiConnect - Product Detail Page JavaScript
 * Handles functionality for the product detail page
 */

/**
 * Load product details based on URL parameter
 */
function loadProductDetails() {
  const productId = parseInt(window.articonnect.getUrlParameter("id"));
  if (isNaN(productId)) {
    console.error("Invalid or missing product ID in URL");
    // Optionally display an error message on the page
    document.querySelector(".product-detail-page .container").innerHTML =
      '<p class="error-message">Produit non trouvé. ID invalide ou manquant.</p>';
    return;
  }

  const product = window.articonnect.sampleProducts.find(
    (p) => p.id === productId
  );

  if (!product) {
    console.error(`Product with ID ${productId} not found`);
    // Optionally display an error message on the page
    document.querySelector(".product-detail-page .container").innerHTML =
      '<p class="error-message">Produit non trouvé.</p>';
    return;
  }

  // --- Populate Page Elements ---

  // Page Title
  document.title = `ArtiConnect - ${product.name}`;

  // Breadcrumb
  const breadcrumbCurrent = document.querySelector(".breadcrumb .current");
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = product.name;
  // TODO: Update category link in breadcrumb if needed

  // Gallery
  const mainImage = document.getElementById("main-product-image");
  if (mainImage) {
    mainImage.src = product.images ? product.images[0] : product.imageUrl; // Use first image or default
    mainImage.alt = product.name;
  }
  const thumbnailGallery = document.querySelector(".thumbnail-gallery");
  if (thumbnailGallery) {
    thumbnailGallery.innerHTML = ""; // Clear existing thumbnails
    if (product.images && product.images.length > 1) {
      product.images.forEach((imgSrc, index) => {
        const button = document.createElement("button");
        button.className = `thumbnail ${index === 0 ? "active" : ""}`;
        button.dataset.image = imgSrc;
        button.innerHTML = `<img src="${imgSrc}" alt="${product.name} - Vue ${
          index + 1
        }" />`;
        thumbnailGallery.appendChild(button);
      });
    } else {
      // Hide gallery if only one image
      thumbnailGallery.style.display = "none";
    }
  }

  // Product Info
  const titleElement = document.querySelector(".product-info .product-title");
  if (titleElement) titleElement.textContent = product.name;

  const artisanLink = document.querySelector(".artisan-info a");
  if (artisanLink) artisanLink.textContent = product.artisan;
  // TODO: Update artisan avatar and link href if needed

  const priceElement = document.querySelector(".product-info .product-price");
  if (priceElement)
    priceElement.textContent = `${product.price
      .toFixed(2)
      .replace(".", ",")} €`;

  const ratingStars = document.querySelector(".product-rating .stars");
  if (ratingStars) {
    let starsHtml = "";
    const fullStars = Math.floor(product.rating);
    const halfStar = product.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < fullStars; i++)
      starsHtml += '<i class="fas fa-star"></i>';
    if (halfStar) starsHtml += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++)
      starsHtml += '<i class="far fa-star"></i>';
    ratingStars.innerHTML = starsHtml;
  }
  const ratingCountLink = document.querySelector(
    ".product-rating .rating-count"
  );
  if (ratingCountLink)
    ratingCountLink.textContent = `${product.ratingCount} avis`;

  const availabilityElement = document.querySelector(".product-availability");
  if (availabilityElement) {
    if (product.stock > 0) {
      availabilityElement.className = "product-availability in-stock";
      availabilityElement.innerHTML = `<i class="fas fa-check-circle"></i> En stock (${
        product.stock
      } disponible${product.stock > 1 ? "s" : ""})`;
    } else {
      availabilityElement.className = "product-availability out-of-stock";
      availabilityElement.innerHTML = `<i class="fas fa-times-circle"></i> Hors stock`;
    }
  }

  const shortDescElement = document.querySelector(
    ".product-short-description p"
  );
  if (shortDescElement)
    shortDescElement.textContent =
      product.description.substring(0, 150) + "..."; // Truncate for short desc

  // Quantity Input Max
  const quantityInput = document.querySelector(".quantity-input");
  if (quantityInput) quantityInput.max = product.stock > 0 ? product.stock : 1;

  // Tab Content
  const descriptionContent = document.querySelector(
    "#description .description-content"
  );
  if (descriptionContent) {
    // More detailed description population
    descriptionContent.querySelector(
      "h2"
    ).textContent = `À propos de ${product.name}`;
    // Assuming product.description holds the full text
    const paragraphs = product.description.split("\n\n"); // Simple split, adjust if needed
    descriptionContent.querySelectorAll("p").forEach((p, index) => {
      if (paragraphs[index]) {
        p.textContent = paragraphs[index];
      } else {
        p.remove(); // Remove extra template paragraphs
      }
    });
  }

  const specsContent = document.querySelector("#specifications .specs-grid");
  if (specsContent && product.specs) {
    // Clear existing template specs
    specsContent.innerHTML = "";
    // Populate based on product.specs object
    for (const groupName in product.specs) {
      const specGroupDiv = document.createElement("div");
      specGroupDiv.className = "spec-group";
      const title = document.createElement("h3");
      // Simple capitalization for group name
      title.textContent =
        groupName.charAt(0).toUpperCase() + groupName.slice(1);
      specGroupDiv.appendChild(title);

      const list = document.createElement("ul");
      list.className = "spec-list";
      // Assuming specs[groupName] is an object or string
      if (typeof product.specs[groupName] === "object") {
        for (const key in product.specs[groupName]) {
          const item = document.createElement("li");
          item.innerHTML = `<strong>${
            key.charAt(0).toUpperCase() + key.slice(1)
          }:</strong> ${product.specs[groupName][key]}`;
          list.appendChild(item);
        }
      } else {
        const item = document.createElement("li");
        item.textContent = product.specs[groupName];
        list.appendChild(item);
      }
      specGroupDiv.appendChild(list);
      specsContent.appendChild(specGroupDiv);
    }
  }

  // TODO: Populate Artisan Tab

  // Store current product globally for other functions on this page
  window.currentProduct = product;
}

document.addEventListener("DOMContentLoaded", function () {
  // Load product data first
  loadProductDetails();

  // Initialize UI components after data might be loaded
  initProductGallery();
  initQuantitySelector();
  initAddToCart(); // Will need modification to use loaded product ID
  initProductTabs();
});

/**
 * Initialize product image gallery
 */
function initProductGallery() {
  const mainImage = document.getElementById("main-product-image");
  const thumbnails = document.querySelectorAll(".thumbnail");

  if (!mainImage || !thumbnails.length) return;

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", function () {
      // Update main image source
      const imageSource = this.dataset.image;
      mainImage.src = imageSource;

      // Update active state
      thumbnails.forEach((thumb) => thumb.classList.remove("active"));
      this.classList.add("active");
    });
  });
}

/**
 * Initialize quantity selector
 */
function initQuantitySelector() {
  const minusBtn = document.querySelector(".quantity-btn.minus");
  const plusBtn = document.querySelector(".quantity-btn.plus");
  const quantityInput = document.querySelector(".quantity-input");

  if (!minusBtn || !plusBtn || !quantityInput) return;

  // Get max quantity from data attribute or stock level
  const maxQuantity = parseInt(quantityInput.getAttribute("max") || 10);

  minusBtn.addEventListener("click", function () {
    let currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });

  plusBtn.addEventListener("click", function () {
    let currentValue = parseInt(quantityInput.value);
    if (currentValue < maxQuantity) {
      quantityInput.value = currentValue + 1;
    }
  });

  // Validate direct input
  quantityInput.addEventListener("change", function () {
    let value = parseInt(this.value);

    if (isNaN(value) || value < 1) {
      this.value = 1;
    } else if (value > maxQuantity) {
      this.value = maxQuantity;
    }
  });
}

/**
 * Initialize product tabs
 */
function initProductTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  if (!tabButtons.length || !tabContents.length) return;

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to current button
      this.classList.add("active");

      // Show corresponding content
      const tabId = this.dataset.tab;
      const targetContent = document.getElementById(`${tabId}`);
      if (targetContent) {
        targetContent.classList.add("active");
      }
    });
  });
}

/**
 * Initialize add to cart functionality for the detail page
 */
function initAddToCart() {
  const addToCartBtn = document.querySelector(".product-actions .add-to-cart"); // More specific selector
  const quantityInput = document.querySelector(".quantity-input");

  if (!addToCartBtn || !quantityInput) return;

  addToCartBtn.addEventListener("click", function (e) {
    e.preventDefault();

    // Ensure product data is loaded and addToCart function exists
    if (
      !window.currentProduct ||
      !window.articonnect ||
      typeof window.articonnect.addToCart !== "function"
    ) {
      console.error("Product data not loaded or addToCart function missing.");
      alert("Erreur: Impossible d'ajouter le produit au panier.");
      return;
    }

    const quantity = parseInt(quantityInput.value);
    const variantSelect = document.querySelector("#finish"); // Assuming ID 'finish' for variant selector
    const variant = variantSelect ? variantSelect.value : null;

    // Prepare item to add
    const itemToAdd = {
      id: window.currentProduct.id,
      name: window.currentProduct.name,
      price: window.currentProduct.price,
      // Use first image from array or the main imageUrl
      imageUrl: window.currentProduct.images
        ? window.currentProduct.images[0]
        : window.currentProduct.imageUrl,
      quantity: quantity,
      variant: variant,
      // Link back to this specific product page
      detailUrl: window.location.pathname + window.location.search,
      stock: window.currentProduct.stock, // Pass stock info if available
    };

    // Use the global addToCart function
    window.articonnect.addToCart(itemToAdd);

    // Show confirmation feedback on the button
    const originalText = addToCartBtn.innerHTML;
    addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Ajouté';
    addToCartBtn.disabled = true;

    // Header count updates automatically via 'cartUpdated' event listener in cart.js

    // Restore button after a delay
    setTimeout(() => {
      addToCartBtn.innerHTML = originalText;
      addToCartBtn.disabled = false;
    }, 1500);
  });
}

// Removed dynamically added CSS for pulse animation.
// Ensure pulse animation CSS exists in a loaded CSS file (e.g., main.css or product_detail.css).
