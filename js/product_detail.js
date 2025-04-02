/**
 * ArtiConnect - Product Detail Page JavaScript
 * Handles functionality for the product detail page
 */

// Define the base URL for the API (ensure this is consistent)
const API_BASE_URL = "http://127.0.0.1:5000/api"; // Adjust if needed

/**
 * Fetches and loads product details from the API based on URL parameter
 */
async function loadProductDetails() {
  // Assume window.articonnect.getUrlParameter exists
  const getUrlParameter =
    window.articonnect?.getUrlParameter ||
    function (name) {
      const params = new URLSearchParams(window.location.search);
      return params.get(name);
    };

  const productId = parseInt(getUrlParameter("id"));
  const container = document.querySelector(".product-detail-page .container"); // Get container for error messages

  if (isNaN(productId)) {
    console.error("Invalid or missing product ID in URL");
    if (container)
      container.innerHTML =
        '<p class="error-message">Produit non trouvé. ID invalide ou manquant.</p>';
    return; // Stop execution
  }

  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);

    if (!response.ok) {
      // Handle non-successful responses (like 404 Not Found)
      const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty object
      console.error(
        `Error fetching product ${productId}: ${response.status} ${response.statusText}`,
        errorData
      );
      if (container)
        container.innerHTML = `<p class="error-message">Produit non trouvé (ID: ${productId}). ${
          errorData.error || ""
        }</p>`;
      return; // Stop execution
    }

    const product = await response.json(); // Parse the successful JSON response

    if (!product) {
      // Should be caught by !response.ok, but as a fallback
      console.error(`Product data empty for ID ${productId}`);
      if (container)
        container.innerHTML =
          '<p class="error-message">Données du produit non trouvées.</p>';
      return;
    }

    // Store product globally for other functions (like add to cart)
    window.currentProduct = product;

    // --- Populate page elements using fetched data ---
    populatePage(product);

    // --- Initialize UI components AFTER data is loaded ---
    initProductGallery();
    initQuantitySelector();
    initAddToCart();
    initProductTabs();
  } catch (error) {
    console.error(`Network error fetching product ${productId}:`, error);
    if (container)
      container.innerHTML =
        '<p class="error-message">Erreur réseau lors du chargement du produit. Veuillez réessayer.</p>';
  }
}

/**
 * Populates the HTML elements with the fetched product data
 * @param {object} product - The product data object from the API
 */
