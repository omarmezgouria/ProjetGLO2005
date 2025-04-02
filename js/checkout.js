/**
 * ArtiConnect - Checkout Page JavaScript
 * Handles functionality for the checkout process
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialiser les étapes de paiement
  initCheckoutSteps();

  // Initialiser la sélection d'adresse
  initAddressSelection();

  // Initialiser les onglets de méthode de paiement
  initPaymentTabs();

  // Initialiser la bascule d'adresse de facturation
  initBillingToggle();

  // Initialiser la validation du formulaire
  initFormValidation();

  // Initialiser la passation de commande
  initPlaceOrder();

  // Initialiser le résumé de la commande
  updateOrderSummary();
});

/**
 * Initialize checkout steps navigation
 */
function initCheckoutSteps() {
  const progressSteps = document.querySelectorAll(".progress-step");
  const nextButtons = document.querySelectorAll(".next-step");
  const prevButtons = document.querySelectorAll(".prev-step");

  if (!progressSteps.length) return;

  // Gérer les boutons d'étape suivante
  nextButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const currentSection = this.closest(".checkout-section");
      const nextSectionId = this.dataset.next;
      const nextSection = document.getElementById(nextSectionId);

      if (!currentSection || !nextSection) return;

      // Valider la section actuelle avant de continuer
      if (!validateSection(currentSection)) {
        showValidationError("Veuillez remplir tous les champs obligatoires");
        return;
      }

      // Masquer la section actuelle et afficher la suivante
      currentSection.classList.add("hidden");
      nextSection.classList.remove("hidden");

      // Mettre à jour les étapes de progression
      const currentStepNumber =
        parseInt(currentSection.id.split("-")[0].replace("step", "")) || 1;
      const nextStepNumber =
        parseInt(nextSection.id.split("-")[0].replace("step", "")) || 2;

      updateProgressSteps(nextStepNumber);

      // Faire défiler vers le haut de la section
      window.scrollTo({
        top: nextSection.offsetTop - 100,
        behavior: "smooth",
      });
    });
  });

  // Gérer les boutons d'étape précédente
  prevButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const currentSection = this.closest(".checkout-section");
      const prevSectionId = this.dataset.prev;
      const prevSection = document.getElementById(prevSectionId);

      if (!currentSection || !prevSection) return;

      // Masquer la section actuelle et afficher la précédente
      currentSection.classList.add("hidden");
      prevSection.classList.remove("hidden");

      // Mettre à jour les étapes de progression
      const prevStepNumber =
        parseInt(prevSection.id.split("-")[0].replace("step", "")) || 1;
      updateProgressSteps(prevStepNumber);

      // Faire défiler vers le haut de la section
      window.scrollTo({
        top: prevSection.offsetTop - 100,
        behavior: "smooth",
      });
    });
  });
}

/**
 * Update progress steps visual state
 * @param {number} activeStep - The active step number
 */
function updateProgressSteps(activeStep) {
  const progressSteps = document.querySelectorAll(".progress-step");
  const progressLines = document.querySelectorAll(".progress-line");

  progressSteps.forEach((step) => {
    const stepNumber = parseInt(step.dataset.step);

    if (stepNumber < activeStep) {
      step.classList.add("completed");
      step.classList.remove("active");
    } else if (stepNumber === activeStep) {
      step.classList.add("active");
      step.classList.remove("completed");
    } else {
      step.classList.remove("active", "completed");
    }
  });

  // Mettre à jour les lignes de progression
  if (progressLines.length) {
    progressLines.forEach((line, index) => {
      if (index + 1 < activeStep) {
        line.classList.add("completed");
      } else {
        line.classList.remove("completed");
      }
    });
  }
}

/**
 * Initialize address selection
 */
