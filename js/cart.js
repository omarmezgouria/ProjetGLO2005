/**
 * ArtiConnect - Shopping Cart JavaScript
 * Handles functionality for the shopping cart page
 */

// --- Cart Management Functions (LocalStorage) ---

const CART_STORAGE_KEY = "articonnect_cart";

/**
 * Retrieves the cart array from localStorage.
 * @returns {Array} The cart items array.
 */
function getCart() {
  const cartJson = localStorage.getItem(CART_STORAGE_KEY);
  try {
    return cartJson ? JSON.parse(cartJson) : [];
  } catch (e) {
    console.error("Error parsing cart data from localStorage", e);
    localStorage.removeItem(CART_STORAGE_KEY); // Clear corrupted data
    return [];
  }
}

/**
 * Saves the cart array to localStorage.
 * @param {Array} cart - The cart items array to save.
 */
function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  // Dispatch a custom event so other parts of the app (like the header count) can react
  window.dispatchEvent(new CustomEvent("cartUpdated"));
}

/**
 * Adds an item to the cart or increments its quantity.
 * @param {object} itemToAdd - The product item object to add. Must include id, name, price, quantity.
 */
function addToCart(itemToAdd) {
  const cart = getCart();
  const existingItemIndex = cart.findIndex(
    (item) => item.id === itemToAdd.id && item.variant === itemToAdd.variant
  ); // Check variant too

  if (existingItemIndex > -1) {
    // Item already exists, increment quantity
    cart[existingItemIndex].quantity += itemToAdd.quantity;
  } else {
    // Add new item
    cart.push(itemToAdd);
  }
  saveCart(cart);
  console.log("Cart after add:", cart); // For debugging
}

/**
 * Removes an item from the cart.
 * @param {number} itemId - The ID of the item to remove.
 * @param {string|null} [variant] - The variant of the item to remove (optional).
 */
function removeFromCart(itemId, variant = null) {
  let cart = getCart();
  cart = cart.filter(
    (item) => !(item.id === itemId && item.variant === variant)
  );
  saveCart(cart);
  console.log("Cart after remove:", cart); // For debugging
}

/**
 * Updates the quantity of a specific item in the cart.
 * @param {number} itemId - The ID of the item to update.
 * @param {number} quantity - The new quantity.
 * @param {string|null} [variant] - The variant of the item to update (optional).
 */
function updateCartQuantity(itemId, quantity, variant = null) {
  const cart = getCart();
  const itemIndex = cart.findIndex(
    (item) => item.id === itemId && item.variant === variant
  );

  if (itemIndex > -1) {
    if (quantity > 0) {
      cart[itemIndex].quantity = quantity;
    } else {
      // Remove item if quantity is 0 or less
      cart.splice(itemIndex, 1);
    }
    saveCart(cart);
    console.log("Cart after update quantity:", cart); // For debugging
  }
}

/**
 * Calculates the total number of items in the cart (sum of quantities).
 * @returns {number} Total number of items.
 */
function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Calculates the subtotal price of all items in the cart.
 * @returns {number} The cart subtotal.
 */
function getCartSubtotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

/**
 * Clears the entire cart from localStorage.
 */
function clearCart() {
  saveCart([]); // Save an empty array
  console.log("Cart cleared"); // For debugging
  // Re-render the cart to show the empty state
  renderCartItems();
}

/**
 * Renders items from localStorage into the cart table.
 */
