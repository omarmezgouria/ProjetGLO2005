/**
 * ArtiConnect - Main JavaScript
 * Handles global functionality across the site
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize mobile menu functionality
  initMobileMenu();

  // Initialize smooth scrolling for anchor links
  initSmoothScrolling();

  // Initialize header scroll behavior
  initHeaderScroll();

  // Update header UI based on login status
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

    // Toggle aria-expanded for accessibility
    const isExpanded = header.classList.contains("menu-active");
    menuToggle.setAttribute("aria-expanded", isExpanded);

    // Toggle body scroll
    document.body.style.overflow = isExpanded ? "hidden" : "";
  });

  // Close the mobile menu when clicking on a nav link
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

  // Close menu when clicking outside
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

  // Initial check on page load
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

  // Check on scroll
  window.addEventListener("scroll", checkElements);

  // Initial check
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

  // Remove all existing error messages
  form.querySelectorAll(".form-error").forEach((error) => error.remove());

  // Check each field against rules
  for (const fieldName in rules) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (!field) continue;

    const fieldRules = rules[fieldName];
    let fieldValue = field.value.trim();

    // Required check
    if (fieldRules.required && !fieldValue) {
      addErrorMessage(field, "Ce champ est obligatoire");
      isValid = false;
      continue;
    }

    // Email validation
    if (fieldRules.email && fieldValue && !isValidEmail(fieldValue)) {
      addErrorMessage(field, "Veuillez entrer une adresse email valide");
      isValid = false;
    }

    // Minimum length
    if (fieldRules.minLength && fieldValue.length < fieldRules.minLength) {
      addErrorMessage(
        field,
        `Ce champ doit contenir au moins ${fieldRules.minLength} caractères`
      );
      isValid = false;
    }

    // Maximum length
    if (fieldRules.maxLength && fieldValue.length > fieldRules.maxLength) {
      addErrorMessage(
        field,
        `Ce champ ne peut pas dépasser ${fieldRules.maxLength} caractères`
      );
      isValid = false;
    }

    // Pattern matching
    if (
      fieldRules.pattern &&
      fieldValue &&
      !fieldRules.pattern.test(fieldValue)
    ) {
      addErrorMessage(field, fieldRules.patternMessage || "Format invalide");
      isValid = false;
    }

    // Custom validation
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

  // Length check
  if (password.length >= 8) score++;

  // Contains lowercase
  if (/[a-z]/.test(password)) score++;

  // Contains uppercase
  if (/[A-Z]/.test(password)) score++;

  // Contains numbers
  if (/[0-9]/.test(password)) score++;

  // Contains special characters
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

// --- Sample Product Data (Simulated Backend Response) ---
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
// --- End Sample Product Data ---

// Export utilities and data for use in other scripts
window.articonnect = {
  validateForm,
  checkPasswordStrength,
  getUrlParameter,
  isInViewport,
  animateOnScroll,
  sampleProducts, // Expose sample products globally
  updateHeaderUI, // Expose header update function
  // Removed duplicate updateHeaderUI export
};

/**
 * Update Header UI based on Login Status
 */
function updateHeaderUI() {
  const headerActions = document.querySelector(".header__actions");
  if (!headerActions) return;

  // Determine current path context
  const currentPagePath = window.location.pathname;

  // Define path prefixes based on current location relative to the 'html' directory
  let clientPrefix = "";
  let artisanPrefix = "";
  let authPrefix = "";
  let indexPath = "";
  let imagePrefix = ""; // Prefix for images like logo

  // Check if we are deep inside html/client, html/artisan, or html/auth
  if (
    currentPagePath.includes("/html/client/") ||
    currentPagePath.includes("/html/artisan/") ||
    currentPagePath.includes("/html/auth/")
  ) {
    clientPrefix = "../client/";
    artisanPrefix = "../artisan/";
    authPrefix = "../auth/";
    indexPath = "../../index.html"; // Go up two levels
    imagePrefix = "../../"; // Go up two levels for images from root
  }
  // Check if we are directly inside html/ (like html/index.html)
  else if (currentPagePath.includes("/html/")) {
    clientPrefix = "client/"; // Sibling directory
    artisanPrefix = "artisan/";
    authPrefix = "auth/";
    indexPath = "../index.html"; // Go up one level
    imagePrefix = "../"; // Go up one level for images from root
  }
  // We are at the root (e.g., /index.html or /)
  else {
    clientPrefix = "html/client/"; // Need to go into html/ then client/
    artisanPrefix = "html/artisan/";
    authPrefix = "html/auth/";
    indexPath = "html/index.html"; // Correct path from root
    imagePrefix = ""; // Images are relative to root
  }

  // Construct full paths
  const clientPath = clientPrefix; // Base path for client pages
  const artisanPath = artisanPrefix; // Base path for artisan pages
  const authPath = authPrefix; // Base path for auth pages

  // Update logo path if necessary (assuming logo is always at root/images)
  const logoImg = document.querySelector(".header__logo img");
  if (logoImg) {
    // Ensure the path starts correctly based on the calculated prefix
    // Avoid double slashes if imagePrefix is empty
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
      localStorage.removeItem("articonnect_user"); // Clear corrupted data
    }
  }

  // Clear existing actions (important to remove static links)
  headerActions.innerHTML = "";

  if (user && user.email && user.type) {
    // --- User is logged in ---
    const profileUrl =
      user.type === "artisan"
        ? artisanPath + "profile.html"
        : clientPath + "profile.html";

    // Add Cart Icon (visible to clients)
    if (user.type === "client") {
      const cartLink = document.createElement("a");
      cartLink.href = clientPath + "cart.html"; // Use dynamic path
      cartLink.classList.add("header__cart-icon");
      cartLink.setAttribute("aria-label", "Panier");
      cartLink.innerHTML =
        '<i class="fas fa-shopping-cart"></i><span class="cart-count">0</span>'; // Add cart count span
      headerActions.appendChild(cartLink);
      // TODO: Update cart count dynamically
    }

    // Add Profile/Account Link
    const profileLink = document.createElement("a");
    profileLink.href = profileUrl; // Use dynamic path
    profileLink.classList.add("btn", "btn--outline");
    profileLink.textContent = "Mon Compte";
    headerActions.appendChild(profileLink);

    // Add Logout Button
    const logoutButton = document.createElement("button");
    logoutButton.classList.add("btn", "btn--primary");
    logoutButton.textContent = "Déconnexion";
    // Pass the correctly calculated relative index path to the logout function
    logoutButton.addEventListener("click", () => logout(indexPath));
    headerActions.appendChild(logoutButton);
  } else {
    // --- User is logged out ---
    // Add default Login/Register buttons, checking current page to avoid linking to self

    if (!currentPagePath.includes("/auth/login.html")) {
      // Use currentPagePath
      const loginLink = document.createElement("a");
      // Construct the correct href using the calculated authPath
      loginLink.href = authPath + "login.html";
      loginLink.classList.add("btn", "btn--outline");
      loginLink.textContent = "Connexion";
      headerActions.appendChild(loginLink);
    }

    if (!currentPagePath.includes("/auth/register.html")) {
      // Use currentPagePath
      const registerLink = document.createElement("a");
      // Construct the correct href using the calculated authPath
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
  // Redirect to homepage using the provided path
  window.location.href = indexPath;
}

// Expose updateHeaderUI globally if needed by other scripts, or rely on DOMContentLoaded
window.articonnect = {
  ...window.articonnect, // Preserve existing utilities
  updateHeaderUI, // Add the new function
};