function initAddressSelection() {
  const addressCards = document.querySelectorAll(".address-card");
  const addressRadios = document.querySelectorAll(
    'input[name="delivery-address"]'
  );

  if (!addressCards.length || !addressRadios.length) return;

  addressRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      // Mettre à jour la carte d'adresse sélectionnée
      addressCards.forEach((card) => {
        const cardRadio = card.querySelector('input[type="radio"]');
        if (cardRadio === this) {
          card.classList.add("selected");
        } else {
          card.classList.remove("selected");
        }
      });
    });
  });

  // Initialiser les boutons d'édition d'adresse
  const editButtons = document.querySelectorAll(".edit-address-btn");
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Dans une implémentation réelle, cela ouvrirait une modale d'édition d'adresse
      alert(
        "Édition d'adresse - Cette fonctionnalité serait implémentée dans la version finale"
      );
    });
  });

  // Initialiser le bouton d'ajout d'adresse
  const addAddressBtn = document.querySelector(".add-address-btn");
  if (addAddressBtn) {
    addAddressBtn.addEventListener("click", function () {
      // Dans une implémentation réelle, cela ouvrirait une modale d'ajout d'adresse
      alert(
        "Ajout d'adresse - Cette fonctionnalité serait implémentée dans la version finale"
      );
    });
  }
}

/**
 * Initialize payment method tabs
 */
function initPaymentTabs() {
  const paymentTabs = document.querySelectorAll(".payment-tab");
  const paymentContents = document.querySelectorAll(".payment-content");

  if (!paymentTabs.length || !paymentContents.length) return;

  paymentTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const paymentMethod = this.dataset.method;

      // Mettre à jour l'onglet actif
      paymentTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      // Afficher le contenu correspondant
      paymentContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === `${paymentMethod}-payment`) {
          content.classList.add("active");
        }
      });
    });
  });
}

/**
 * Initialize billing address toggle
 */
function initBillingToggle() {
  const sameAddressCheckbox = document.getElementById("same-address");
  const differentBillingSection = document.querySelector(".different-billing");

  if (!sameAddressCheckbox || !differentBillingSection) return;

  sameAddressCheckbox.addEventListener("change", function () {
    if (this.checked) {
      differentBillingSection.classList.add("hidden");
    } else {
      differentBillingSection.classList.remove("hidden");
    }
  });
}

/**
 * Initialize form validation
 */
function initFormValidation() {
  // Validation du formulaire de carte de crédit
  const cardNumberInput = document.getElementById("card-number");
  const cardExpiryInput = document.getElementById("card-expiry");
  const cardCvcInput = document.getElementById("card-cvc");
  const cardNameInput = document.getElementById("card-name");

  if (cardNumberInput) {
    cardNumberInput.addEventListener("input", function (e) {
      // Formater le numéro de carte avec des espaces
      let value = this.value.replace(/\s+/g, "");
      let formattedValue = "";

      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += " ";
        }
        formattedValue += value[i];
      }

      this.value = formattedValue;

      // Valider le numéro de carte (une vérification simple de Luhn serait ici dans une implémentation réelle)
    });
  }

  if (cardExpiryInput) {
    cardExpiryInput.addEventListener("input", function (e) {
      // Formater en MM/AA
      let value = this.value.replace(/[^0-9]/g, "");

      if (value.length > 2) {
        this.value = value.substring(0, 2) + "/" + value.substring(2, 4);
      } else {
        this.value = value;
      }
    });
  }

  if (cardCvcInput) {
    cardCvcInput.addEventListener("input", function (e) {
      // Autoriser uniquement les chiffres, max 4 chiffres
      this.value = this.value.replace(/[^0-9]/g, "").substring(0, 4);
    });
  }

  // Sélection de la méthode d'expédition
  const shippingOptions = document.querySelectorAll(".shipping-option input");
  if (shippingOptions.length) {
    shippingOptions.forEach((option) => {
      option.addEventListener("change", function () {
        updateOrderSummary();
      });
    });
  }
}

/**
 * Validate checkout section using the global validation utility.
 * @param {HTMLElement} section - Section to validate (or the form within it).
 * @returns {boolean} - True if valid.
 */