function populatePage(product) {
  // Titre de la page
  document.title = `ArtiConnect - ${product.name}`;

  // Fil d'Ariane
  const breadcrumbCurrent = document.querySelector(".breadcrumb .current");
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = product.name;
  // TODO: Update category link in breadcrumb if needed, using product.category

  // Galerie (Assuming API provides imageUrl, maybe an array later)
  const mainImage = document.getElementById("main-product-image");
  if (mainImage) {
    mainImage.src = product.imageUrl || "../images/placeholder.jpg"; // Use API image or placeholder
    mainImage.alt = product.name;
  }
  const thumbnailGallery = document.querySelector(".thumbnail-gallery");
  if (thumbnailGallery) {
    thumbnailGallery.innerHTML = ""; // Clear existing thumbnails
    // TODO: Adapt if API provides multiple images in an array (e.g., product.images)
    // For now, hide if only one image
    thumbnailGallery.style.display = "none";
  }

  // Informations sur le produit
  const titleElement = document.querySelector(".product-info .product-title");
  if (titleElement) titleElement.textContent = product.name;

  const artisanLink = document.querySelector(".artisan-info a");
  const artisanNameElement = document.querySelector(
    ".artisan-info .artisan-name"
  ); // Assuming separate element for name
  if (product.artisan) {
    if (artisanLink) {
      artisanLink.href = `../artisan/profile.html?id=${product.artisan.id}`; // TODO: Verify artisan profile page URL
      // Maybe set avatar here too if available: artisanLink.querySelector('img').src = product.artisan.photo_url || default_avatar;
    }
    if (artisanNameElement)
      artisanNameElement.textContent =
        product.artisan.nom_entreprise ||
        `${product.artisan.prenom || ""} ${product.artisan.nom}`;
  } else {
    // Hide or show default artisan info
    const artisanInfoDiv = document.querySelector(".artisan-info");
    if (artisanInfoDiv) artisanInfoDiv.style.display = "none";
  }

  const priceElement = document.querySelector(".product-info .product-price");
  if (priceElement)
    priceElement.textContent = `${product.price
      .toFixed(2)
      .replace(".", ",")} €`;

  // Rating (Assuming API doesn't provide rating yet, hide or show default)
  const ratingElement = document.querySelector(".product-rating");
  if (ratingElement) ratingElement.style.display = "none"; // Hide for now
  // TODO: Update rating display when API provides rating data

  // Availability
  const availabilityElement = document.querySelector(".product-availability");
  if (availabilityElement) {
    if (
      product.type === "produit" &&
      product.stock !== null &&
      product.stock > 0
    ) {
      availabilityElement.className = "product-availability in-stock";
      availabilityElement.innerHTML = `<i class="fas fa-check-circle"></i> En stock (${
        product.stock
      } disponible${product.stock > 1 ? "s" : ""})`;
    } else if (
      product.type === "produit" &&
      (product.stock === null || product.stock <= 0)
    ) {
      availabilityElement.className = "product-availability out-of-stock";
      availabilityElement.innerHTML = `<i class="fas fa-times-circle"></i> Hors stock`;
    } else if (product.type === "service") {
      availabilityElement.className = "product-availability service";
      availabilityElement.innerHTML = `<i class="fas fa-calendar-check"></i> Service (Vérifier disponibilité)`; // Or similar text
    } else {
      availabilityElement.style.display = "none"; // Hide if type unknown or stock irrelevant
    }
  }

  // Short Description
  const shortDescElement = document.querySelector(
    ".product-short-description p"
  );
  if (shortDescElement) {
    shortDescElement.textContent = product.description
      ? product.description.substring(0, 150) +
        (product.description.length > 150 ? "..." : "")
      : "";
  }

  // Quantity Input Max (only relevant for products with stock)
  const quantityInput = document.querySelector(".quantity-input");
  if (quantityInput) {
    if (
      product.type === "produit" &&
      product.stock !== null &&
      product.stock > 0
    ) {
      quantityInput.max = product.stock;
      quantityInput.parentElement.style.display = ""; // Show quantity selector
    } else {
      quantityInput.parentElement.style.display = "none"; // Hide quantity for services or out-of-stock
    }
  }

  // Tab Content: Description
  const descriptionContent = document.querySelector(
    "#description .description-content"
  );
  if (descriptionContent) {
    const descTitle = descriptionContent.querySelector("h2");
    if (descTitle) descTitle.textContent = `À propos de ${product.name}`;
    // Replace existing paragraphs or create new ones
    const descParas = descriptionContent.querySelectorAll("p");
    descParas.forEach((p) => p.remove()); // Remove template paragraphs
    const descDiv = document.createElement("div");
    // Basic handling of newlines, could be improved with markdown parser later
    descDiv.innerHTML = product.description
      ? product.description.replace(/\n/g, "<br>")
      : "Aucune description disponible.";
    descriptionContent.appendChild(descDiv);
  }

  // Tab Content: Specifications (Assuming API doesn't provide specs yet)
  const specsContent = document.querySelector("#specifications .specs-grid");
  if (specsContent)
    specsContent.innerHTML =
      "<p>Aucune spécification technique disponible.</p>"; // Placeholder
  // TODO: Populate specs when API provides them

  // Tab Content: Artisan (Populate with fetched artisan info)
  const artisanTabContent = document.querySelector(
    "#artisan-info .artisan-tab-content"
  );
  if (artisanTabContent && product.artisan) {
    artisanTabContent.innerHTML = `
            <div class="artisan-tab-header">
                <img src="${
                  product.artisan.photo_url || "../images/default-avatar.png"
                }" alt="Artisan ${
      product.artisan.nom
    }" class="artisan-tab-avatar">
                <h3>${
                  product.artisan.nom_entreprise ||
                  `${product.artisan.prenom || ""} ${product.artisan.nom}`
                }</h3>
                </div>
            <p>${product.artisan.bio || "Aucune biographie disponible."}</p>
            <a href="../artisan/profile.html?id=${
              product.artisan.id
            }" class="btn btn-secondary">Voir le profil de l'artisan</a>
            `;
    // TODO: Add more artisan details if needed (website, etc.)
  } else if (artisanTabContent) {
    artisanTabContent.innerHTML =
      "<p>Informations sur l'artisan non disponibles.</p>";
  }

  // Tab Content: Reviews (Placeholder)
  const reviewsContent = document.querySelector("#reviews .reviews-list");
  if (reviewsContent)
    reviewsContent.innerHTML = "<p>Aucun avis pour le moment.</p>"; // Placeholder
  // TODO: Fetch and display reviews separately if needed
}

