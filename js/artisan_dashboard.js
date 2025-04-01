/**
 * ArtiConnect - Artisan Dashboard JavaScript
 * Handles functionality for the artisan dashboard pages
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize dashboard UI components
  initDashboardUI();

  // Initialize sales chart (if on dashboard page)
  initSalesChart();

  // Initialize order management (if on orders page)
  initOrderManagement();

  // Initialize product management (if on products page)
  initProductManagement();

  // Initialize inventory management (if on inventory page)
  initInventoryManagement();
});

/**
 * Initialize common dashboard UI components
 */
function initDashboardUI() {
  // Initialize sidebar toggle for mobile
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.toggle("active");
    });
  }

  // Initialize dropdowns
  initDropdowns();
}

/**
 * Initialize dropdown menus
 */
function initDropdowns() {
  // User dropdown
  const userMenu = document.querySelector(".user-menu");
  const userMenuBtn = document.querySelector(".user-menu-btn");

  if (userMenu && userMenuBtn) {
    userMenuBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      userMenu.classList.toggle("active");

      // Notifications dropdown logic removed
    });
  }

  // Notifications dropdown logic removed

  // Close dropdowns when clicking elsewhere
  document.addEventListener("click", function (e) {
    if (
      !e.target.closest(".user-menu") // && !e.target.closest(".notifications") // Removed
    ) {
      if (userMenu) userMenu.classList.remove("active");
      // if (notifications) notifications.classList.remove("active"); // Removed
    }
  });

  // Mark all notifications as read logic removed
}

/**
 * Initialize artisan status toggle
 */

/**
 * Initialize sales chart on dashboard
 */
function initSalesChart() {
  const chartContainer = document.querySelector(".chart-container");

  if (!chartContainer) return;

  // For a real implementation, you would use a library like Chart.js
  // For demo, we're using placeholder bars
  const chartBars = document.querySelectorAll(".chart-bar");

  if (chartBars.length) {
    // Animate chart bars
    chartBars.forEach((bar, index) => {
      setTimeout(() => {
        const height = bar.style.height;
        bar.style.height = "0%";

        setTimeout(() => {
          bar.style.height = height;
        }, 100);
      }, index * 100);
    });
  }
}

/**
 * Initialize order management functionality
 */
function initOrderManagement() {
  const ordersTable = document.querySelector(".orders-table");
  if (!ordersTable) return;

  // Order status tabs
  const statusTabs = document.querySelectorAll(".tab-btn");
  if (statusTabs.length) {
    statusTabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        // Update active tab
        statusTabs.forEach((t) => t.classList.remove("active"));
        this.classList.add("active");

        // Filter orders by status
        const status = this.dataset.status;
        filterOrdersByStatus(status);
      });
    });
  }

  // Initialize order action buttons
  initOrderActions();
}

/**
 * Filter orders by status
 * @param {string} status - Status to filter by ('all' for all orders)
 */
function filterOrdersByStatus(status) {
  const orderRows = document.querySelectorAll(".orders-table tbody tr");

  orderRows.forEach((row) => {
    if (status === "all" || row.dataset.status === status) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

/**
 * Initialize order action buttons
 */
function initOrderActions() {
  // Process order button
  const processButtons = document.querySelectorAll(".process-btn");
  if (processButtons.length) {
    processButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const row = this.closest("tr");
        const orderId = row.querySelector(".order-id a").textContent;

        // In a real implementation, this would call an API
        // For demo, just update the status
        const statusCell = row.querySelector(".order-status");
        statusCell.innerHTML =
          '<span class="status-badge in-progress">En préparation</span>';

        // Update row data status
        row.dataset.status = "in-progress";

        // Show confirmation
        showNotification(`Commande ${orderId} maintenant en préparation`);
      });
    });
  }

  // View order details button
  const viewButtons = document.querySelectorAll(".view-btn");
  if (viewButtons.length) {
    viewButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const row = this.closest("tr");
        const orderIdLink = row.querySelector(".order-id a");
        if (orderIdLink) {
          window.location.href = orderIdLink.href;
        }
      });
    });
  }
}

/**
 * Initialize product management functionality
 */
function initProductManagement() {
  const productsGrid = document.querySelector(".products-grid");
  if (!productsGrid) return;

  // Grid/List view toggle
  const viewButtons = document.querySelectorAll(".view-btn");
  if (viewButtons.length) {
    viewButtons.forEach((button) => {
      button.addEventListener("click", function () {
        viewButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        const viewType = this.dataset.view;
        productsGrid.className = `products-grid view-${viewType}`;
      });
    });
  }

  // Initialize product action buttons
  initProductActions();
}

/**
 * Initialize product action buttons
 */
function initProductActions() {
  // Edit product button
  const editButtons = document.querySelectorAll(".edit-btn");
  if (editButtons.length) {
    editButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productItem = this.closest(".product-item");
        const productTitle =
          productItem.querySelector(".product-title").textContent;

        // In a real implementation, this would redirect to edit page
        // For demo, just show alert
        alert(`Édition du produit: ${productTitle}`);
      });
    });
  }

  // Duplicate product button
  const duplicateButtons = document.querySelectorAll(".duplicate-btn");
  if (duplicateButtons.length) {
    duplicateButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productItem = this.closest(".product-item");
        const productTitle =
          productItem.querySelector(".product-title").textContent;

        // In a real implementation, this would call an API
        // For demo, just show notification
        showNotification(`Produit dupliqué: ${productTitle}`);
      });
    });
  }

  // Delete product button
  const deleteButtons = document.querySelectorAll(".delete-btn");
  if (deleteButtons.length) {
    deleteButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productItem = this.closest(".product-item");
        const productTitle =
          productItem.querySelector(".product-title").textContent;

        if (confirm(`Êtes-vous sûr de vouloir supprimer "${productTitle}"?`)) {
          // Animate removal
          productItem.classList.add("removing");

          setTimeout(() => {
            productItem.remove();
            console.log(`Produit supprimé: ${productTitle}`);
          }, 300);
        }
      });
    });
  }
}

/**
 * Initialize inventory management functionality
 */
function initInventoryManagement() {
  const inventoryTable = document.querySelector(".inventory-table");
  if (!inventoryTable) return;

  // Stock input fields
  const stockInputs = document.querySelectorAll(".stock-input");
  if (stockInputs.length) {
    stockInputs.forEach((input) => {
      // Store original value
      input.dataset.original = input.value;

      input.addEventListener("change", function () {
        const row = this.closest("tr");
        const productName = row.querySelector(".product-name").textContent;
        const newValue = parseInt(this.value);
        const originalValue = parseInt(this.dataset.original);

        // Update status badge based on new stock level
        const statusBadge = row.querySelector(".status-badge");
        const thresholdValue = parseInt(
          row.querySelector(".threshold-input").value
        );

        if (newValue <= 0) {
          statusBadge.className = "status-badge out-stock";
          statusBadge.textContent = "Épuisé";
        } else if (newValue <= thresholdValue) {
          statusBadge.className = "status-badge low-stock";
          statusBadge.textContent = "Stock bas";
        } else {
          statusBadge.className = "status-badge in-stock";
          statusBadge.textContent = "En stock";
        }

        // Show notification of change
        if (newValue !== originalValue) {
          console.log(
            `Stock mis à jour: ${productName} (${originalValue} → ${newValue})`
          );
          this.dataset.original = newValue;
        }
      });
    });
  }
}

// showNotification function and related CSS removed.
