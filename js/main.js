/**
 * ArtiConnect - Main JavaScript
 * Handles global functionality across the site
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialiser la fonctionnalité du menu mobile
  initMobileMenu();

  // Initialiser le défilement doux pour les liens d'ancrage
  initSmoothScrolling();

  // Initialiser le comportement de défilement de l'en-tête
  initHeaderScroll();

  // Mettre à jour l'interface utilisateur de l'en-tête en fonction du statut de connexion
  updateHeaderUI();
});

/**
 * Mobile Menu Functionality
 */
function initMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const header = document.querySelector(".header");

  if (!menuToggle || !header) return;

  menuToggle.addEventListener("click", function () {
    header.classList.toggle("menu-active");

    // Basculer aria-expanded pour l'accessibilité
    const isExpanded = header.classList.contains("menu-active");
    menuToggle.setAttribute("aria-expanded", isExpanded);

    // Basculer le défilement du corps
    document.body.style.overflow = isExpanded ? "hidden" : "";
  });

  // Fermer le menu mobile en cliquant sur un lien de navigation
  const navLinks = document.querySelectorAll(".nav__link, .header .btn");
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      if (header.classList.contains("menu-active")) {
        header.classList.remove("menu-active");
        document.body.style.overflow = "";
        menuToggle.setAttribute("aria-expanded", false);
      }
    });
  });

  // Fermer le menu en cliquant à l'extérieur
  document.addEventListener("click", function (event) {
    if (
      header.classList.contains("menu-active") &&
      !event.target.closest(".header") &&
      !event.target.closest(".menu-toggle")
    ) {
      header.classList.remove("menu-active");
      document.body.style.overflow = "";
      menuToggle.setAttribute("aria-expanded", false);
    }
  });
}

/**
 * Smooth Scrolling for Anchor Links
 */
function initSmoothScrolling() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

  anchorLinks.forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (!targetElement) return;

      const headerHeight = document.querySelector(".header").offsetHeight;
      const targetPosition =
        targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = targetPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    });
  });
}

/**
 * Header Scroll Behavior
 * Adds a class to the header when scrolling down
 */
function initHeaderScroll() {
  const header = document.querySelector(".header");
  const scrollThreshold = 50;

  if (!header) return;

  window.addEventListener("scroll", function () {
    if (window.scrollY > scrollThreshold) {
      header.classList.add("header--scrolled");
    } else {
      header.classList.remove("header--scrolled");
    }
  });

  // Vérification initiale au chargement de la page
  if (window.scrollY > scrollThreshold) {
    header.classList.add("header--scrolled");
  }
}

/**
 * Utility to check if an element is in viewport
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} - True if element is in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Utility to add animation classes when elements come into view
 * @param {string} selector - CSS selector for elements to animate
 * @param {string} animationClass - The class to add for animation
 */
function animateOnScroll(selector, animationClass) {
  const elements = document.querySelectorAll(selector);

  if (!elements.length) return;

  function checkElements() {
    elements.forEach((element) => {
      if (
        isInViewport(element) &&
        !element.classList.contains(animationClass)
      ) {
        element.classList.add(animationClass);
      }
    });
  }

  // Vérifier au défilement
  window.addEventListener("scroll", checkElements);

  // Vérification initiale
  checkElements();
}

/**
 * Form validation utility
 * @param {HTMLFormElement} form - The form element to validate
 * @param {Object} rules - Validation rules
 * @returns {boolean} - True if form is valid
 */
function validateForm(form, rules) {
  let isValid = true;

  // Supprimer tous les messages d'erreur existants
  form.querySelectorAll(".form-error").forEach((error) => error.remove());

  // Vérifier chaque champ par rapport aux règles
  for (const fieldName in rules) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (!field) continue;

    const fieldRules = rules[fieldName];
    let fieldValue = field.value.trim();

    // Vérification obligatoire
    if (fieldRules.required && !fieldValue) {
      addErrorMessage(field, "Ce champ est obligatoire");
      isValid = false;
      continue;
    }

    // Validation de l'email
    if (fieldRules.email && fieldValue && !isValidEmail(fieldValue)) {
      addErrorMessage(field, "Veuillez entrer une adresse email valide");
      isValid = false;
    }

    // Longueur minimale
    if (fieldRules.minLength && fieldValue.length < fieldRules.minLength) {
      addErrorMessage(
        field,
        `Ce champ doit contenir au moins ${fieldRules.minLength} caractères`
      );
      isValid = false;
    }

    // Longueur maximale
    if (fieldRules.maxLength && fieldValue.length > fieldRules.maxLength) {
      addErrorMessage(
        field,
        `Ce champ ne peut pas dépasser ${fieldRules.maxLength} caractères`
      );
      isValid = false;
    }

    // Correspondance de motif
    if (
      fieldRules.pattern &&
      fieldValue &&
      !fieldRules.pattern.test(fieldValue)
    ) {
      addErrorMessage(field, fieldRules.patternMessage || "Format invalide");
      isValid = false;
    }

    // Validation personnalisée
    if (fieldRules.custom && typeof fieldRules.custom === "function") {
      const customResult = fieldRules.custom(fieldValue, form);
      if (customResult !== true) {
        addErrorMessage(field, customResult || "Valeur invalide");
        isValid = false;
      }
    }
  }

  return isValid;
}