function renderCartItems() {
  const cart = getCart();
  const cartTableBody = document.querySelector(".cart-table tbody");
  const cartContent = document.querySelector(".cart-content"); // For empty state
  const cartContainer = document.querySelector(".cart-container"); // Assuming this holds table + summary

  if (!cartTableBody || !cartContent || !cartContainer) {
    console.error("Cart elements (tbody, content, container) not found.");
    return;
  }

  cartTableBody.innerHTML = ""; // Clear existing items

  if (cart.length === 0) {
    showEmptyCart(); // This function should handle showing the empty message
    // Hide the main cart table and summary if they exist
    const table = cartContainer.querySelector(".cart-table");
    const summary = cartContainer.querySelector(".cart-summary");
    if (table) table.style.display = "none";
    if (summary) summary.style.display = "none";
    // Ensure totals are zeroed out
    updateCartTotals(); // updateCartTotals should handle the zero case
    return;
  }

  // Ensure the main cart table and summary are visible
  const table = cartContainer.querySelector(".cart-table");
  const summary = cartContainer.querySelector(".cart-summary");
  if (table) table.style.display = ""; // Or 'table' if needed
  if (summary) summary.style.display = ""; // Or 'block'/'flex' etc.
  // Remove empty message if present within cartContent
  const emptyCartElement = cartContent.querySelector(".cart-empty");
  if (emptyCartElement) emptyCartElement.remove();

  cart.forEach((item) => {
    const row = document.createElement("tr");
    row.className = "cart-item";
    // Store item id and variant on the row for easier access
    row.dataset.itemId = item.id;
    row.dataset.itemVariant = item.variant || "";

    const itemTotal = item.price * item.quantity;

    row.innerHTML = `
          <td class="product-col">
              <div class="product-info-cell">
                  <img src="${
                    item.imageUrl || "../../images/placeholder.png"
                  }" alt="${item.name}" class="product-image">
                  <div class="product-details">
                      <a href="${item.detailUrl || "#"}" class="product-name">${
      item.name
    }</a>
                      ${
                        item.variant
                          ? `<div class="product-variant">Variant: ${item.variant}</div>`
                          : ""
                      }
                      <button class="remove-item-btn" aria-label="Supprimer l'article">
                          <i class="fas fa-trash-alt"></i> Supprimer
                      </button>
                  </div>
              </div>
          </td>
          <td class="price-col">${formatPrice(item.price)}</td>
          <td class="quantity-col">
              <div class="quantity-selector">
                  <button class="quantity-btn minus" aria-label="Diminuer la quantité">
                      <i class="fas fa-minus"></i>
                  </button>
                  <input type="number" value="${item.quantity}" min="1" max="${
      item.stock || 10 // Use item stock if available, else default
    }" class="quantity-input" aria-label="Quantité">
                  <button class="quantity-btn plus" aria-label="Augmenter la quantité">
                      <i class="fas fa-plus"></i>
                  </button>
              </div>
          </td>
          <td class="total-col">${formatPrice(itemTotal)}</td>
      `;
    cartTableBody.appendChild(row);
  });

  // Update totals after rendering all items
  updateCartTotals();
}

// Expose cart functions globally if needed by other scripts
window.articonnect = {
  ...window.articonnect, // Preserve existing utilities/data
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getCartItemCount,
  getCartSubtotal,
  clearCart,
  // We might need a function specifically for updating the header count
  updateHeaderCartCount: () => {
    const count = getCartItemCount();
    const cartCountElement = document.querySelector(".header .cart-count");
    if (cartCountElement) {
      cartCountElement.textContent = count;
      // Optional: Add pulse only if count increased? Needs more logic.
      if (count > 0) {
        cartCountElement.classList.add("pulse");
        setTimeout(() => cartCountElement.classList.remove("pulse"), 500);
      }
    }
  },
};

// Listen for the custom cartUpdated event to update the header count automatically
window.addEventListener(
  "cartUpdated",
  window.articonnect.updateHeaderCartCount
);

// --- Cart Page Specific Functions ---

document.addEventListener("DOMContentLoaded", function () {
  // Render cart items from localStorage first
  renderCartItems();

  // Initialize UI interactions (using event delegation where possible)
  initCartInteractions(); // Combine quantity and remove listeners

  // Initialize promo code functionality
  initPromoCode();

  // Initialize clear cart functionality
  initClearCart();

  // Initial totals calculation is done within renderCartItems
  // updateCartTotals(); // No longer needed here, called by renderCartItems
});

/**
 * Initialize cart interactions (quantity changes, remove item) using event delegation.
 */
