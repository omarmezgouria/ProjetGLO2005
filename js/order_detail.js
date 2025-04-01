/**
 * ArtiConnect - Order Detail Page JavaScript
 * Handles functionality for the order detail page
 */

document.addEventListener("DOMContentLoaded", function () {
  // Check login status first
  checkLoginStatus();

  // Load order details from localStorage based on URL parameter
  loadOrderDetails();

  // Initialize any interactive elements if needed
  initOrderDetailActions();
});

/**
 * Checks if user is logged in, redirects to login if not.
 */
function checkLoginStatus() {
  const userString = localStorage.getItem("articonnect_user");
  if (!userString) {
    window.location.href = "../auth/login.html"; // Adjust path as needed
    return false; // Indicate user is not logged in
  }
  // Optional: Check if user type is client
  try {
    const user = JSON.parse(userString);
    if (user.type !== "client") {
      console.warn("Non-client accessing client order detail.");
      // Redirect non-clients? Or just let loadOrderDetails handle filtering?
      // window.location.href = "../index.html";
      // return false;
    }
  } catch (e) {
    console.error("Error parsing user data", e);
    localStorage.removeItem("articonnect_user");
    window.location.href = "../auth/login.html";
    return false;
  }
  return true; // User is logged in
}

/**
 * Load order details based on orderId from URL parameter and data from localStorage.
 */
