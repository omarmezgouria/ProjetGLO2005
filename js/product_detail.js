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
    // Optionnellement, afficher un message d'erreur sur la page
    document.querySelector(".product-detail-page .container").innerHTML =
      '<p class="error-message">Produit non trouvé. ID invalide ou manquant.</p>';
    return;
  }

  const product = window.articonnect.sampleProducts.find(
    (p) => p.id === productId
  );

  if (!product) {
    console.error(`Product with ID ${productId} not found`);
    // Optionnellement, afficher un message d'erreur sur la page
    document.querySelector(".product-detail-page .container").innerHTML =
      '<p class="error-message">Produit non trouvé.</p>';
    return;
  }

  // --- Remplir les éléments de la page ---

  // Titre de la page
  document.title = `ArtiConnect - ${product.name}`;

  // Fil d'Ariane
  const breadcrumbCurrent = document.querySelector(".breadcrumb .current");
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = product.name;
  // TODO : Mettre à jour le lien de catégorie dans le fil d'Ariane si nécessaire

  // Galerie
  const mainImage = document.getElementById("main-product-image");
  if (mainImage) {
    mainImage.src = product.images ? product.images[0] : product.imageUrl; // Utiliser la première image ou celle par défaut
    mainImage.alt = product.name;
  }
  const thumbnailGallery = document.querySelector(".thumbnail-gallery");
  if (thumbnailGallery) {
    thumbnailGallery.innerHTML = ""; // Effacer les miniatures existantes
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
      // Masquer la galerie si une seule image
      thumbnailGallery.style.display = "none";
    }
  }

  // Informations sur le produit
  const titleElement = document.querySelector(".product-info .product-title");
  if (titleElement) titleElement.textContent = product.name;

  const artisanLink = document.querySelector(".artisan-info a");
  if (artisanLink) artisanLink.textContent = product.artisan;
  // TODO : Mettre à jour l'avatar de l'artisan et le href du lien si nécessaire

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
      product.description.substring(0, 150) + "..."; // Tronquer pour la description courte

  // Quantité maximale d'entrée
  const quantityInput = document.querySelector(".quantity-input");
  if (quantityInput) quantityInput.max = product.stock > 0 ? product.stock : 1;

  // Contenu de l'onglet
  const descriptionContent = document.querySelector(
    "#description .description-content"
  );
  if (descriptionContent) {
    // Remplissage plus détaillé de la description
    descriptionContent.querySelector(
      "h2"
    ).textContent = `À propos de ${product.name}`;
    // En supposant que product.description contient le texte complet
    const paragraphs = product.description.split("\n\n"); // Séparation simple, ajuster si nécessaire
    descriptionContent.querySelectorAll("p").forEach((p, index) => {
      if (paragraphs[index]) {
        p.textContent = paragraphs[index];
      } else {
        p.remove(); // Supprimer les paragraphes de modèle supplémentaires
      }
    });
  }

  const specsContent = document.querySelector("#specifications .specs-grid");
  if (specsContent && product.specs) {
    // Effacer les spécifications de modèle existantes
    specsContent.innerHTML = "";
    // Remplir en fonction de l'objet product.specs
    for (const groupName in product.specs) {
      const specGroupDiv = document.createElement("div");
      specGroupDiv.className = "spec-group";
      const title = document.createElement("h3");
      // Capitalisation simple pour le nom du groupe
      title.textContent =
        groupName.charAt(0).toUpperCase() + groupName.slice(1);
      specGroupDiv.appendChild(title);

      const list = document.createElement("ul");
      list.className = "spec-list";
      // En supposant que specs[groupName] est un objet ou une chaîne
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

  // TODO : Remplir l'onglet Artisan

  // Stocker le produit actuel globalement pour d'autres fonctions sur cette page
  window.currentProduct = product;
}

document.addEventListener("DOMContentLoaded", function () {
  // Charger d'abord les données du produit
  loadProductDetails();

  // Initialiser les composants UI après le chargement potentiel des données
  initProductGallery();
  initQuantitySelector();
  initAddToCart(); // Nécessitera une modification pour utiliser l'ID de produit chargé
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
      // Mettre à jour la source de l'image principale
      const imageSource = this.dataset.image;
      mainImage.src = imageSource;

      // Mettre à jour l'état actif
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

  // Obtenir la quantité maximale à partir de l'attribut de données ou du niveau de stock
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

  // Valider l'entrée directe
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
      // Retirer la classe active de tous les boutons et contenus
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Ajouter la classe active au bouton actuel
      this.classList.add("active");

      // Afficher le contenu correspondant
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
  const addToCartBtn = document.querySelector(".product-actions .add-to-cart"); // Sélecteur plus spécifique
  const quantityInput = document.querySelector(".quantity-input");

  if (!addToCartBtn || !quantityInput) return;

  addToCartBtn.addEventListener("click", function (e) {
    e.preventDefault();

    // S'assurer que les données du produit sont chargées et que la fonction addToCart existe
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
    const variantSelect = document.querySelector("#finish"); // En supposant l'ID 'finish' pour le sélecteur de variante
    const variant = variantSelect ? variantSelect.value : null;

    // Préparer l'article à ajouter
    const itemToAdd = {
      id: window.currentProduct.id,
      name: window.currentProduct.name,
      price: window.currentProduct.price,
      // Utiliser la première image du tableau ou l'imageUrl principale
      imageUrl: window.currentProduct.images
        ? window.currentProduct.images[0]
        : window.currentProduct.imageUrl,
      quantity: quantity,
      variant: variant,
      // Lien retour vers cette page produit spécifique
      detailUrl: window.location.pathname + window.location.search,
      stock: window.currentProduct.stock, // Passer les informations de stock si disponibles
    };

    // Utiliser la fonction globale addToCart
    window.articonnect.addToCart(itemToAdd);

    // Afficher un retour de confirmation sur le bouton
    const originalText = addToCartBtn.innerHTML;
    addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Ajouté';
    addToCartBtn.disabled = true;

    // Le compteur de l'en-tête se met à jour automatiquement via l'écouteur d'événement 'cartUpdated' dans cart.js

    // Restaurer le bouton après un délai
    setTimeout(() => {
      addToCartBtn.innerHTML = originalText;
      addToCartBtn.disabled = false;
    }, 1500);
  });
}

// CSS ajouté dynamiquement pour l'animation de pulsation supprimé.
// S'assurer que le CSS de l'animation de pulsation existe dans un fichier CSS chargé (par ex., main.css ou product_detail.css).