function initCartInteractions() {
  const cartTableBody = document.querySelector(".cart-table tbody");

  if (!cartTableBody) return;

  cartTableBody.addEventListener("click", function (event) {
    const target = event.target;
    const cartItemRow = target.closest(".cart-item");
    if (!cartItemRow) return;

    const itemId = parseInt(cartItemRow.dataset.itemId);
    const itemVariant = cartItemRow.dataset.itemVariant || null; // Get variant if exists
    const quantityInput = cartItemRow.querySelector(".quantity-input");

    // Handle Remove Button
    if (target.closest(".remove-item-btn")) {
      event.preventDefault();
      if (
        confirm(
          `Supprimer "${
            cartItemRow.querySelector(".product-name").textContent
          }" du panier?`
        )
      ) {
        // Add removing class for animation
        cartItemRow.classList.add("removing");
        // Remove from localStorage after animation
        setTimeout(() => {
          removeFromCart(itemId, itemVariant);
          renderCartItems(); // Re-render the whole cart after removal
        }, 300); // Match animation duration
      }
      return;
    }

    // Handle Quantity Buttons (+/-)
    if (target.closest(".quantity-btn")) {
      event.preventDefault();
      let currentQuantity = parseInt(quantityInput.value);
      const maxQuantity = parseInt(quantityInput.getAttribute("max") || 10);
      let newQuantity = currentQuantity;

      if (target.closest(".minus")) {
        if (currentQuantity > 1) {
          newQuantity = currentQuantity - 1;
        } else {
          // Optional: Ask for confirmation to remove if quantity goes to 0
          if (
            confirm(
              `Supprimer "${
                cartItemRow.querySelector(".product-name").textContent
              }" du panier?`
            )
          ) {
            newQuantity = 0; // Will trigger removal in updateCartQuantity
          } else {
            return; // Do nothing if user cancels
          }
        }
      } else if (target.closest(".plus")) {
        if (currentQuantity < maxQuantity) {
          newQuantity = currentQuantity + 1;
        } else {
          alert(`Quantité maximale atteinte (${maxQuantity})`);
          return; // Don't update if max reached
        }
      }

      if (newQuantity !== currentQuantity) {
        quantityInput.value = newQuantity; // Update input visually immediately
        updateCartQuantity(itemId, newQuantity, itemVariant);
        // Update the specific item total visually
        updateItemTotalDisplay(cartItemRow, newQuantity);
        // Recalculate and update the overall cart totals
        updateCartTotals();
      }
      return;
    }
  });

  // Handle direct input change in quantity field
  cartTableBody.addEventListener("change", function (event) {
    const target = event.target;
    if (target.classList.contains("quantity-input")) {
      const cartItemRow = target.closest(".cart-item");
      if (!cartItemRow) return;

      const itemId = parseInt(cartItemRow.dataset.itemId);
      const itemVariant = cartItemRow.dataset.itemVariant || null;
      let newQuantity = parseInt(target.value);
      const maxQuantity = parseInt(target.getAttribute("max") || 10);

      // Validate input
      if (isNaN(newQuantity) || newQuantity < 1) {
        newQuantity = 1;
      } else if (newQuantity > maxQuantity) {
        newQuantity = maxQuantity;
        alert(`Quantité maximale atteinte (${maxQuantity})`);
      }
      target.value = newQuantity; // Correct input visually if needed

      updateCartQuantity(itemId, newQuantity, itemVariant);
      updateItemTotalDisplay(cartItemRow, newQuantity);
      updateCartTotals();
    }
  });
}

/**
 * Update the total price display for a single cart item row.
 * @param {HTMLElement} cartItemRow - The table row element for the cart item.
 * @param {number} quantity - The new quantity.
 */
function updateItemTotalDisplay(cartItemRow, quantity) {
  const priceCol = cartItemRow.querySelector(".price-col");
  const totalCol = cartItemRow.querySelector(".total-col");

  if (!priceCol || !totalCol) return;

  const price = parseFloat(
    priceCol.textContent.replace(/[^0-9.,]/g, "").replace(",", ".")
  );

  if (!isNaN(price)) {
    const total = price * quantity;
    totalCol.textContent = formatPrice(total);
  }
}

/**
 * Format price with currency symbol
 * @param {number} price - Price to format
 * @returns {string} - Formatted price
 */
