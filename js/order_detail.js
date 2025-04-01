/**
 * ArtiConnect - Order Detail Page JavaScript
 * Handles functionality for the order detail page
 */

document.addEventListener("DOMContentLoaded", function () {
  // Vérifier d'abord le statut de connexion
  checkLoginStatus();

  // Charger les détails de la commande depuis localStorage en fonction du paramètre URL
  loadOrderDetails();

  // Initialiser les éléments interactifs si nécessaire
  initOrderDetailActions();
});

/**
 * Checks if user is logged in, redirects to login if not.
 */
function checkLoginStatus() {
  const userString = localStorage.getItem("articonnect_user");
  if (!userString) {
    window.location.href = "../auth/login.html"; // Ajuster le chemin si nécessaire
    return false; // Indiquer que l'utilisateur n'est pas connecté
  }
  // Optionnel : Vérifier si le type d'utilisateur est client
  try {
    const user = JSON.parse(userString);
    if (user.type !== "client") {
      console.warn("Non-client accessing client order detail.");
      // Rediriger les non-clients ? Ou laisser loadOrderDetails gérer le filtrage ?
      // window.location.href = "../index.html";
      // return false;
    }
  } catch (e) {
    console.error("Error parsing user data", e);
    localStorage.removeItem("articonnect_user");
    window.location.href = "../auth/login.html";
    return false;
  }
  return true; // L'utilisateur est connecté
}

/**
 * Load order details based on orderId from URL parameter and data from localStorage.
 */
