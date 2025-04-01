/**
 * ArtiConnect - Client Orders Page JavaScript
 * Handles functionality for the client's order history page
 */

document.addEventListener("DOMContentLoaded", function () {
  // Check login status and load user data
  loadUserOrders();

  // Initialize order filtering/searching (basic placeholders)
  initOrderFilters();
});

/**
 * Check login status, retrieve orders from localStorage, filter for current user, and render them.
 */
function loadUserOrders() {
  const userString = localStorage.getItem("articonnect_user");
  if (!userString) {
    window.location.href = "../auth/login.html"; // Redirect if not logged in
    return;
  }

  let currentUser = null;
  try {
    currentUser = JSON.parse(userString);
  } catch (e) {
    console.error("Error parsing user data", e);
    localStorage.removeItem("articonnect_user");
    window.location.href = "../auth/login.html";
    return;
  }

  // Ensure it's a client
  if (currentUser.type !== "client") {
    window.location.href = "../index.html"; // Redirect non-clients
    return;
  }

  // Populate sidebar user info (redundant if main.js handles it, but safe fallback)
  const sidebarUserName = document.querySelector(
    ".dashboard-sidebar .user-name"
  );
  const sidebarUserEmail = document.querySelector(
    ".dashboard-sidebar .user-email"
  );
  if (sidebarUserName)
    sidebarUserName.textContent = currentUser.name || "Utilisateur";
  if (sidebarUserEmail) sidebarUserEmail.textContent = currentUser.email;

  // Retrieve all orders
  const ordersJson = localStorage.getItem("articonnect_orders");
  const allOrders = ordersJson ? JSON.parse(ordersJson) : [];

  // Filter orders for the current user (matching email)
  const userOrders = allOrders.filter(
    (order) => order.user && order.user.email === currentUser.email
  );

  // Render the filtered orders
  renderOrders(userOrders);
}

/**
 * Renders the list of orders into the page.
 * @param {Array} orders - Array of order objects to render.
 */
function renderOrders(orders) {
  const ordersListContainer = document.querySelector(".orders-list");
  if (!ordersListContainer) {
    console.error("Orders list container not found.");
    return;
  }

  ordersListContainer.innerHTML = ""; // Clear existing/placeholder orders

  if (orders.length === 0) {
    ordersListContainer.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-box-open"></i>
                <p>Vous n'avez pas encore passé de commande.</p>
                <a href="products.html" class="btn btn--primary">Commencer mes achats</a>
            </div>`;
    // Update tab counts (optional)
    updateTabCounts({});
    return;
  }

  // Sort orders by date, newest first
  orders.sort((a, b) => new Date(b.date) - new Date(a.date));

  const statusCounts = {}; // To count orders per status for tabs

  orders.forEach((order) => {
    const orderCard = document.createElement("div");
    orderCard.className = "order-card";
    // Add status as data attribute for filtering
    const statusClass = order.status
      ? order.status.toLowerCase().replace(/\s+/g, "-")
      : "inconnu";
    orderCard.dataset.status = statusClass;

    // Increment status count
    statusCounts[statusClass] = (statusCounts[statusClass] || 0) + 1;

    // Determine status text and class
    let statusText = order.status || "Inconnu";
    // Simple mapping for demo
    if (statusClass === "completed") statusText = "Livrée";
    else if (statusClass === "processing") statusText = "En préparation";
    // Add more statuses as needed

    // Get first product image as thumbnail
    const firstItemImage =
      order.items[0]?.imageUrl || "../../images/placeholder.png";
    const firstItemName = order.items[0]?.name || "Article";
    const totalItems = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-info">
                    <h3 class="order-number">Commande #${order.id}</h3>
                    <span class="order-date">${formatDate(
                      new Date(order.date)
                    )}</span>
                </div>
                <div class="order-status ${statusClass}">
                    <span class="status-dot"></span>
                    <span class="status-text">${statusText}</span>
                </div>
            </div>
            <div class="order-details">
                <div class="order-products">
                    <div class="product-thumbnail">
                        <img src="${firstItemImage}" alt="${firstItemName}">
                        ${
                          totalItems > 1
                            ? `<span class="more-items">+${
                                totalItems - 1
                              }</span>`
                            : ""
                        }
                    </div>
                    <div class="product-info">
                        <h4 class="product-title">${firstItemName}${
      totalItems > 1 ? ` et ${totalItems - 1} autre(s)` : ""
    }</h4>
                        <!-- Maybe show total quantity instead -->
                    </div>
                </div>
                <div class="order-total">
                    <span class="total-label">Total</span>
                    <span class="total-value">${formatPrice(order.total)}</span>
                </div>
            </div>
            <div class="order-footer">
                 <div class="order-delivery">
                     <!-- Placeholder for delivery info -->
                 </div>
                <div class="order-actions">
                    <a href="order_detail.html?orderId=${
                      order.id
                    }" class="btn btn--outline btn--small">Détails</a>
                    <!-- Add other relevant actions like 'Reorder', 'Track', 'Contact' -->
                </div>
            </div>
        `;
    ordersListContainer.appendChild(orderCard);
  });

  // Update tab counts
  updateTabCounts(statusCounts, orders.length);
}

