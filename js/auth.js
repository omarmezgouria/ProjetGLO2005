/**
 * ArtiConnect - Authentication Pages JavaScript
 * Handles functionality for login and registration pages
 */

// Define the base URL for the API
const API_BASE_URL = "http://127.0.0.1:5000/api"; // Adjust if your backend runs elsewhere

document.addEventListener("DOMContentLoaded", function () {
  // Initialize password visibility toggle
  initPasswordToggle();

  // Initialize password strength meter
  initPasswordStrength();

  // Initialize user type selector
  initUserTypeSelector();

  // Initialize form validation and API submission
  initFormSubmission(); // Renamed from initFormValidation

  // Add CSS for the success message (kept from original)
  addSuccessMessageCSS();
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

  // Assume window.articonnect.checkPasswordStrength exists
  if (
    !passwordField ||
    !strengthMeter ||
    !strengthText ||
    !window.articonnect?.checkPasswordStrength
  )
    return;

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

  // Assume window.articonnect.getUrlParameter exists
  const getUrlParameter =
    window.articonnect?.getUrlParameter ||
    function () {
      return null;
    };

  // Check for previously selected user type in localStorage
  const storedUserType = localStorage.getItem("articonnect_user_type");

  // Check for user type in URL parameter
  const urlUserType = getUrlParameter("type");

  // Use URL parameter if present, otherwise use stored type
  const initialUserType = urlUserType || storedUserType;

  selectorOptions.forEach((option) => {
    // Set initial selection based on stored/URL value
    if (initialUserType && option.dataset.type === initialUserType) {
      selectUserType(option, selectorOptions, artisanFields); // Pass elements
    }

    option.addEventListener("click", function () {
      selectUserType(this, selectorOptions, artisanFields); // Pass elements
    });
  });

  // If no option is already selected, select the first one by default
  if (!storedUserType && !urlUserType && selectorOptions.length) {
    selectUserType(selectorOptions[0], selectorOptions, artisanFields); // Pass elements
  }
}

function selectUserType(selectedOption, allOptions, artisanFieldsElement) {
  // Remove selected class from all options
  allOptions.forEach((opt) => opt.classList.remove("selected"));

  // Add selected class to clicked option
  selectedOption.classList.add("selected");

  // Store selection in localStorage
  localStorage.setItem("articonnect_user_type", selectedOption.dataset.type);

  // Show/hide artisan fields
  if (artisanFieldsElement) {
    const isArtisan = selectedOption.dataset.type === "artisan";
    artisanFieldsElement.style.display = isArtisan ? "block" : "none";

    // Make artisan fields required/not required
    const artisanInputs = artisanFieldsElement.querySelectorAll(
      "input, select, textarea"
    ); // Added textarea
    artisanInputs.forEach((input) => (input.required = isArtisan));
  }
}

/**
 * Initialize form validation and API submission logic
 */
function initFormSubmission() {
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");

  // Assume window.articonnect.validateForm exists
  const validateForm =
    window.articonnect?.validateForm ||
    function () {
      return true;
    }; // Placeholder if not found

  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      // Added async
      e.preventDefault();
      clearApiError(registerForm); // Clear previous errors

      // Get selected user type
      const selectedType =
        document.querySelector(".selector-option.selected")?.dataset.type ||
        "client";

      // Define validation rules (assuming validateForm handles this structure)
      const rules = {
        /* ... validation rules from original code ... */
      };
      // --- Re-add validation rules ---
      rules.firstName = { required: true, minLength: 2, maxLength: 50 };
      rules.lastName = { required: true, minLength: 2, maxLength: 50 };
      rules.email = { required: true, email: true };
      rules.password = {
        required: true,
        minLength: 8,
        custom: function (value) {
          if (!window.articonnect?.checkPasswordStrength) return true; // Skip if helper missing
          const strength = window.articonnect.checkPasswordStrength(value);
          return strength >= 2 || "Le mot de passe est trop faible.";
        },
      };
      rules.confirmPassword = {
        required: true,
        custom: function (value, form) {
          return (
            value === form.querySelector("#password").value ||
            "Les mots de passe ne correspondent pas."
          );
        },
      };
      rules.terms = { required: true };

      if (selectedType === "artisan") {
        rules.businessName = { required: true, minLength: 2, maxLength: 100 };
        rules.craftCategory = { required: true };
        rules.artisanDescription = {
          required: true,
          minLength: 20,
          maxLength: 500,
        };
        rules.shippingRegions = { required: true };
      }
      // --- End re-added validation rules ---

      // Validate form using the external helper
      if (validateForm(registerForm, rules)) {
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        // Prepare payload for API
        const payload = {
          nom: data.lastName,
          prenom: data.firstName,
          email: data.email,
          password: data.password,
          role: selectedType,
          // Add artisan-specific fields if needed by backend (currently not in API)
          // businessName: data.businessName,
          // etc.
        };

        const submitButton = registerForm.querySelector(
          'button[type="submit"]'
        );
        setLoadingState(submitButton, true);

        try {
          const response = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          const result = await response.json();

          if (response.ok) {
            // Status 200-299
            showRegistrationSuccess();
            // Redirect after delay
            setTimeout(() => {
              window.location.href = "login.html";
            }, 3000);
          } else {
            // Display error message from backend
            displayApiError(
              registerForm,
              result.error || `Erreur ${response.status}`
            );
            setLoadingState(submitButton, false); // Restore button only on error
          }
        } catch (error) {
          console.error("Registration fetch error:", error);
          displayApiError(
            registerForm,
            "Une erreur réseau est survenue. Veuillez réessayer."
          );
          setLoadingState(submitButton, false); // Restore button on fetch error
        }
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      // Added async
      e.preventDefault();
      clearApiError(loginForm); // Clear previous errors

      const rules = {
        email: { required: true, email: true },
        password: { required: true },
      };

      // Validate form using the external helper
      if (validateForm(loginForm, rules)) {
        const formData = new FormData(loginForm);
        const payload = Object.fromEntries(formData.entries()); // Contains email, password

        const submitButton = loginForm.querySelector('button[type="submit"]');
        setLoadingState(submitButton, true);

        try {
          const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            credentials: "include", // IMPORTANT: Send cookies for session management
          });

          const result = await response.json();

          if (response.ok) {
            console.log("Login successful:", result.user);
            // Store user info (optional, session cookie handles auth)
            localStorage.setItem(
              "articonnect_user",
              JSON.stringify({ ...result.user, type: result.user.role }) // Add type field from role
            );

            // Redirect based on role (updateHeaderUI will run on the *next* page load)
            if (result.user.role === "artisan") {
              window.location.href = "../artisan/dashboard.html"; // Adjust path if needed
            } else {
              window.location.href = "../client/products.html"; // Adjust path if needed
            }
            // No need to restore button state on success redirect
          } else {
            displayApiError(
              loginForm,
              result.error || `Erreur ${response.status}`
            );
            setLoadingState(submitButton, false); // Restore button only on error
          }
        } catch (error) {
          console.error("Login fetch error:", error);
          displayApiError(
            loginForm,
            "Une erreur réseau est survenue. Veuillez réessayer."
          );
          setLoadingState(submitButton, false); // Restore button on fetch error
        }
      }
    });
  }
}

