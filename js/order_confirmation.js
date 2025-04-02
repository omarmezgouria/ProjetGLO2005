/**
 * ArtiConnect - Order Confirmation Page JavaScript
 * Handles order confirmation functionality
 */

document.addEventListener("DOMContentLoaded", function () {
  // Afficher les informations de la commande
  displayOrderInfo();

  // Initialiser le bouton Continuer les achats
  initContinueShopping();

  // Initialiser le suivi de commande
  initOrderTracking();
});

/**
 * Display order information based on orderId from URL parameter and data from localStorage.
 */
function displayOrderInfo() {
  const orderId = getUrlParameter("orderId"); // Utiliser le nom de paramètre défini dans checkout.js
  const confirmationBox = document.querySelector(".confirmation-box");

  if (!orderId || !confirmationBox) {
    console.error("Order ID missing or confirmation box not found.");
    if (confirmationBox) {
      confirmationBox.innerHTML =
        '<p class="error-message">Impossible de trouver les détails de la commande. ID de commande manquant.</p>';
    }
    return;
  }

  // Récupérer les commandes depuis localStorage
  const ordersJson = localStorage.getItem("articonnect_orders");
  const orders = ordersJson ? JSON.parse(ordersJson) : [];

  // Trouver la commande spécifique
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    console.error(`Order with ID ${orderId} not found in localStorage.`);
    confirmationBox.innerHTML = `<p class="error-message">Impossible de trouver les détails de la commande pour l'ID : ${orderId}</p>`;
    return;
  }

  // --- Remplir les éléments de la page ---
  document.getElementById("order-id").textContent = order.id;
  document.getElementById("order-date").textContent = formatDate(
    new Date(order.date)
  ); // Formater la date stockée

  // Remplir la liste des articles
  const itemsList = document.getElementById("order-items-list");
  itemsList.innerHTML = ""; // Effacer l'espace réservé
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

  // Remplir les totaux
  document.getElementById("order-subtotal").textContent = formatPrice(
    order.subtotal
  );

  // Discount display logic removed as promo codes are removed
  document.getElementById("shipping-method").textContent = order.shippingMethod;
  document.getElementById("order-shipping").textContent =
    order.shippingCost > 0 ? formatPrice(order.shippingCost) : "Gratuit";
  document.getElementById("order-total").textContent = formatPrice(order.total);

  // Remplir l'adresse de livraison
  document.getElementById("delivery-address").textContent =
    order.deliveryAddress;

  // Le panier devrait déjà être vidé par checkout.js, pas besoin de le vider ici.
  // Le compteur de l'en-tête devrait se mettre à jour automatiquement via l'événement 'cartUpdated'.
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

      // Dans une implémentation réelle, cela redirigerait vers la page de suivi de commande
      // Pour la démo, rediriger vers le détail de la commande
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
  // Dans une implémentation réelle, cela serait géré par le serveur
}
