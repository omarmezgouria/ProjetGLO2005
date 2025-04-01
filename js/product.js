/**
 * ArtiConnect - Products Page JavaScript
 * Handles functionality for the products catalog page
 */

// Données d'exemple de produits déplacées vers js/main.js et exposées via window.articonnect.sampleProducts

document.addEventListener("DOMContentLoaded", function () {
  // Afficher les produits initiaux
  renderProducts(sampleProducts); // Afficher d'abord les produits

  // Initialiser la fonctionnalité des filtres
  initFilters();

  // Initialiser le changement de vue (grille/liste)
  initViewSwitcher();

  // Initialiser le tri
  initSorting();

  // Initialiser l'ajout au panier en utilisant la délégation d'événements
  initDynamicActions();

  // Initialiser les filtres mobiles
  initMobileFilters();

  // Mettre à jour le compteur basé sur le rendu initial
  updateProductCount(sampleProducts.length);
});

/**
 * Render product cards into the grid
 * @param {Array} products - Array of product objects to render
 */
function renderProducts(products) {
  const productsGrid = document.querySelector(".products-grid");
  if (!productsGrid) return;

  // Effacer les produits existants (sauf les indicateurs de chargement potentiels)
  productsGrid.innerHTML = "";

  if (products.length === 0) {
    productsGrid.innerHTML = '<p class="no-products">Aucun produit trouvé.</p>';
    updateProductCount(0);
    return;
  }

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.dataset.productId = product.id; // Ajouter l'ID du produit pour un ciblage plus facile

    // Générer le HTML de la notation par étoiles
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

  // Mettre à jour le compteur après l'affichage
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

    // Gérer le clic sur le bouton Ajouter au panier
    const addToCartBtn = target.closest(".add-to-cart");
    if (addToCartBtn) {
      event.preventDefault();

      // Obtenir les informations du produit
      const productCard = addToCartBtn.closest(".product-card");
      const productId = parseInt(productCard?.dataset.productId); // S'assurer que l'ID est un nombre

      if (
        productId &&
        window.articonnect &&
        typeof window.articonnect.addToCart === "function"
      ) {
        // Trouver les données complètes du produit dans la liste globale
        const productData = window.articonnect.sampleProducts.find(
          (p) => p.id === productId
        );

        if (productData) {
          // Préparer l'article à ajouter (quantité par défaut 1 depuis la liste de produits)
          const itemToAdd = {
            id: productData.id,
            name: productData.name,
            price: productData.price,
            imageUrl: productData.imageUrl,
            quantity: 1, // Quantité par défaut lors de l'ajout depuis la liste
            variant: null, // Aucune variante sélectionnable sur la page de liste
            detailUrl: productData.detailUrl,
            stock: productData.stock, // Passer les informations de stock si disponibles
          };
          window.articonnect.addToCart(itemToAdd);
          console.log(`${productData.name} ajouté au panier`); // Remplacé showNotification
          // Le compteur de l'en-tête se met à jour automatiquement via l'écouteur d'événement 'cartUpdated' dans cart.js
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
      return; // Arrêter le traitement ultérieur si le bouton Ajouter au panier a été cliqué
    }
  });
}

// Note : Les lignes suivantes (263-271 dans l'état précédent) ont été supprimées
// car il s'agissait de fragments HTML dupliqués/mal placés par erreur.

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

  // Appliquer les filtres lorsque les cases à cocher sont modifiées
  if (filterOptions) {
    filterOptions.forEach((option) => {
      option.addEventListener("change", function () {
        applyFilters();
      });
    });
  }

  // Effacer tous les filtres
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", function () {
      // Décocher toutes les cases à cocher de filtre
      filterOptions.forEach((option) => {
        option.checked = false;
      });

      // Réinitialiser les entrées de prix
      if (minPriceInput) minPriceInput.value = "";
      if (maxPriceInput) maxPriceInput.value = "";

      applyFilters();
    });
  }

  // Appliquer le filtre de prix
  if (priceApplyBtn) {
    priceApplyBtn.addEventListener("click", function () {
      applyFilters();
    });
  }

  // Voir plus de catégories ou d'artisans
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
  // Dans une implémentation réelle, cela ferait probablement une requête AJAX au serveur
  // ou filtrer les produits sur place s'ils sont chargés côté client
  console.log("Filters applied");

  // À des fins de démonstration, simuler l'application du filtre avec un état de chargement
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
        // Retirer la classe active de toutes les options
        viewOptions.forEach((opt) => opt.classList.remove("active"));

        // Ajouter la classe active à l'option cliquée
        this.classList.add("active");

        // Définir le mode d'affichage
        const viewMode = this.dataset.view;

        if (viewMode === "grid") {
          productsContent.classList.add("view-grid");
          productsContent.classList.remove("view-list");
        } else if (viewMode === "list") {
          productsContent.classList.add("view-list");
          productsContent.classList.remove("view-grid");
        }

        // Enregistrer la préférence dans localStorage
        localStorage.setItem("articonnect_product_view", viewMode);
      });
    });

    // Définir la vue initiale en fonction de la préférence enregistrée
    const savedView = localStorage.getItem("articonnect_product_view");
    if (savedView) {
      // Syntaxe querySelector ajustée
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
      console.log(`Sorting by: ${sortValue}`); // Point-virgule ajouté

      // Dans une implémentation réelle, cela ferait une requête AJAX ou trierait sur place
      // À des fins de démonstration, simuler le tri avec un état de chargement
      const productsGrid = document.querySelector(".products-grid");
      if (productsGrid) {
        productsGrid.classList.add("loading");

        setTimeout(() => {
          productsGrid.classList.remove("loading");

          // Démo : Déplacer simplement quelques produits pour montrer que quelque chose s'est passé
          if (sortValue === "price-low" || sortValue === "price-high") {
            // Démo de tri par prix - déplacer simplement les articles
            const productCards = Array.from(
              document.querySelectorAll(".product-card")
            );
            if (productCards.length > 1) {
              // Déplacer le premier produit à la fin ou vice versa
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

// Fonction initFavorites supprimée car sa logique est maintenant dans initDynamicActions

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

  // Ouvrir les filtres mobiles
  mobileFiltesBtn.addEventListener("click", function () {
    mobileFiltersOverlay.classList.add("active");
    mobileFiltersContainer.classList.add("active");
    document.body.style.overflow = "hidden"; // Empêcher le défilement
  });

  // Fermer les filtres mobiles
  function closeMobileFilters() {
    mobileFiltersOverlay.classList.remove("active");
    mobileFiltersContainer.classList.remove("active");
    document.body.style.overflow = ""; // Activer le défilement
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMobileFilters);
  }

  mobileFiltersOverlay.addEventListener("click", closeMobileFilters);

  // Empêcher les clics à l'intérieur du conteneur de fermer
  mobileFiltersContainer.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // Bouton Appliquer les filtres en vue mobile
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

// Fonction initAddToCart supprimée car sa logique est maintenant dans initDynamicActions

/**
 * Update cart count in header
 */
function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");
  if (cartCount) {
    let count = parseInt(cartCount.textContent) || 0;
    count += 1;
    cartCount.textContent = count;

    // Ajouter une animation
    cartCount.classList.add("pulse");
    setTimeout(() => {
      cartCount.classList.remove("pulse");
    }, 500);
  }
}

// Fonction showNotification supprimée.

// CSS ajouté dynamiquement supprimé - styles déplacés vers css/pages/products.css