/**
 * Sets the loading state of a submit button
 * @param {HTMLButtonElement} button - The button element
 * @param {boolean} isLoading - True to set loading state, false to restore
 */
function setLoadingState(button, isLoading) {
  if (!button) return;
  if (isLoading) {
    button.disabled = true;
    // Store original text if not already stored
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.innerHTML;
    }
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
  } else {
    button.disabled = false;
    // Restore original text
    button.innerHTML = button.dataset.originalText || "Submit"; // Fallback text
  }
}

/**
 * Displays an API error message near the form's submit button
 * @param {HTMLFormElement} form - The form element
 * @param {string} message - The error message to display
 */
function displayApiError(form, message) {
  clearApiError(form); // Remove existing error first
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    const errorElement = document.createElement("div");
    errorElement.className = "api-error-message";
    errorElement.style.color = "var(--color-danger)"; // Use CSS variable if available
    errorElement.style.marginTop = "10px";
    errorElement.textContent = message;
    // Insert after the submit button's container or the button itself
    const buttonContainer =
      submitButton.closest(".form-group") || submitButton.parentElement;
    buttonContainer.appendChild(errorElement);
  }
}

/**
 * Clears any previously displayed API error message for the form
 * @param {HTMLFormElement} form - The form element
 */
function clearApiError(form) {
  const errorElement = form.querySelector(".api-error-message");
  if (errorElement) {
    errorElement.remove();
  }
}

/**
 * Shows the registration success message by replacing form content
 */
function showRegistrationSuccess() {
  const formContainer = document.querySelector(".auth-content"); // Target the container holding the form
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
}

/**
 * Adds CSS for the success message dynamically
 */
function addSuccessMessageCSS() {
  const style = document.createElement("style");
  style.textContent = `
        .register-success {
            text-align: center;
            padding: var(--spacing-6, 40px) 0; /* Added fallback */
        }
        .success-icon {
            font-size: 4rem;
            color: var(--color-success, #28a745); /* Added fallback */
            margin-bottom: var(--spacing-4, 20px); /* Added fallback */
        }
        .register-success h2 {
            font-size: var(--font-size-2xl, 1.8rem); /* Added fallback */
            margin-bottom: var(--spacing-3, 15px); /* Added fallback */
            color: var(--color-grey-900, #333); /* Added fallback */
        }
        .register-success p {
            color: var(--color-grey-700, #555); /* Added fallback */
        }
        .api-error-message {
             /* Styles added in displayApiError function */
             font-size: 0.9em;
             text-align: center; /* Center error below button */
        }
    `;
  document.head.appendChild(style);
}

// NOTE: This script assumes the existence of helper functions in a global `window.articonnect` object:
// - window.articonnect.checkPasswordStrength(value) -> returns strength level (0-4)
// - window.articonnect.getUrlParameter(name) -> returns URL parameter value
// - window.articonnect.validateForm(formElement, rules) -> returns true if valid, false otherwise (and likely displays field errors)
// Ensure these helpers are loaded, typically in js/main.js or similar.
