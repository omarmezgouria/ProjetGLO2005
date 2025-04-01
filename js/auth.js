/**
 * ArtiConnect - Authentication Pages JavaScript
 * Handles functionality for login and registration pages
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize password visibility toggle
  initPasswordToggle();

  // Initialize password strength meter
  initPasswordStrength();

  // Initialize user type selector
  initUserTypeSelector();

  // Initialize form validation
  initFormValidation();
});

/**
 * Toggle password visibility
 */
function initPasswordToggle() {
  const toggleButtons = document.querySelectorAll(".password-toggle");

  if (!toggleButtons.length) return;

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const passwordField = this.previousElementSibling;
      const icon = this.querySelector("i");

      if (passwordField.type === "password") {
        passwordField.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        passwordField.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  });
}

/**
 * Password strength meter
 */
function initPasswordStrength() {
  const passwordField = document.getElementById("password");
  const strengthMeter = document.querySelector(".strength-meter-fill");
  const strengthText = document.querySelector(".strength-text");

  if (!passwordField || !strengthMeter || !strengthText) return;

  passwordField.addEventListener("input", function () {
    const value = this.value;
    const strength = window.articonnect.checkPasswordStrength(value);

    // Update meter
    strengthMeter.setAttribute("data-strength", strength);

    // Update text
    const strengthLabels = [
      "Très faible",
      "Faible",
      "Moyen",
      "Fort",
      "Très fort",
    ];

    strengthText.textContent = `Force du mot de passe: ${strengthLabels[strength]}`;
  });
}

/**
 * User type selector
 */
function initUserTypeSelector() {
  const selectorOptions = document.querySelectorAll(".selector-option");
  const artisanFields = document.querySelector(".artisan-fields");

  if (!selectorOptions.length) return;

  // Check for previously selected user type in localStorage
  const storedUserType = localStorage.getItem("articonnect_user_type");

  // Check for user type in URL parameter
  const urlUserType = window.articonnect.getUrlParameter("type");

  // Use URL parameter if present, otherwise use stored type
  const initialUserType = urlUserType || storedUserType;

  selectorOptions.forEach((option) => {
    // Set initial selection based on stored/URL value
    if (initialUserType && option.dataset.type === initialUserType) {
      selectUserType(option);
    }

    option.addEventListener("click", function () {
      selectUserType(this);
    });
  });

  function selectUserType(selectedOption) {
    // Remove selected class from all options
    selectorOptions.forEach((opt) => opt.classList.remove("selected"));

    // Add selected class to clicked option
    selectedOption.classList.add("selected");

    // Store selection in localStorage
    localStorage.setItem("articonnect_user_type", selectedOption.dataset.type);

    // Show/hide artisan fields
    if (artisanFields) {
      if (selectedOption.dataset.type === "artisan") {
        artisanFields.style.display = "block";

        // Make artisan fields required
        const artisanInputs = artisanFields.querySelectorAll("input, select");
        artisanInputs.forEach((input) => (input.required = true));
      } else {
        artisanFields.style.display = "none";

        // Remove required attribute from artisan fields
        const artisanInputs = artisanFields.querySelectorAll("input, select");
        artisanInputs.forEach((input) => (input.required = false));
      }
    }
  }

  // If no option is already selected, select the first one by default
  if (!storedUserType && !urlUserType && selectorOptions.length) {
    selectUserType(selectorOptions[0]);
  }
}

/**
 * Form validation
 */