/**
 * Add error message to a form field
 * @param {HTMLElement} field - The form field
 * @param {string} message - Error message to display
 */
function addErrorMessage(field, message) {
  const errorElement = document.createElement("span");
  errorElement.className = "form-error";
  errorElement.textContent = message;
  field.parentNode.appendChild(errorElement);
  field.classList.add("is-invalid");
}

/**
 * Email validation utility
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Password strength check utility
 * @param {string} password - Password to check
 * @returns {number} - Strength score (0-4)
 */
function checkPasswordStrength(password) {
  let score = 0;

  // Vérification de la longueur
  if (password.length >= 8) score++;

  // Contient des minuscules
  if (/[a-z]/.test(password)) score++;

  // Contient des majuscules
  if (/[A-Z]/.test(password)) score++;

  // Contient des chiffres
  if (/[0-9]/.test(password)) score++;

  // Contient des caractères spéciaux
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return Math.min(score, 4);
}

/**
 * Get URL parameter utility
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

// --- Données d'exemple de produits (Réponse simulée du backend) ---
const sampleProducts = [
  {
    id: 1,
    name: "Table basse en chêne massif",
    category: "Travail du bois",
    artisan: "Sophie Dupont",
    price: 620.0,
    imageUrl: "../../images/product-1.jpg",
    rating: 4.5,
    ratingCount: 24,
    detailUrl: "product_detail.html?id=1",
    description:
      "Cette table basse contemporaine est fabriquée à partir de chêne français massif...",
    specs: {
      longueur: "120 cm",
      largeur: "60 cm",
      hauteur: "45 cm",
      poids: "32 kg",
      materiaux: "Chêne massif français",
      finition: "Huile naturelle écologique",
    },
    images: [
      "../../images/product-1.jpg",
      "../../images/product-1-2.jpg",
      "../../images/product-1-3.jpg",
      "../../images/product-1-4.jpg",
    ],
    stock: 3,
  },
  {
    id: 2,
    name: "Étagère murale sur mesure",
    category: "Travail du bois",
    artisan: "Lucas Morin",
    price: 345.0,
    imageUrl: "../../images/product-2.jpg",
    rating: 4.0,
    ratingCount: 18,
    detailUrl: "product_detail.html?id=2",
    description:
      "Étagère murale élégante et fonctionnelle, parfaite pour exposer vos objets préférés.",
    specs: {
      longueur: "90 cm",
      largeur: "20 cm",
      hauteur: "25 cm",
      poids: "8 kg",
      materiaux: "Noyer massif",
      finition: "Vernis satiné",
    },
    images: ["../../images/product-2.jpg"],
    stock: 5,
  },
  {
    id: 3,
    name: "Vase en céramique émaillée",
    category: "Céramique",
    artisan: "Emma Bernard",
    price: 85.0,
    imageUrl: "../../images/product-3.jpg",
    rating: 4.8,
    ratingCount: 35,
    detailUrl: "product_detail.html?id=3",
    description:
      "Vase unique tourné à la main avec un émail réactif bleu profond.",
    specs: {
      hauteur: "25 cm",
      diametre: "15 cm",
      poids: "1.5 kg",
      materiaux: "Grès",
      finition: "Émail réactif",
    },
    images: ["../../images/product-3.jpg"],
    stock: 10,
  },
  {
    id: 4,
    name: "Sac à main en cuir végétal",
    category: "Maroquinerie",
    artisan: "Thomas Petit",
    price: 210.0,
    imageUrl: "../../images/product-4.jpg",
    rating: 4.2,
    ratingCount: 15,
    detailUrl: "product_detail.html?id=4",
    description:
      "Sac à main spacieux et durable, fabriqué à partir de cuir de liège écologique.",
    specs: {
      longueur: "35 cm",
      largeur: "15 cm",
      hauteur: "28 cm",
      poids: "0.8 kg",
      materiaux: "Cuir de liège, doublure coton bio",
      finition: "Naturelle",
    },
    images: ["../../images/product-4.jpg"],
    stock: 7,
  },
  {
    id: 5,
    name: "Collier argent et pierre de lune",
    category: "Bijouterie",
    artisan: "Mylène Gagnon",
    price: 130.0,
    imageUrl: "../../images/product-5.jpg",
    rating: 4.9,
    ratingCount: 41,
    detailUrl: "product_detail.html?id=5",
    description:
      "Collier délicat en argent sterling 925 orné d'une pierre de lune véritable.",
    specs: {
      longueur_chaine: "45 cm",
      taille_pendentif: "1.5 cm",
      poids: "5 g",
      materiaux: "Argent 925, Pierre de lune",
      finition: "Poli",
    },
    images: ["../../images/product-5.jpg"],
    stock: 15,
  },
  {
    id: 6,
    name: "Planche à découper design",
    category: "Travail du bois",
    artisan: "Lucas Morin",
    price: 75.0,
    imageUrl: "../../images/product-6.jpg",
    rating: 4.6,
    ratingCount: 29,
    detailUrl: "product_detail.html?id=6",
    description:
      "Planche à découper robuste en bois de bout, idéale pour la cuisine.",
    specs: {
      longueur: "40 cm",
      largeur: "30 cm",
      epaisseur: "4 cm",
      poids: "3 kg",
      materiaux: "Érable et Noyer",
      finition: "Huile minérale alimentaire",
    },
    images: ["../../images/product-6.jpg"],
    stock: 8,
  },
  {
    id: 7,
    name: "Tasse à café unique",
    category: "Céramique",
    artisan: "Sophie Dupont",
    price: 40.0,
    imageUrl: "../../images/product-7.jpg",
    rating: 4.7,
    ratingCount: 52,
    detailUrl: "product_detail.html?id=7",
    description:
      "Tasse à café artisanale avec une anse confortable et un émail texturé.",
    specs: {
      hauteur: "10 cm",
      diametre: "8 cm",
      capacite: "300 ml",
      poids: "0.4 kg",
      materiaux: "Porcelaine",
      finition: "Émail mat",
    },
    images: ["../../images/product-7.jpg"],
    stock: 20,
  },
  {
    id: 8,
    name: "Coussin tissé main",
    category: "Textile et couture",
    artisan: "Artisan Anonyme",
    price: 95.0,
    imageUrl: "../../images/product-8.jpg",
    rating: 4.3,
    ratingCount: 11,
    detailUrl: "product_detail.html?id=8",
    description:
      "Coussin décoratif tissé à la main avec des motifs géométriques.",
    specs: {
      longueur: "45 cm",
      largeur: "45 cm",
      poids: "0.6 kg",
      materiaux: "Laine et coton, rembourrage plumes",
      finition: "Tissé main",
    },
    images: ["../../images/product-8.jpg"],
    stock: 6,
  },
];
// --- Fin des données d'exemple de produits ---

// Exporter les utilitaires et les données pour utilisation dans d'autres scripts
window.articonnect = {
  validateForm,
  checkPasswordStrength,
  getUrlParameter,
  isInViewport,
  animateOnScroll,
  sampleProducts, // Exposer les produits d'exemple globalement
  updateHeaderUI, // Exposer la fonction de mise à jour de l'en-tête
};

/**
 * Update Header UI based on Login Status
 */
