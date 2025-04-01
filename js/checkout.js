/**
 * ArtiConnect - Checkout Page JavaScript
 * Handles functionality for the checkout process
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize checkout steps
  initCheckoutSteps();

  // Initialize address selection
  initAddressSelection();

  // Initialize payment method tabs
  initPaymentTabs();

  // Initialize billing address toggle
  initBillingToggle();

  // Initialize form validation
  initFormValidation();

  // Initialize order placement
  initPlaceOrder();

  // Initialize order summary
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

  // Handle next step buttons
  nextButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const currentSection = this.closest(".checkout-section");
      const nextSectionId = this.dataset.next;
      const nextSection = document.getElementById(nextSectionId);

      if (!currentSection || !nextSection) return;

      // Validate current section before proceeding
      if (!validateSection(currentSection)) {
        showValidationError("Veuillez remplir tous les champs obligatoires");
        return;
      }

      // Hide current section and show next
      currentSection.classList.add("hidden");
      nextSection.classList.remove("hidden");

      // Update progress steps
      const currentStepNumber =
        parseInt(currentSection.id.split("-")[0].replace("step", "")) || 1;
      const nextStepNumber =
        parseInt(nextSection.id.split("-")[0].replace("step", "")) || 2;

      updateProgressSteps(nextStepNumber);

      // Scroll to top of section
      window.scrollTo({
        top: nextSection.offsetTop - 100,
        behavior: "smooth",
      });
    });
  });

  // Handle previous step buttons
  prevButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const currentSection = this.closest(".checkout-section");
      const prevSectionId = this.dataset.prev;
      const prevSection = document.getElementById(prevSectionId);

      if (!currentSection || !prevSection) return;

      // Hide current section and show previous
      currentSection.classList.add("hidden");
      prevSection.classList.remove("hidden");

      // Update progress steps
      const prevStepNumber =
        parseInt(prevSection.id.split("-")[0].replace("step", "")) || 1;
      updateProgressSteps(prevStepNumber);

      // Scroll to top of section
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

  // Update progress lines
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
      // Update selected address card
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

  // Initialize edit address buttons
  const editButtons = document.querySelectorAll(".edit-address-btn");
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // In a real implementation, this would open an address edit modal
      alert(
        "Édition d'adresse - Cette fonctionnalité serait implémentée dans la version finale"
      );
    });
  });

  // Initialize add address button
  const addAddressBtn = document.querySelector(".add-address-btn");
  if (addAddressBtn) {
    addAddressBtn.addEventListener("click", function () {
      // In a real implementation, this would open an add address modal
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

      // Update active tab
      paymentTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      // Show corresponding content
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
  // Credit card form validation
  const cardNumberInput = document.getElementById("card-number");
  const cardExpiryInput = document.getElementById("card-expiry");
  const cardCvcInput = document.getElementById("card-cvc");
  const cardNameInput = document.getElementById("card-name");

  if (cardNumberInput) {
    cardNumberInput.addEventListener("input", function (e) {
      // Format card number with spaces
      let value = this.value.replace(/\s+/g, "");
      let formattedValue = "";

      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += " ";
        }
        formattedValue += value[i];
      }

      this.value = formattedValue;

      // Validate card number (simple Luhn check would be here in real implementation)
    });
  }

  if (cardExpiryInput) {
    cardExpiryInput.addEventListener("input", function (e) {
      // Format as MM/YY
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
      // Only allow numbers, max 4 digits
      this.value = this.value.replace(/[^0-9]/g, "").substring(0, 4);
    });
  }

  // Shipping method selection
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
    // Fallback to basic required check if utility is missing
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
  let formToValidate = section; // Assume section itself is the form or contains relevant inputs directly

  // Define rules based on section ID
  if (section.id === "delivery-section") {
    // Assuming inputs for a *new* address might be added dynamically and have names
    // For now, we'll just check if a shipping method is selected
    const shippingSelected = section.querySelector(
      'input[name="shipping-method"]:checked'
    );
    if (!shippingSelected) {
      showValidationError("Veuillez sélectionner une méthode de livraison.");
      return false; // Special case not handled by generic validator
    }
    // Add rules for any *new* address fields if they exist and are visible
    // Example: rules.newAddressName = { required: true, minLength: 2 };
  } else if (section.id === "payment-section") {
    const activePaymentMethod = section.querySelector(".payment-tab.active")
      ?.dataset.method;

    if (activePaymentMethod === "card") {
      formToValidate = section.querySelector("#card-payment"); // Validate inputs within the card payment div
      if (!formToValidate) return true; // Should not happen, but prevents errors

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
      // No form fields to validate for these methods in this simulation
      return true;
    }

    // Add billing address validation if 'different-billing' is visible
    const billingCheckbox = section.querySelector("#same-address");
    const differentBillingSection = section.querySelector(".different-billing");
    if (
      billingCheckbox &&
      !billingCheckbox.checked &&
      differentBillingSection &&
      !differentBillingSection.classList.contains("hidden")
    ) {
      // Add rules for billing address fields here
      // Example: rules.billingName = { required: true };
    }
  }

  // Perform validation using the global utility
  const isValid = window.articonnect.validateForm(formToValidate, rules);

  // Scroll to the first invalid field if validation fails
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

    // Validate payment section first
    const paymentSection = document.getElementById("payment-section");
    if (!validateSection(paymentSection)) {
      // Error message shown by validateSection
      return;
    }

    // Disable button and show loading state
    this.disabled = true;
    this.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Traitement en cours...';

    // --- Simulate Order Processing ---
    setTimeout(() => {
      try {
        // 1. Get Cart Items
        const cartItems = window.articonnect.getCart();
        if (cartItems.length === 0) {
          alert("Votre panier est vide.");
          throw new Error("Cart is empty"); // Stop processing
        }

        // 2. Get Final Total (re-calculate based on summary)
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
          // Allow zero total if cart has items (e.g., 100% discount)
          console.warn("Order total is zero or less, but cart has items.");
        } else if (finalTotal <= 0) {
          alert("Impossible de passer une commande avec un total nul.");
          throw new Error("Order total is zero");
        }

        // 3. Get User Info (from localStorage)
        const userString = localStorage.getItem("articonnect_user");
        const user = userString
          ? JSON.parse(userString)
          : { name: "Guest", email: "guest@example.com" }; // Fallback for guest checkout

        // 4. Get Selected Addresses & Shipping
        const selectedAddressCard = document.querySelector(
          ".address-card.selected .address-details"
        );
        const deliveryAddress = selectedAddressCard
          ? selectedAddressCard.innerText
          : "Non spécifiée"; // Simple text representation
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

        // 5. Create Order Object
        const orderId =
          "AC-" + Date.now() + "-" + Math.floor(100 + Math.random() * 900); // Simple unique ID
        const order = {
          id: orderId,
          date: new Date().toISOString(),
          user: { name: user.name, email: user.email },
          items: cartItems,
          deliveryAddress: deliveryAddress.replace(/\n+/g, ", "), // Format address string
          shippingMethod: shippingMethod,
          shippingCost: shippingCost,
          subtotal: window.articonnect.getCartSubtotal(),
          discount: window.appliedPromo?.value || 0, // Store discount value/percent
          discountType: window.appliedPromo?.type || null,
          total: finalTotal,
          status: "Completed", // Simulation assumes success
        };

        // 6. Save Order to localStorage (append to existing orders)
        const ordersJson = localStorage.getItem("articonnect_orders");
        const orders = ordersJson ? JSON.parse(ordersJson) : [];
        orders.push(order);
        localStorage.setItem("articonnect_orders", JSON.stringify(orders));
        console.log("Order saved:", order);

        // 7. Clear Cart
        window.articonnect.clearCart();
        window.appliedPromo = null; // Clear applied promo code

        // 8. Redirect to Confirmation Page
        window.location.href = `order_confirmation.html?orderId=${orderId}`;
      } catch (error) {
        console.error("Error placing order:", error);
        alert(
          "Une erreur est survenue lors du traitement de votre commande. Veuillez réessayer."
        );
        // Restore button state on error
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = "Commander";
      }
    }, 1500); // Shorter delay for simulation
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

  // 1. Render Summary Products
  summaryProductsContainer.innerHTML = ""; // Clear existing
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

  // 2. Calculate Subtotal
  const subtotal = window.articonnect?.getCartSubtotal
    ? window.articonnect.getCartSubtotal()
    : 0;
  subtotalValueElement.textContent = formatPrice(subtotal);

  // 3. Calculate Discount (using logic similar to cart.js)
  let discount = 0;
  const appliedPromo = window.appliedPromo || { type: "percent", value: 0 }; // Get applied promo info
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
    discountRow.style.display = "none"; // Hide if subtotal is 0 or row doesn't exist
  }

  // 4. Get Selected Shipping Cost
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

  // 5. Calculate and Update Total
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
  // Remove any existing error messages
  const existingErrors = document.querySelectorAll(".checkout-error");
  existingErrors.forEach((error) => error.remove());

  // Create error message
  const errorElement = document.createElement("div");
  errorElement.className = "checkout-error";
  errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

  // Insert at the top of the current section
  const currentSection = document.querySelector(
    ".checkout-section:not(.hidden)"
  );
  if (currentSection) {
    currentSection.insertBefore(errorElement, currentSection.firstChild);

    // Scroll to error
    errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Auto-remove error after 5 seconds
  setTimeout(() => {
    if (errorElement.parentNode) {
      errorElement.classList.add("fading");
      setTimeout(() => errorElement.remove(), 300);
    }
  }, 5000);
}