function validateSection(section) {
  if (
    !window.articonnect ||
    typeof window.articonnect.validateForm !== "function"
  ) {
    console.error("validateForm utility not found.");
    // Solution de repli vers la vérification de base des champs requis si l'utilitaire est manquant
    const requiredFields = section.querySelectorAll(
      "input[required], select[required]"
    );
    let fallbackValid = true;
    requiredFields.forEach((field) => {
      if (!field.value.trim()) fallbackValid = false;
    });
    return fallbackValid;
  }

  let rules = {};
  let formToValidate = section; // Supposer que la section elle-même est le formulaire ou contient directement les entrées pertinentes

  // Définir les règles en fonction de l'ID de la section
  if (section.id === "delivery-section") {
    // En supposant que les entrées pour une *nouvelle* adresse pourraient être ajoutées dynamiquement et avoir des noms
    // Pour l'instant, nous vérifierons simplement si une méthode d'expédition est sélectionnée
    const shippingSelected = section.querySelector(
      'input[name="shipping-method"]:checked'
    );
    if (!shippingSelected) {
      showValidationError("Veuillez sélectionner une méthode de livraison.");
      return false; // Cas spécial non géré par le validateur générique
    }
    // Ajouter des règles pour les champs de *nouvelle* adresse s'ils existent et sont visibles
    // Example: rules.newAddressName = { required: true, minLength: 2 };
  } else if (section.id === "payment-section") {
    const activePaymentMethod = section.querySelector(".payment-tab.active")
      ?.dataset.method;

    if (activePaymentMethod === "card") {
      formToValidate = section.querySelector("#card-payment"); // Valider les entrées dans la div de paiement par carte
      if (!formToValidate) return true; // Ne devrait pas arriver, mais prévient les erreurs

      rules = {
        "card-number": {
          required: true,
          pattern: /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
          patternMessage: "Numéro de carte invalide (16 chiffres attendus)",
        },
        "card-expiry": {
          required: true,
          pattern: /^(0[1-9]|1[0-2])\s?\/\s?(\d{2})$/,
          patternMessage: "Format MM/AA invalide",
        },
        "card-cvc": {
          required: true,
          pattern: /^\d{3,4}$/,
          patternMessage: "Code CVC invalide (3 ou 4 chiffres)",
        },
        "card-name": { required: true, minLength: 2 },
      };
    } else if (
      activePaymentMethod === "paypal" ||
      activePaymentMethod === "apple-pay"
    ) {
      // Aucun champ de formulaire à valider pour ces méthodes dans cette simulation
      return true;
    }

    // Ajouter la validation de l'adresse de facturation si 'different-billing' est visible
    const billingCheckbox = section.querySelector("#same-address");
    const differentBillingSection = section.querySelector(".different-billing");
    if (
      billingCheckbox &&
      !billingCheckbox.checked &&
      differentBillingSection &&
      !differentBillingSection.classList.contains("hidden")
    ) {
      // Ajouter les règles pour les champs d'adresse de facturation ici
      // Example: rules.billingName = { required: true };
    }
  }

  // Effectuer la validation en utilisant l'utilitaire global
  const isValid = window.articonnect.validateForm(formToValidate, rules);

  // Faire défiler jusqu'au premier champ invalide si la validation échoue
  if (!isValid) {
    const firstInvalid = formToValidate.querySelector(".is-invalid");
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return isValid;
}

/**
 * Initialize order placement simulation
 */
function initPlaceOrder() {
  const placeOrderBtn = document.getElementById("place-order-btn");

  if (!placeOrderBtn) return;

  placeOrderBtn.addEventListener("click", function (e) {
    e.preventDefault();

    // Valider d'abord la section de paiement
    const paymentSection = document.getElementById("payment-section");
    if (!validateSection(paymentSection)) {
      // Message d'erreur affiché par validateSection
      return;
    }

    // Désactiver le bouton et afficher l'état de chargement
    this.disabled = true;
    this.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Traitement en cours...';

    // --- Simuler le traitement de la commande ---
    setTimeout(() => {
      try {
        // 1. Obtenir les articles du panier
        const cartItems = window.articonnect.getCart();
        if (cartItems.length === 0) {
          alert("Votre panier est vide.");
          throw new Error("Cart is empty"); // Arrêter le traitement
        }

        // 2. Obtenir le total final (recalculer en fonction du résumé)
        const totalValueElement = document.querySelector(
          ".summary-row.total .summary-value"
        );
        const finalTotal =
          parseFloat(
            totalValueElement?.textContent
              ?.replace(/[^0-9.,]/g, "")
              .replace(",", ".")
          ) || 0;
        if (finalTotal <= 0 && cartItems.length > 0) {
          // Autoriser un total nul si le panier contient des articles (par ex., remise de 100%)
          console.warn("Order total is zero or less, but cart has items.");
        } else if (finalTotal <= 0) {
          alert("Impossible de passer une commande avec un total nul.");
          throw new Error("Order total is zero");
        }

        // 3. Obtenir les informations utilisateur (depuis localStorage)
        const userString = localStorage.getItem("articonnect_user");
        const user = userString
          ? JSON.parse(userString)
          : { name: "Guest", email: "guest@example.com" }; // Solution de repli pour le paiement invité

        // 4. Obtenir les adresses sélectionnées & l'expédition
        const selectedAddressCard = document.querySelector(
          ".address-card.selected .address-details"
        );
        const deliveryAddress = selectedAddressCard
          ? selectedAddressCard.innerText
          : "Non spécifiée"; // Représentation textuelle simple
        const selectedShipping = document.querySelector(
          ".shipping-option input:checked"
        );
        const shippingMethod =
          selectedShipping
            ?.closest(".shipping-option")
            ?.querySelector(".option-title")?.textContent || "Standard";
        const shippingCostText =
          selectedShipping
            ?.closest(".shipping-option")
            ?.querySelector(".option-price")?.textContent || "0";
        const shippingCost =
          parseFloat(
            shippingCostText.replace(/[^0-9.,]/g, "").replace(",", ".")
          ) || 0;

        // 5. Créer l'objet Commande
        const orderId =
          "AC-" + Date.now() + "-" + Math.floor(100 + Math.random() * 900); // ID unique simple
        const order = {
          id: orderId,
          date: new Date().toISOString(),
          user: { name: user.name, email: user.email },
          items: cartItems,
          deliveryAddress: deliveryAddress.replace(/\n+/g, ", "), // Formater la chaîne d'adresse
          shippingMethod: shippingMethod,
          shippingCost: shippingCost,
          subtotal: window.articonnect.getCartSubtotal(),
          discount: 0, // Promo code logic removed
          discountType: null, // Promo code logic removed
          total: finalTotal,
          status: "Completed", // La simulation suppose un succès
        };

        // 6. Enregistrer la commande dans localStorage (ajouter aux commandes existantes)
        const ordersJson = localStorage.getItem("articonnect_orders");
        const orders = ordersJson ? JSON.parse(ordersJson) : [];
        orders.push(order);
        localStorage.setItem("articonnect_orders", JSON.stringify(orders));
        console.log("Order saved:", order);

        // 7. Vider le panier
        window.articonnect.clearCart();
        window.appliedPromo = null; // Effacer le code promo appliqué

        // 8. Rediriger vers la page de confirmation
        window.location.href = `order_confirmation.html?orderId=${orderId}`;
      } catch (error) {
        console.error("Error placing order:", error);
        alert(
          "Une erreur est survenue lors du traitement de votre commande. Veuillez réessayer."
        );
        // Restaurer l'état du bouton en cas d'erreur
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = "Commander";
      }
    }, 1500); // Délai plus court pour la simulation
  });
}

/**
 * Update order summary based on cart content and selections.
 */
function updateOrderSummary() {
  const cart = window.articonnect?.getCart ? window.articonnect.getCart() : [];
  const summaryProductsContainer = document.querySelector(".summary-products");
  const subtotalValueElement = document.querySelector(
    ".summary-totals .summary-row.subtotal .summary-value"
  );
  const shippingValueElement = document.querySelector(
    ".summary-totals .summary-row.shipping .summary-value"
  );
  const discountRow = document.querySelector(
    ".summary-totals .summary-row.discount"
  );
  const discountValueElement = discountRow?.querySelector(".summary-value");
  const totalValueElement = document.querySelector(
    ".summary-totals .summary-row.total .summary-value"
  );

  if (
    !summaryProductsContainer ||
    !subtotalValueElement ||
    !shippingValueElement ||
    !totalValueElement
  ) {
    console.error("Order summary elements not found.");
    return;
  }

  // 1. Afficher les produits du résumé
  summaryProductsContainer.innerHTML = ""; // Effacer l'existant
  cart.forEach((item) => {
    const productDiv = document.createElement("div");
    productDiv.className = "summary-product";
    productDiv.innerHTML = `
            <div class="product-image">
                <img src="${
                  item.imageUrl || "../../images/placeholder.png"
                }" alt="${item.name}">
                <span class="product-quantity">${item.quantity}</span>
            </div>
            <div class="product-details">
                <h3 class="product-title">${item.name}</h3>
                ${
                  item.variant
                    ? `<p class="product-variant">Variant: ${item.variant}</p>`
                    : ""
                }
                <p class="product-price">${formatPrice(
                  item.price * item.quantity
                )}</p>
            </div>
        `;
    summaryProductsContainer.appendChild(productDiv);
  });

  // 2. Calculer le sous-total
  const subtotal = window.articonnect?.getCartSubtotal
    ? window.articonnect.getCartSubtotal()
    : 0;
  subtotalValueElement.textContent = formatPrice(subtotal);

  // 3. Calculer la remise (en utilisant une logique similaire à cart.js)
  let discount = 0;
  const appliedPromo = window.appliedPromo || { type: "percent", value: 0 }; // Obtenir les informations du code promo appliqué
  if (discountRow && discountValueElement && subtotal > 0) {
    if (appliedPromo.type === "percent" && appliedPromo.value > 0) {
      discount = subtotal * (appliedPromo.value / 100);
      discountValueElement.textContent = `-${formatPrice(discount)} (${
        appliedPromo.value
      }%)`;
      discountRow.style.display = "";
    } else if (appliedPromo.type === "fixed" && appliedPromo.value > 0) {
      discount = Math.min(appliedPromo.value, subtotal);
      discountValueElement.textContent = `-${formatPrice(discount)}`;
      discountRow.style.display = "";
    } else {
      discount = 0;
      discountRow.style.display = "none";
    }
  } else if (discountRow) {
    discountRow.style.display = "none"; // Masquer si le sous-total est 0 ou si la ligne n'existe pas
  }

  // 4. Obtenir le coût d'expédition sélectionné
  const selectedShipping = document.querySelector(
    ".shipping-option input:checked"
  );
  let shippingCost = 0;
  if (selectedShipping) {
    const shippingPriceText =
      selectedShipping
        .closest(".shipping-option")
        ?.querySelector(".option-price")?.textContent || "0";
    shippingCost =
      parseFloat(
        shippingPriceText.replace(/[^0-9.,]/g, "").replace(",", ".")
      ) || 0;
  }
  shippingValueElement.textContent =
    shippingCost > 0 ? formatPrice(shippingCost) : "Gratuit";

  // 5. Calculer et mettre à jour le total
  const total = Math.max(0, subtotal - discount + shippingCost);
  totalValueElement.textContent = formatPrice(total);
}

/**
 * Format price with currency
 * @param {number} price - Price to format
 * @returns {string} - Formatted price
 */
function formatPrice(price) {
  return price.toFixed(2).replace(".", ",") + " €";
}

/**
 * Show validation error message
 * @param {string} message - Error message to display
 */
function showValidationError(message) {
  // Supprimer tous les messages d'erreur existants
  const existingErrors = document.querySelectorAll(".checkout-error");
  existingErrors.forEach((error) => error.remove());

  // Créer un message d'erreur
  const errorElement = document.createElement("div");
  errorElement.className = "checkout-error";
  errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

  // Insérer en haut de la section actuelle
  const currentSection = document.querySelector(
    ".checkout-section:not(.hidden)"
  );
  if (currentSection) {
    currentSection.insertBefore(errorElement, currentSection.firstChild);

    // Faire défiler jusqu'à l'erreur
    errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Supprimer automatiquement l'erreur après 5 secondes
  setTimeout(() => {
    if (errorElement.parentNode) {
      errorElement.classList.add("fading");
      setTimeout(() => errorElement.remove(), 300);
    }
  }, 5000);
}