/**
 * Updates the counts displayed in the order filter tabs.
 * @param {Object} statusCounts - An object with counts per status class (e.g., {'livree': 5, 'en-preparation': 3}).
 * @param {number} totalOrders - Total number of orders displayed.
 */
function updateTabCounts(statusCounts, totalOrders = 0) {
  document.querySelector(
    '.tab-btn[data-filter="all"]'
  ).textContent = `Toutes les commandes (${totalOrders})`;
  // Example status mapping - adjust keys based on actual statuses used in simulation
  document.querySelector(
    '.tab-btn[data-filter="en-cours"]'
  ).textContent = `En cours (${
    statusCounts["processing"] || statusCounts["en-preparation"] || 0
  })`;
  document.querySelector(
    '.tab-btn[data-filter="livrees"]'
  ).textContent = `Livrées (${statusCounts["completed"] || 0})`;
  document.querySelector(
    '.tab-btn[data-filter="annulees"]'
  ).textContent = `Annulées (${statusCounts["cancelled"] || 0})`;
  // Add more status mappings as needed
}

/**
 * Initialize order filtering and search (basic placeholders).
 */
function initOrderFilters() {
  const tabs = document.querySelectorAll(".orders-tabs .tab-btn");
  const searchInput = document.getElementById("order-search");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
      const filter = this.dataset.filter;
      filterOrders(filter, searchInput.value);
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const activeTab = document.querySelector(".orders-tabs .tab-btn.active");
      const filter = activeTab ? activeTab.dataset.filter : "all";
      filterOrders(filter, this.value);
    });
  }
}

/**
 * Filter displayed orders based on status tab and search term.
 * @param {string} statusFilter - The status to filter by ('all', 'en-cours', 'livrees', etc.)
 * @param {string} searchTerm - The text to search for in order ID or product names.
 */
function filterOrders(statusFilter, searchTerm) {
  const orderCards = document.querySelectorAll(".orders-list .order-card");
  const searchTermLower = searchTerm.toLowerCase();

  orderCards.forEach((card) => {
    // Status mapping for filtering (adjust keys as needed)
    let cardStatus = card.dataset.status;
    let statusMatch = false;
    if (statusFilter === "all") {
      statusMatch = true;
    } else if (
      statusFilter === "en-cours" &&
      (cardStatus === "processing" || cardStatus === "en-preparation")
    ) {
      statusMatch = true;
    } else if (statusFilter === "livrees" && cardStatus === "completed") {
      statusMatch = true;
    } else if (statusFilter === "annulees" && cardStatus === "cancelled") {
      statusMatch = true;
    }
    // Add more specific status checks if needed

    // Basic search: check order number and first product title
    const orderNumber =
      card.querySelector(".order-number")?.textContent.toLowerCase() || "";
    const productTitle =
      card.querySelector(".product-title")?.textContent.toLowerCase() || "";
    const searchMatch =
      !searchTermLower ||
      orderNumber.includes(searchTermLower) ||
      productTitle.includes(searchTermLower);

    if (statusMatch && searchMatch) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
}

// Helper function (consider moving to main.js)
function formatDate(date) {
  if (!date || !(date instanceof Date)) return "-";
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Helper function (should use the one from cart.js or main.js)
function formatPrice(price) {
  if (typeof price !== "number") {
    price = parseFloat(price) || 0;
  }
  return price.toFixed(2).replace(".", ",") + " €";
}