function updateHeaderUI() {
  const headerActions = document.querySelector(".header__actions");
  if (!headerActions) return;

  // Déterminer le contexte du chemin actuel
  const currentPagePath = window.location.pathname;

  // Définir les préfixes de chemin en fonction de l'emplacement actuel par rapport au répertoire 'html'
  let clientPrefix = "";
  let artisanPrefix = "";
  let authPrefix = "";
  let indexPath = "";
  let imagePrefix = ""; // Préfixe pour les images comme le logo

  // Vérifier si nous sommes profondément dans html/client, html/artisan, ou html/auth
  if (
    currentPagePath.includes("/html/client/") ||
    currentPagePath.includes("/html/artisan/") ||
    currentPagePath.includes("/html/auth/")
  ) {
    clientPrefix = "../client/";
    artisanPrefix = "../artisan/";
    authPrefix = "../auth/";
    indexPath = "../index.html"; // CORRECT : Remonter d'un niveau depuis client/artisan/auth
    imagePrefix = "../../"; // Remonter de deux niveaux pour les images depuis la racine
  }
  // Vérifier si nous sommes directement dans html/ (comme html/index.html)
  else if (currentPagePath.includes("/html/")) {
    clientPrefix = "client/"; // Répertoire frère
    artisanPrefix = "artisan/";
    authPrefix = "auth/";
    indexPath = "index.html"; // CORRECT : Déjà dans le répertoire html/
    imagePrefix = "../"; // Remonter d'un niveau pour les images depuis la racine
  }
  // Nous sommes potentiellement en dehors de /html/ (par ex., racine du projet)
  else {
    clientPrefix = "html/client/"; // Besoin d'aller dans html/ puis client/
    artisanPrefix = "html/artisan/";
    authPrefix = "html/auth/";
    indexPath = "html/index.html"; // CORRECT : Chemin relatif à la racine du projet
    imagePrefix = ""; // Les images sont relatives à la racine
  }

  // Construire les chemins complets
  const clientPath = clientPrefix; // Chemin de base pour les pages client
  const artisanPath = artisanPrefix; // Chemin de base pour les pages artisan
  const authPath = authPrefix; // Chemin de base pour les pages d'authentification

  // Mettre à jour le chemin du logo si nécessaire (en supposant que le logo est toujours à la racine/images)
  const logoImg = document.querySelector(".header__logo img");
  if (logoImg) {
    // S'assurer que le chemin commence correctement en fonction du préfixe calculé
    // Éviter les doubles barres obliques si imagePrefix est vide
    logoImg.src = imagePrefix
      ? imagePrefix + "images/logo.svg"
      : "images/logo.svg";
  }

  const userString = localStorage.getItem("articonnect_user");
  let user = null;
  if (userString) {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      console.error("Error parsing user data from localStorage", e);
      localStorage.removeItem("articonnect_user"); // Effacer les données corrompues
    }
  }

  // Effacer les actions existantes (important pour supprimer les liens statiques)
  headerActions.innerHTML = "";

  if (user && user.email && user.type) {
    // --- L'utilisateur est connecté ---
    const profileUrl =
      user.type === "artisan"
        ? artisanPath + "profile.html"
        : clientPath + "profile.html";

    // Ajouter l'icône du panier (visible pour les clients)
    if (user.type === "client") {
      const cartLink = document.createElement("a");
      cartLink.href = clientPath + "cart.html"; // Utiliser le chemin dynamique
      cartLink.classList.add("header__cart-icon");
      cartLink.setAttribute("aria-label", "Panier");
      cartLink.innerHTML =
        '<i class="fas fa-shopping-cart"></i><span class="cart-count">0</span>'; // Ajouter l'élément span du compteur de panier
      headerActions.appendChild(cartLink);
      // TODO : Mettre à jour le compteur de panier dynamiquement
    }

    // Ajouter le lien Profil/Compte
    const profileLink = document.createElement("a");
    profileLink.href = profileUrl; // Utiliser le chemin dynamique
    profileLink.classList.add("btn", "btn--outline");
    profileLink.textContent = "Mon Compte";
    headerActions.appendChild(profileLink);

    // Ajouter le bouton Déconnexion
    const logoutButton = document.createElement("button");
    logoutButton.classList.add("btn", "btn--primary");
    logoutButton.textContent = "Déconnexion";
    // Passer le chemin d'index relatif correctement calculé à la fonction de déconnexion
    logoutButton.addEventListener("click", () => logout(indexPath));
    headerActions.appendChild(logoutButton);
  } else {
    // --- L'utilisateur est déconnecté ---
    // Ajouter les boutons Connexion/Inscription par défaut, en vérifiant la page actuelle pour éviter de lier à soi-même

    if (!currentPagePath.includes("/auth/login.html")) {
      // Utiliser currentPagePath
      const loginLink = document.createElement("a");
      // Construire le href correct en utilisant l'authPath calculé
      loginLink.href = authPath + "login.html";
      loginLink.classList.add("btn", "btn--outline");
      loginLink.textContent = "Connexion";
      headerActions.appendChild(loginLink);
    }

    if (!currentPagePath.includes("/auth/register.html")) {
      // Utiliser currentPagePath
      const registerLink = document.createElement("a");
      // Construire le href correct en utilisant l'authPath calculé
      registerLink.href = authPath + "register.html";
      registerLink.classList.add("btn", "btn--primary");
      registerLink.textContent = "Inscription";
      headerActions.appendChild(registerLink);
    }
  }
}

/**
 * Logout Function - Accepts the correct path to index.html
 * @param {string} indexPath - The relative path to index.html from the current page.
 */
function logout(indexPath) {
  localStorage.removeItem("articonnect_user");
  // Rediriger vers la page d'accueil en utilisant le chemin fourni
  window.location.href = indexPath;
}

// Exposer updateHeaderUI globalement si nécessaire pour d'autres scripts, ou se fier à DOMContentLoaded
window.articonnect = {
  ...window.articonnect, // Préserver les utilitaires existants
  updateHeaderUI, // Ajouter la nouvelle fonction
};