function loadOrderDetails() {
  const orderId = getUrlParameter("orderId"); // Use the function defined below or from main.js
  const orderDetailPage = document.querySelector(
    ".order-detail-page .container"
  ); // Main container

  if (!orderId || !orderDetailPage) {
    console.error("Order ID missing or order detail page container not found.");
    if (orderDetailPage) {
      orderDetailPage.innerHTML =
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
    orderDetailPage.innerHTML = `<p class="error-message">Impossible de trouver les détails de la commande pour l'ID : ${orderId}</p>`;
    return;
  }

  // Optional: Verify this order belongs to the logged-in user
  const userString = localStorage.getItem("articonnect_user");
  const currentUser = userString ? JSON.parse(userString) : null;
  if (!currentUser || !order.user || currentUser.email !== order.user.email) {
    console.error(
      `User ${currentUser?.email} attempting to access order ${orderId} belonging to ${order.user?.email}`
    );
    orderDetailPage.innerHTML = `<p class="error-message">Vous n'êtes pas autorisé à voir cette commande.</p>`;
    return;
  }

  // --- Populate Page Elements ---

  // Page Title
  document.title = `ArtiConnect - Détail Commande #${order.id}`;

  // Breadcrumb & Header Title
  document.querySelectorAll(".current, .order-title h1").forEach((el) => {
    el.textContent = `Commande #${order.id}`;
  });
  document.querySelector(".order-title .order-date").textContent = formatDate(
    new Date(order.date)
  );

  // Status Badge
  const statusBadge = document.querySelector(".order-status .status-badge");
  if (statusBadge) {
    const statusClass = order.status
      ? order.status.toLowerCase().replace(/\s+/g, "-")
      : "inconnu";
    let statusText = order.status || "Inconnu";
    if (statusClass === "completed") statusText = "Livrée";
    else if (statusClass === "processing") statusText = "En préparation";
    // Add more statuses as needed
    statusBadge.className = `status-badge ${statusClass}`;
    statusBadge.textContent = statusText;
  }

  // Order Products
  const productsContainer = document.querySelector(".order-products");
  productsContainer.innerHTML = ""; // Clear placeholder
  order.items.forEach((item) => {
    const productDiv = document.createElement("div");
    productDiv.className = "order-product";
    productDiv.innerHTML = `
            <div class="product-image">
                <img src="${
                  item.imageUrl || "../../images/placeholder.png"
                }" alt="${item.name}">
            </div>
            <div class="product-details">
                <h3 class="product-title">${item.name}</h3>
                <div class="product-meta">
                    ${
                      item.artisan
                        ? `<span class="product-artisan">Par ${item.artisan}</span>`
                        : ""
                    }
                    ${
                      item.variant
                        ? `<span class="product-variant">Variant: ${item.variant}</span>`
                        : ""
                    }
                </div>
                <div class="product-price-info">
                    <div class="product-quantity">
                        <span>Quantité: ${item.quantity}</span>
                    </div>
                    <div class="product-price">${formatPrice(
                      item.price * item.quantity
                    )}</div>
                </div>
            </div>`;
    productsContainer.appendChild(productDiv);
  });

  // Order Timeline (Basic simulation based on status)
  const timelineItems = document.querySelectorAll(
    ".order-timeline .timeline-item"
  );
  let activeReached = false;
  timelineItems.forEach((item) => {
    item.classList.remove("active", "completed");
    // Basic logic: Mark as completed up to the current status, mark current as active
    const itemStatusText = item
      .querySelector(".timeline-title")
      ?.textContent.toLowerCase();
    let itemStatusClass = "unknown";
    if (itemStatusText?.includes("confirmée")) itemStatusClass = "confirmed"; // Assuming 'Completed' status means confirmed
    if (itemStatusText?.includes("paiement")) itemStatusClass = "paid"; // Assuming 'Completed' status means paid
    if (itemStatusText?.includes("préparation")) itemStatusClass = "processing";
    if (itemStatusText?.includes("expédié")) itemStatusClass = "shipped";
    if (itemStatusText?.includes("livré")) itemStatusClass = "completed";

    const orderStatusClass = order.status
      ? order.status.toLowerCase().replace(/\s+/g, "-")
      : "unknown";

    // Determine completion based on a simple assumed order of statuses
    const statusOrder = [
      "confirmed",
      "paid",
      "processing",
      "shipped",
      "completed",
    ];
    const currentStatusIndex = statusOrder.indexOf(orderStatusClass);
    const itemStatusIndex = statusOrder.indexOf(itemStatusClass);

    if (itemStatusIndex !== -1 && currentStatusIndex !== -1) {
      if (itemStatusIndex < currentStatusIndex) {
        item.classList.add("completed");
      } else if (itemStatusIndex === currentStatusIndex) {
        item.classList.add("active");
        activeReached = true;
      }
    }
    // Ensure 'Commande confirmée' and 'Paiement accepté' are always completed if order status is >= processing
    if (
      (itemStatusClass === "confirmed" || itemStatusClass === "paid") &&
      currentStatusIndex >= statusOrder.indexOf("processing")
    ) {
      item.classList.add("completed");
    }
  });

  // Artisan Info (if available in order items - needs adjustment if stored differently)
  const artisanInfoCard = document.querySelector(".artisan-info-card");
  const firstItemWithArtisan = order.items.find((item) => item.artisan);
  if (artisanInfoCard && firstItemWithArtisan) {
    artisanInfoCard.querySelector(".artisan-name").textContent =
      firstItemWithArtisan.artisan;
    // TODO: Populate other artisan details if available
  } else if (artisanInfoCard) {
    artisanInfoCard.style.display = "none"; // Hide if no artisan info
  }

  // Order Summary Sidebar
  document.querySelector(
    ".order-sidebar .summary-row:nth-child(1) .summary-value"
  ).textContent = formatPrice(order.subtotal);
  document.querySelector(
    ".order-sidebar .summary-row:nth-child(2) .summary-value"
  ).textContent =
    order.shippingCost > 0 ? formatPrice(order.shippingCost) : "Gratuit";

  const summaryDiscountRow = document.querySelector(
    ".order-sidebar .summary-row.discount"
  ); // Assuming a discount row exists
  const summaryDiscountValue =
    summaryDiscountRow?.querySelector(".summary-value");
  if (summaryDiscountRow && summaryDiscountValue && order.discount > 0) {
    let discountText = `-${formatPrice(order.discount)}`;
    if (order.discountType === "percent") {
      // Need original subtotal to calculate percentage value if only percent stored
      // Or store the calculated discount amount in the order object
      // Assuming order.discount stores the calculated amount here
      // discountText += ` (${order.discountPercent}%)`; // If percent was stored
    }
    summaryDiscountValue.textContent = discountText;
    summaryDiscountRow.style.display = "";
  } else if (summaryDiscountRow) {
    summaryDiscountRow.style.display = "none";
  }
  // TODO: Add Taxes row if applicable

  document.querySelector(
    ".order-sidebar .summary-row.total .summary-value"
  ).textContent = formatPrice(order.total);

  // Delivery Info Sidebar
  document.querySelector(".delivery-info .delivery-address").innerHTML = `
        <h3 class="address-type">Adresse de livraison</h3>
        ${order.deliveryAddress
          .split(", ")
          .map((line) => `<p class="address-line">${line}</p>`)
          .join("")}
    `; // Basic formatting
  document.querySelector(
    ".delivery-info .delivery-method .delivery-name"
  ).textContent = order.shippingMethod;
  // TODO: Update estimated delivery based on order status/date

  // Payment Info Sidebar (Basic placeholder)
  const paymentDetails = document.querySelector(
    ".payment-info .payment-details"
  );
  if (paymentDetails) {
    // Placeholder - real app would fetch payment details securely
    paymentDetails.querySelector(".payment-card").textContent =
      "Visa se terminant par ****";
    paymentDetails.querySelector(
      ".payment-status"
    ).textContent = `Paiement accepté le ${formatDate(new Date(order.date))}`;
  }
}

/**
 * Initialize action buttons on the order detail page.
 */
function initOrderDetailActions() {
  // Example: Contact Artisan Button
  const contactBtn = document.querySelector(".contact-artisan-btn");
  if (contactBtn) {
    contactBtn.addEventListener("click", () => {
      alert(
        "Simulation: Ouverture du formulaire de contact de l'artisan (non implémenté)."
      );
    });
  }
  // Add handlers for other buttons like Print, Help, Reorder etc.
}

// Helper function (copied from orders.js - move to main.js ideally)
function formatDate(date) {
  if (!date || !(date instanceof Date)) return "-";
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Helper function (copied from cart.js - move to main.js ideally)
function formatPrice(price) {
  if (typeof price !== "number") {
    price = parseFloat(price) || 0;
  }
  return price.toFixed(2).replace(".", ",") + " €";
}

// Helper function (copied from order_confirmation.js - move to main.js ideally)
function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  const results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}