function initFormValidation() {
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get selected user type
      const selectedType =
        document.querySelector(".selector-option.selected")?.dataset.type ||
        "client";

      // Define validation rules
      const rules = {
        firstName: {
          required: true,
          minLength: 2,
          maxLength: 50,
        },
        lastName: {
          required: true,
          minLength: 2,
          maxLength: 50,
        },
        email: {
          required: true,
          email: true,
        },
        password: {
          required: true,
          minLength: 8,
          custom: function (value) {
            const strength = window.articonnect.checkPasswordStrength(value);
            return (
              strength >= 2 ||
              "Le mot de passe est trop faible. Utilisez une combinaison de lettres, chiffres et caractères spéciaux."
            );
          },
        },
        confirmPassword: {
          required: true,
          custom: function (value, form) {
            return (
              value === form.querySelector("#password").value ||
              "Les mots de passe ne correspondent pas."
            );
          },
        },
        terms: {
          required: true,
        },
      };

      // Add artisan-specific rules if artisan type is selected
      if (selectedType === "artisan") {
        rules.businessName = {
          required: true,
          minLength: 2,
          maxLength: 100,
        };
        rules.craftCategory = {
          required: true,
        };
        rules.artisanDescription = {
          required: true,
          minLength: 20,
          maxLength: 500,
        };
        rules.shippingRegions = {
          required: true,
        };
      }

      // Validate form
      if (window.articonnect.validateForm(registerForm, rules)) {
        // Simulate form submission
        simulateFormSubmission("register", selectedType);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const rules = {
        email: {
          required: true,
          email: true,
        },
        password: {
          required: true,
        },
      };

      if (window.articonnect.validateForm(loginForm, rules)) {
        // Simulate form submission
        simulateFormSubmission("login");
      }
    });
  }
}

/**
 * Simulate form submission (Frontend Only)
 * @param {string} formType - Type of form ('login' or 'register')
 * @param {string} [registerUserType] - Type of user for registration ('client' or 'artisan')
 */
function simulateFormSubmission(formType, registerUserType) {
  const form = document.getElementById(`${formType}-form`);
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Chargement...';

  // Simulate API call delay
  setTimeout(() => {
    let success = false;
    let redirectUrl = "";
    let loggedInUser = null;

    if (formType === "login") {
      const email = form.querySelector("#email").value;
      const password = form.querySelector("#password").value;

      // --- Simulated User Check ---
      if (email === "client@test.com" && password === "password") {
        success = true;
        loggedInUser = { email: email, type: "client", name: "Client Test" };
        redirectUrl = "../client/products.html"; // Redirect clients to products page
      } else if (email === "artisan@test.com" && password === "password") {
        success = true;
        loggedInUser = { email: email, type: "artisan", name: "Artisan Test" };
        redirectUrl = "../artisan/dashboard.html";
      }
      // --- End Simulated User Check ---

      if (success) {
        console.log(
          `Login successful for ${loggedInUser.type}: ${loggedInUser.email}`
        );
        // Store user info in localStorage to simulate session
        localStorage.setItem("articonnect_user", JSON.stringify(loggedInUser));
        window.location.href = redirectUrl;
      } else {
        console.log("Login failed: Invalid credentials");
        alert("Email ou mot de passe incorrect.");
        // Restore button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      }
    } else if (formType === "register") {
      // Registration simulation remains largely the same
      success = true; // Assume registration always succeeds in simulation
      console.log(`Registration submitted for ${registerUserType}`);

      const formContainer = document.querySelector(".auth-content");
      if (formContainer) {
        formContainer.innerHTML = `
          <div class="register-success">
              <div class="success-icon">
                  <i class="fas fa-check-circle"></i>
              </div>
              <h2>Inscription réussie!</h2>
              <p>Votre compte a été créé avec succès. Vous allez être redirigé vers la page de connexion.</p>
          </div>
        `;
      }

      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = "login.html";
      }, 3000);
    }

    // Note: No need to restore button state on success because the page redirects.
  }, 1500); // Reduced delay slightly
}

// Add CSS for the success message
document.addEventListener("DOMContentLoaded", function () {
  const style = document.createElement("style");
  style.textContent = `
        .register-success {
            text-align: center;
            padding: var(--spacing-6) 0;
        }
        
        .success-icon {
            font-size: 4rem;
            color: var(--color-success);
            margin-bottom: var(--spacing-4);
        }
        
        .register-success h2 {
            font-size: var(--font-size-2xl);
            margin-bottom: var(--spacing-3);
            color: var(--color-grey-900);
        }
        
        .register-success p {
            color: var(--color-grey-700);
        }
    `;
  document.head.appendChild(style);
});