function loadOrderDetails() {
  const orderId = getUrlParameter("orderId"); // Utiliser la fonction définie ci-dessous ou depuis main.js
  const orderDetailPage = document.querySelector(
    ".order-detail-page .container"
  ); // Conteneur principal

  if (!orderId || !orderDetailPage) {
    console.error("Order ID missing or order detail page container not found.");
    if (orderDetailPage) {
      orderDetailPage.innerHTML =
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
    orderDetailPage.innerHTML = `<p class="error-message">Impossible de trouver les détails de la commande pour l'ID : ${orderId}</p>`;
    return;
  }

  // Optionnel : Vérifier que cette commande appartient à l'utilisateur connecté
  const userString = localStorage.getItem("articonnect_user");
  const currentUser = userString ? JSON.parse(userString) : null;
  if (!currentUser || !order.user || currentUser.email !== order.user.email) {
    console.error(
      `User ${currentUser?.email} attempting to access order ${orderId} belonging to ${order.user?.email}`
    );
    orderDetailPage.innerHTML = `<p class="error-message">Vous n'êtes pas autorisé à voir cette commande.</p>`;
    return;
  }

  // --- Remplir les éléments de la page ---

  // Titre de la page
  document.title = `ArtiConnect - Détail Commande #${order.id}`;

  // Fil d'Ariane & Titre de l'en-tête
  document.querySelectorAll(".current, .order-title h1").forEach((el) => {
    el.textContent = `Commande #${order.id}`;
  });
  document.querySelector(".order-title .order-date").textContent = formatDate(
    new Date(order.date)
  );

  // Badge de statut
  const statusBadge = document.querySelector(".order-status .status-badge");
  if (statusBadge) {
    const statusClass = order.status
      ? order.status.toLowerCase().replace(/\s+/g, "-")
      : "inconnu";
    let statusText = order.status || "Inconnu";
    if (statusClass === "completed") statusText = "Livrée";
    else if (statusClass === "processing") statusText = "En préparation";
    // Ajouter plus de statuts si nécessaire
    statusBadge.className = `status-badge ${statusClass}`;
    statusBadge.textContent = statusText;
  }

  // Produits de la commande
  const productsContainer = document.querySelector(".order-products");
  productsContainer.innerHTML = ""; // Effacer l'espace réservé
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

  // Chronologie de la commande (Simulation de base basée sur le statut)
  const timelineItems = document.querySelectorAll(
    ".order-timeline .timeline-item"
  );
  let activeReached = false;
  timelineItems.forEach((item) => {
    item.classList.remove("active", "completed");
    // Logique de base : Marquer comme terminé jusqu'au statut actuel, marquer l'actuel comme actif
    const itemStatusText = item
      .querySelector(".timeline-title")
      ?.textContent.toLowerCase();
    let itemStatusClass = "unknown";
    if (itemStatusText?.includes("confirmée")) itemStatusClass = "confirmed"; // En supposant que le statut 'Completed' signifie confirmé
    if (itemStatusText?.includes("paiement")) itemStatusClass = "paid"; // En supposant que le statut 'Completed' signifie payé
    if (itemStatusText?.includes("préparation")) itemStatusClass = "processing";
    if (itemStatusText?.includes("expédié")) itemStatusClass = "shipped";
    if (itemStatusText?.includes("livré")) itemStatusClass = "completed";

    const orderStatusClass = order.status
      ? order.status.toLowerCase().replace(/\s+/g, "-")
      : "unknown";

    // Déterminer l'achèvement en fonction d'un ordre simple supposé des statuts
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
    // S'assurer que 'Commande confirmée' et 'Paiement accepté' sont toujours terminés si le statut de la commande est >= processing
    if (
      (itemStatusClass === "confirmed" || itemStatusClass === "paid") &&
      currentStatusIndex >= statusOrder.indexOf("processing")
    ) {
      item.classList.add("completed");
    }
  });

  // Informations sur l'artisan (si disponibles dans les articles de la commande - nécessite un ajustement si stocké différemment)
  const artisanInfoCard = document.querySelector(".artisan-info-card");
  const firstItemWithArtisan = order.items.find((item) => item.artisan);
  if (artisanInfoCard && firstItemWithArtisan) {
    artisanInfoCard.querySelector(".artisan-name").textContent =
      firstItemWithArtisan.artisan;
    // TODO : Remplir les autres détails de l'artisan si disponibles
  } else if (artisanInfoCard) {
    artisanInfoCard.style.display = "none"; // Masquer si aucune information sur l'artisan
  }

  // Barre latérale du résumé de la commande
  document.querySelector(
    ".order-sidebar .summary-row:nth-child(1) .summary-value"
  ).textContent = formatPrice(order.subtotal);
  document.querySelector(
    ".order-sidebar .summary-row:nth-child(2) .summary-value"
  ).textContent =
    order.shippingCost > 0 ? formatPrice(order.shippingCost) : "Gratuit";

  const summaryDiscountRow = document.querySelector(
    ".order-sidebar .summary-row.discount"
  ); // En supposant qu'une ligne de remise existe
  const summaryDiscountValue =
    summaryDiscountRow?.querySelector(".summary-value");
  if (summaryDiscountRow && summaryDiscountValue && order.discount > 0) {
    let discountText = `-${formatPrice(order.discount)}`;
    if (order.discountType === "percent") {
      // Besoin du sous-total original pour calculer la valeur en pourcentage si seul le pourcentage est stocké
      // Ou stocker le montant de la remise calculé dans l'objet commande
      // En supposant que order.discount stocke le montant calculé ici
      // discountText += ` (${order.discountPercent}%)`; // Si le pourcentage était stocké
    }
    summaryDiscountValue.textContent = discountText;
    summaryDiscountRow.style.display = "";
  } else if (summaryDiscountRow) {
    summaryDiscountRow.style.display = "none";
  }
  // TODO : Ajouter la ligne Taxes si applicable

  document.querySelector(
    ".order-sidebar .summary-row.total .summary-value"
  ).textContent = formatPrice(order.total);

  // Barre latérale des informations de livraison
  document.querySelector(".delivery-info .delivery-address").innerHTML = `
        <h3 class="address-type">Adresse de livraison</h3>
        ${order.deliveryAddress
          .split(", ")
          .map((line) => `<p class="address-line">${line}</p>`)
          .join("")}
    `; // Formatage de base
  document.querySelector(
    ".delivery-info .delivery-method .delivery-name"
  ).textContent = order.shippingMethod;
  // TODO : Mettre à jour la livraison estimée en fonction du statut/date de la commande

  // Barre latérale des informations de paiement (Espace réservé de base)
  const paymentDetails = document.querySelector(
    ".payment-info .payment-details"
  );
  if (paymentDetails) {
    // Espace réservé - une application réelle récupérerait les détails de paiement de manière sécurisée
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
  // Exemple : Bouton Contacter l'artisan
  const contactBtn = document.querySelector(".contact-artisan-btn");
  if (contactBtn) {
    contactBtn.addEventListener("click", () => {
      alert(
        "Simulation: Ouverture du formulaire de contact de l'artisan (non implémenté)."
      );
    });
  }
  // Ajouter des gestionnaires pour d'autres boutons comme Imprimer, Aide, Recommander, etc.
}

// Fonction utilitaire (copiée depuis orders.js - idéalement à déplacer vers main.js)
function formatDate(date) {
  if (!date || !(date instanceof Date)) return "-";
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Fonction utilitaire (copiée depuis cart.js - idéalement à déplacer vers main.js)
function formatPrice(price) {
  if (typeof price !== "number") {
    price = parseFloat(price) || 0;
  }
  return price.toFixed(2).replace(".", ",") + " €";
}

// Fonction utilitaire (copiée depuis order_confirmation.js - idéalement à déplacer vers main.js)
function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  const results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}