function formatPrice(price) {
  // Ensure price is a number before formatting
  if (typeof price !== "number") {
    price = parseFloat(price) || 0;
  }
  return price.toFixed(2).replace(".", ",") + " €";
}

// Removed old initQuantitySelectors and initRemoveItems functions

/**
 * Show empty cart state
 */
function showEmptyCart() {
  const cartContent = document.querySelector(".cart-content");
  if (!cartContent) return;

  cartContent.innerHTML = `
        <div class="cart-empty">
            <div class="empty-cart-icon">
                <i class="fas fa-shopping-cart"></i>
            </div>
            <h2>Votre panier est vide</h2>
            <p>Vous n'avez aucun article dans votre panier. Parcourez notre catalogue pour découvrir des créations artisanales uniques.</p>
            <a href="../products.html" class="btn btn--primary">Parcourir les produits</a>
        </div>
    `;
}

/**
 * Initialize promo code functionality
 */
function initPromoCode() {
  const promoForm = document.querySelector(".promo-form");

  if (!promoForm) return;

  promoForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const promoInput = this.querySelector(".promo-input");
    const applyBtn = this.querySelector(".apply-promo");

    if (!promoInput || !applyBtn) return;

    const promoCode = promoInput.value.trim();

    if (!promoCode) {
      showPromoError("Veuillez entrer un code promo");
      return;
    }

    // Simulate API call to validate promo code
    applyBtn.disabled = true;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    setTimeout(() => {
      // For demo purposes, let's accept "WELCOME10" as a valid code
      if (promoCode.toUpperCase() === "WELCOME10") {
        applyPromoDiscount(10);
        showPromoSuccess("Code promo appliqué : -10%");
      } else {
        showPromoError("Code promo invalide");
      }

      applyBtn.disabled = false;
      applyBtn.innerHTML = "Appliquer";
    }, 1000);
  });
}

/**
 * Apply promo discount
 * @param {number} discountPercent - Discount percentage
 */
function applyPromoDiscount(discountPercent) {
  // Add discount row to summary
  const summaryDetails = document.querySelector(".summary-details");
  const totalRow = document.querySelector(".summary-row.total");

  if (!summaryDetails || !totalRow) return;

  // Check if discount row already exists
  let discountRow = document.querySelector(".summary-row.discount");

  if (!discountRow) {
    // Create new discount row
    discountRow = document.createElement("div");
    discountRow.className = "summary-row discount";
    discountRow.innerHTML = `
            <span class="summary-label">Réduction</span>
            <span class="summary-value discount-value"></span>
        `;

    // Insert before total row
    summaryDetails.insertBefore(discountRow, totalRow);
  }

  // Calculate discount
  const subtotalText = document.querySelector(
    ".summary-row:first-child .summary-value"
  ).textContent;
  const subtotal = parseFloat(
    subtotalText.replace(/[^0-9.,]/g, "").replace(",", ".")
  );

  if (isNaN(subtotal)) return;

  const discount = subtotal * (discountPercent / 100);

  // Update discount and total values
  const discountValue = discountRow.querySelector(".discount-value");
  const totalValue = totalRow.querySelector(".summary-value");

  discountValue.textContent = "-" + formatPrice(discount);
  totalValue.textContent = formatPrice(subtotal - discount);
}

/**
 * Show promo code success message
 * @param {string} message - Success message
 */
function showPromoSuccess(message) {
  const promoForm = document.querySelector(".promo-form");
  if (!promoForm) return;

  // Remove any existing messages
  removePromoMessages();

  // Create success message
  const successMessage = document.createElement("div");
  successMessage.className = "promo-message success";
  successMessage.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;

  // Insert after form
  promoForm.parentNode.insertBefore(successMessage, promoForm.nextSibling);
}

/**
 * Show promo code error message
 * @param {string} message - Error message
 */
function showPromoError(message) {
  const promoForm = document.querySelector(".promo-form");
  if (!promoForm) return;

  // Remove any existing messages
  removePromoMessages();

  // Create error message
  const errorMessage = document.createElement("div");
  errorMessage.className = "promo-message error";
  errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

  // Insert after form
  promoForm.parentNode.insertBefore(errorMessage, promoForm.nextSibling);
}

