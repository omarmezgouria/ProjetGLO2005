/**
 * ArtiConnect - Order Confirmation Page JavaScript
 * Handles order confirmation functionality
 */

document.addEventListener("DOMContentLoaded", function () {
  // Display order information
  displayOrderInfo();

  // Initialize continue shopping button
  initContinueShopping();

  // Initialize order tracking
  initOrderTracking();
});

/**
 * Display order information based on orderId from URL parameter and data from localStorage.
 */
function displayOrderInfo() {
  const orderId = getUrlParameter("orderId"); // Use the parameter name set in checkout.js
  const confirmationBox = document.querySelector(".confirmation-box");

  if (!orderId || !confirmationBox) {
    console.error("Order ID missing or confirmation box not found.");
    if (confirmationBox) {
      confirmationBox.innerHTML =
        '<p class="error-message">Impossible de trouver les détails de la commande. ID de commande manquant.</p>';
    }
    return;
  }

  // Retrieve orders from localStorage
  const ordersJson = localStorage.getItem("articonnect_orders");
  const orders = ordersJson ? JSON.parse(ordersJson) : [];

  // Find the specific order
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    console.error(`Order with ID ${orderId} not found in localStorage.`);
    confirmationBox.innerHTML = `<p class="error-message">Impossible de trouver les détails de la commande pour l'ID : ${orderId}</p>`;
    return;
  }

  // --- Populate Page Elements ---
  document.getElementById("order-id").textContent = order.id;
  document.getElementById("order-date").textContent = formatDate(
    new Date(order.date)
  ); // Format the stored date

  // Populate items list
  const itemsList = document.getElementById("order-items-list");
  itemsList.innerHTML = ""; // Clear placeholder
  order.items.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <img src="${
              item.imageUrl || "../../images/placeholder.png"
            }" alt="${item.name}" class="item-thumbnail">
            <div class="item-details">
                <span class="item-name">${item.name} ${
      item.variant ? `(${item.variant})` : ""
    }</span>
                <span class="item-quantity">Qté: ${item.quantity}</span>
            </div>
            <span class="item-price">${formatPrice(
              item.price * item.quantity
            )}</span>
        `;
    itemsList.appendChild(li);
  });

  // Populate totals
  document.getElementById("order-subtotal").textContent = formatPrice(
    order.subtotal
  );

  const discountRow = document.getElementById("discount-row");
  const discountElement = document.getElementById("order-discount");
  if (order.discount > 0 && discountRow && discountElement) {
    let discountText = `-${formatPrice(order.discount)}`;
    if (order.discountType === "percent") {
      discountText += ` (${order.discount}%)`; // Assuming discount value stored was percentage
    }
    discountElement.textContent = discountText;
    discountRow.style.display = ""; // Show discount row
  } else if (discountRow) {
    discountRow.style.display = "none"; // Hide if no discount
  }

  document.getElementById("shipping-method").textContent = order.shippingMethod;
  document.getElementById("order-shipping").textContent =
    order.shippingCost > 0 ? formatPrice(order.shippingCost) : "Gratuit";
  document.getElementById("order-total").textContent = formatPrice(order.total);

  // Populate delivery address
  document.getElementById("delivery-address").textContent =
    order.deliveryAddress;

  // Cart should already be cleared by checkout.js, no need to clear here.
  // Header count should update automatically via 'cartUpdated' event.
}

/**
 * Format date in locale format
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date
 */
function formatDate(date) {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Update cart count in header
 * @param {number} count - New cart count
 */
function updateCartCount(count) {
  const cartCountElement = document.querySelector(".cart-count");
  if (cartCountElement) {
    if (count > 0) {
      cartCountElement.textContent = count;
      cartCountElement.style.display = "flex";
    } else {
      cartCountElement.style.display = "none";
    }
  }
}

/**
 * Initialize continue shopping button
 */
function initContinueShopping() {
  const continueShoppingBtn = document.querySelector(".continue-shopping-btn");

  if (continueShoppingBtn) {
    continueShoppingBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "../products.html";
    });
  }
}

/**
 * Initialize order tracking
 */
function initOrderTracking() {
  const trackOrderBtn = document.querySelector(".track-order-btn");

  if (trackOrderBtn) {
    trackOrderBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // In a real implementation, this would redirect to order tracking page
      // For demo, redirect to order detail
      const orderNumber = getUrlParameter("order");
      window.location.href = `order_detail.html?id=${orderNumber}`;
    });
  }
}

/**
 * Get URL parameter value
 * @param {string} name - Parameter name
 * @returns {string|null} - Parameter value or null
 */
function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  const results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/**
 * Send order confirmation email (simulated)
 */
function sendConfirmationEmail() {
  console.log("Confirmation email would be sent in production implementation");
  // In a real implementation, this would be handled by the server
}
