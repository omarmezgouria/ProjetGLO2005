/**
 * ArtiConnect - Dashboard JavaScript
 * Handles functionality for dashboard pages
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialiser les menus déroulants
  initDropdowns();

  // Initialiser la barre latérale mobile
  initMobileSidebar();

  // Initialiser les interactions produit
  initProductInteractions();

  // Initialiser la fonctionnalité des cases à cocher pour les tâches (si présentes)
  initCheckboxes();

  // Gérer la fonctionnalité d'ajout de tâche (si présente)
  initAddTodo();

  // Simuler les animations de graphiques
  animateCharts();
});

/**
 * Initialize dropdown menus
 */
function initDropdowns() {
  // Menu déroulant utilisateur
  const userMenu = document.querySelector(".user-menu");
  const userMenuBtn = document.querySelector(".user-menu-btn");

  if (userMenu && userMenuBtn) {
    userMenuBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      userMenu.classList.toggle("active");

      // Fermer les autres menus déroulants
      document.querySelectorAll(".notifications").forEach((dropdown) => {
        dropdown.classList.remove("active");
      });
    });
  }

  // Menu déroulant notifications
  const notifications = document.querySelector(".notifications");
  const notificationBtn = document.querySelector(".notification-btn");

  if (notifications && notificationBtn) {
    notificationBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      notifications.classList.toggle("active");

      // Fermer les autres menus déroulants
      document.querySelectorAll(".user-menu").forEach((dropdown) => {
        dropdown.classList.remove("active");
      });
    });
  }

  // Fermer les menus déroulants en cliquant à l'extérieur
  document.addEventListener("click", function (e) {
    if (
      !e.target.closest(".user-menu") &&
      !e.target.closest(".notifications")
    ) {
      document
        .querySelectorAll(".user-menu, .notifications")
        .forEach((dropdown) => {
          dropdown.classList.remove("active");
        });
    }
  });

  // Marquer toutes les notifications comme lues
  const markAllReadBtn = document.querySelector(".mark-all-read");

  if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", function () {
      const unreadNotifications = document.querySelectorAll(
        ".notification-item.unread"
      );
      unreadNotifications.forEach((notification) => {
        notification.classList.remove("unread");
      });

      // Mettre à jour le compteur du badge de notification
      const badge = document.querySelector(".notification-badge");
      if (badge) {
        badge.textContent = "0";
        badge.style.display = "none";
      }
    });
  }

  // Menu déroulant plage de dates
  const dateRangeBtn = document.querySelector(".date-range-btn");

  if (dateRangeBtn) {
    dateRangeBtn.addEventListener("click", function () {
      // Cela ouvrirait normalement un sélecteur de date
      console.log("Date range picker would open here");
    });
  }
}

/**
 * Initialize mobile sidebar
 */
function initMobileSidebar() {
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.toggle("active");
    });

    // Fermer la barre latérale en cliquant sur un lien (mobile)
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove("active");
        }
      });
    });

    // Fermer la barre latérale en cliquant à l'extérieur
    document.addEventListener("click", function (e) {
      if (
        window.innerWidth <= 768 &&
        !e.target.closest(".sidebar") &&
        !e.target.closest(".menu-toggle") &&
        sidebar.classList.contains("active")
      ) {
        sidebar.classList.remove("active");
      }
    });
  }
}

/**
 * Initialize product interactions
 */
function initProductInteractions() {
  // Effets de survol des articles produit
  const productItems = document.querySelectorAll(".product-item");

  if (productItems.length) {
    productItems.forEach((item) => {
      item.addEventListener("mouseenter", function () {
        this.querySelector(".product-image img").style.transform =
          "scale(1.05)";
      });

      item.addEventListener("mouseleave", function () {
        this.querySelector(".product-image img").style.transform = "scale(1)";
      });
    });
  }

  // Effets de survol des actions rapides
  const actionItems = document.querySelectorAll(".action-item");

  if (actionItems.length) {
    actionItems.forEach((item) => {
      item.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-5px)";
      });

      item.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)";
      });
    });
  }

  // Simuler la gestion des stocks
  const stockItems = document.querySelectorAll(".stock");
  if (stockItems.length) {
    stockItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Cela ouvrirait une modale de gestion des stocks dans une implémentation réelle
        alert(
          "Gestion du stock: " +
            this.closest(".product-item").querySelector("h4").textContent
        );
      });
    });
  }
}

/**
 * Animate chart bars for demonstration
 */
function animateCharts() {
  const chartBars = document.querySelectorAll(".chart-bar");

  if (chartBars.length) {
    // Ajouter une animation aux barres du graphique
    chartBars.forEach((bar, index) => {
      setTimeout(() => {
        bar.style.height = bar.style.height || "0%";
      }, index * 100);
    });
  }
}

/**
 * Initialize checkbox functionality for todo items
 */
function initCheckboxes() {
  const todoCheckboxes = document.querySelectorAll(
    '.todo-checkbox input[type="checkbox"]'
  );

  todoCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const todoItem = this.closest(".todo-item");
      if (this.checked) {
        todoItem.classList.add("completed");
      } else {
        todoItem.classList.remove("completed");
      }
    });
  });
}

/**
 * Handle add todo functionality
 */
function initAddTodo() {
  const addTodoBtn = document.querySelector(".add-todo-btn");

  if (addTodoBtn) {
    addTodoBtn.addEventListener("click", function () {
      showAddTodoModal();
    });
  }
}

/**
 * Show modal for adding a new todo item
 */
function showAddTodoModal() {
  // Cela créerait et afficherait normalement une modale
  console.log("Add todo modal would appear here");

  // Exemple d'implémentation :
  /*
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Ajouter une tâche</h3>
                <button class="close-modal-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="todo-text" class="form-label">Description</label>
                    <input type="text" id="todo-text" class="form-control" placeholder="Que devez-vous faire?">
                </div>
                <div class="form-group">
                    <label class="form-label">Priorité</label>
                    <div class="priority-options">
                        <label class="priority-option">
                            <input type="radio" name="priority" value="low">
                            <span class="priority-label">Basse</span>
                        </label>
                        <label class="priority-option">
                            <input type="radio" name="priority" value="medium" checked>
                            <span class="priority-label">Moyenne</span>
                        </label>
                        <label class="priority-option">
                            <input type="radio" name="priority" value="high">
                            <span class="priority-label">Haute</span>
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="todo-date" class="form-label">Date limite</label>
                    <input type="date" id="todo-date" class="form-control">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn--outline">Annuler</button>
                <button class="btn btn--primary">Ajouter</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    */
}