/**
 * Remove promo messages
 */
function removePromoMessages() {
  const messages = document.querySelectorAll(".promo-message");
  messages.forEach((message) => message.remove());
}

/**
 * Initialize clear cart functionality
 */
function initClearCart() {
  const clearCartBtn = document.querySelector(".clear-cart");

  if (!clearCartBtn) return;

  clearCartBtn.addEventListener("click", function () {
    // Show confirmation
    if (confirm("Êtes-vous sûr de vouloir vider votre panier?")) {
      // Use the global clearCart function which handles localStorage and re-rendering
      if (
        window.articonnect &&
        typeof window.articonnect.clearCart === "function"
      ) {
        window.articonnect.clearCart();
      } else {
        console.error("clearCart function not found.");
        // Fallback: Try to manually clear and show empty state
        localStorage.removeItem(CART_STORAGE_KEY);
        showEmptyCart();
        updateCartTotals(); // Ensure totals are zeroed
      }
    }
  });
}

/**
 * Update cart summary totals (Subtotal, Discount, Total).
 * Reads subtotal directly from getCartSubtotal().
 */
function updateCartTotals() {
  const subtotal = getCartSubtotal(); // Use the function to get subtotal from localStorage data
  let discount = 0;
  let discountPercent = 0; // Store applied discount percentage if needed

  // Update subtotal display - Assuming the first row is subtotal
  const subtotalValueElement = document.querySelector(
    ".summary-details .summary-row:first-child .summary-value"
  );
  if (subtotalValueElement) {
    subtotalValueElement.textContent = formatPrice(subtotal);
  } else {
    console.warn("Subtotal display element not found.");
  }

  // Check for applied discount (assuming discount row exists if applied)
  const discountRow = document.querySelector(".summary-row.discount");
  const discountValueElement = discountRow?.querySelector(".summary-value");

  if (discountValueElement && subtotal > 0) {
    // Only apply discount if there's a subtotal
    // Re-calculate discount based on current subtotal and stored percentage or fixed value
    // We need a way to know which promo was applied. Let's store it globally for this simulation.
    const appliedPromo = window.appliedPromo || { type: "percent", value: 0 };

    if (appliedPromo.type === "percent" && appliedPromo.value > 0) {
      discountPercent = appliedPromo.value;
      discount = subtotal * (discountPercent / 100);
      // Update text to show percentage
      discountValueElement.textContent = `-${formatPrice(
        discount
      )} (${discountPercent}%)`;
    } else if (appliedPromo.type === "fixed" && appliedPromo.value > 0) {
      // Ensure fixed discount doesn't exceed subtotal
      discount = Math.min(appliedPromo.value, subtotal);
      discountValueElement.textContent = `-${formatPrice(discount)}`;
    } else {
      // No valid discount applied, remove row or zero out
      discount = 0;
      if (discountRow) discountRow.style.display = "none"; // Hide instead of removing, easier to show again
      // Clear any stored promo
      window.appliedPromo = null;
    }
    if (discountRow && discount > 0) discountRow.style.display = ""; // Ensure row is visible if discount > 0
  } else {
    discount = 0; // No discount row exists or subtotal is 0
    if (discountRow) discountRow.style.display = "none"; // Hide discount row if subtotal is 0
    // Clear any stored promo
    window.appliedPromo = null;
  }

  // Update Shipping (Assume free for now, or calculate based on items/subtotal)
  const shippingValueElement = document.querySelector(
    ".summary-row.shipping .summary-value"
  );
  let shippingCost = 0; // TODO: Implement shipping calculation logic
  if (shippingValueElement) {
    shippingValueElement.textContent =
      shippingCost > 0 ? formatPrice(shippingCost) : "Gratuit";
  }

  // Update Total
  const totalValueElement = document.querySelector(
    ".summary-row.total .summary-value"
  );
  if (totalValueElement) {
    const total = Math.max(0, subtotal - discount + shippingCost); // Ensure total isn't negative
    totalValueElement.textContent = formatPrice(total);
  } else {
    console.warn("Total display element not found.");
  }
}

// Removed dynamically added CSS. Styles should be in css/pages/cart.css