document.addEventListener("DOMContentLoaded", function () {
  // Load product details from API - this now handles subsequent initializations
  loadProductDetails();
});

/**
 * Initialize product image gallery (Keep as is, assuming structure remains)
 */
function initProductGallery() {
  const mainImage = document.getElementById("main-product-image");
  const thumbnails = document.querySelectorAll(".thumbnail");

  if (!mainImage || !thumbnails.length) return;

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", function () {
      const imageSource = this.dataset.image;
      mainImage.src = imageSource;
      thumbnails.forEach((thumb) => thumb.classList.remove("active"));
      this.classList.add("active");
    });
  });
}

/**
 * Initialize quantity selector (Keep as is, max value set during populatePage)
 */
function initQuantitySelector() {
  const minusBtn = document.querySelector(".quantity-btn.minus");
  const plusBtn = document.querySelector(".quantity-btn.plus");
  const quantityInput = document.querySelector(".quantity-input");

  if (!minusBtn || !plusBtn || !quantityInput) return;

  const maxQuantity = parseInt(quantityInput.getAttribute("max") || 1); // Default to 1 if max not set

  minusBtn.addEventListener("click", function () {
    let currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });

  plusBtn.addEventListener("click", function () {
    let currentValue = parseInt(quantityInput.value);
    // Use the maxQuantity derived from stock
    if (currentValue < maxQuantity) {
      quantityInput.value = currentValue + 1;
    }
  });

  quantityInput.addEventListener("change", function () {
    let value = parseInt(this.value);
    const currentMax = parseInt(this.getAttribute("max") || 1); // Re-check max on change

    if (isNaN(value) || value < 1) {
      this.value = 1;
    } else if (value > currentMax) {
      this.value = currentMax;
    }
  });
}

/**
 * Initialize product tabs (Keep as is)
 */
function initProductTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  if (!tabButtons.length || !tabContents.length) return;

  // Ensure first tab is active by default if none are
  if (!document.querySelector(".tab-btn.active") && tabButtons.length > 0) {
    tabButtons[0].classList.add("active");
    const firstTabId = tabButtons[0].dataset.tab;
    const firstTabContent = document.getElementById(firstTabId);
    if (firstTabContent) firstTabContent.classList.add("active");
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));
      this.classList.add("active");
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
  const addToCartBtn = document.querySelector(".product-actions .add-to-cart");
  const quantityInput = document.querySelector(".quantity-input");

  if (!addToCartBtn) return; // Quantity input might be hidden for services

  addToCartBtn.addEventListener("click", function (e) {
    e.preventDefault();

    // Ensure product data is loaded and addToCart function exists
    if (!window.currentProduct || !window.articonnect?.addToCart) {
      console.error("Product data not loaded or addToCart function missing.");
      alert("Erreur: Impossible d'ajouter le produit au panier.");
      return;
    }

    // Get quantity only if input is visible/relevant
    const quantity =
      quantityInput && quantityInput.offsetParent !== null
        ? parseInt(quantityInput.value)
        : 1; // Default to 1 if hidden

    // Prepare item using data fetched from API
    const itemToAdd = {
      id: window.currentProduct.id,
      name: window.currentProduct.name,
      price: window.currentProduct.price,
      imageUrl: window.currentProduct.imageUrl || "../images/placeholder.jpg",
      quantity: quantity,
      variant: null, // Add variant logic if/when implemented
      detailUrl: window.location.pathname + window.location.search,
      stock: window.currentProduct.stock, // Pass stock info
      type: window.currentProduct.type, // Pass type
    };

    // Use the global addToCart function (assumed to exist in main.js or cart.js)
    window.articonnect.addToCart(itemToAdd);

    // --- Button Feedback ---
    const originalText = addToCartBtn.innerHTML;
    addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Ajouté';
    addToCartBtn.disabled = true;

    // Restore button after delay
    setTimeout(() => {
      // Check if button still exists before restoring
      const currentBtn = document.querySelector(
        ".product-actions .add-to-cart"
      );
      if (currentBtn) {
        currentBtn.innerHTML = originalText;
        currentBtn.disabled = false;
      }
    }, 1500);
  });
}

// Ensure CSS for animations/styles exists elsewhere
