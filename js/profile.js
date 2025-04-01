/**
 * ArtiConnect - Client Profile Page JavaScript
 * Handles functionality for the client profile page
 */

document.addEventListener("DOMContentLoaded", function () {
  // Check login status and load user data
  loadProfileData();

  // Initialize edit/view mode toggles
  initEditToggles();

  // Initialize form submissions
  initProfileForms();
});

/**
 * Check login status and populate profile data from localStorage.
 */
function loadProfileData() {
  const userString = localStorage.getItem("articonnect_user");
  if (!userString) {
    // Not logged in, redirect to login
    window.location.href = "../auth/login.html"; // Adjust path as needed
    return;
  }

  let user = null;
  try {
    user = JSON.parse(userString);
  } catch (e) {
    console.error("Error parsing user data", e);
    localStorage.removeItem("articonnect_user");
    window.location.href = "../auth/login.html";
    return;
  }

  // Ensure it's a client profile
  if (user.type !== "client") {
    console.warn(
      "Attempting to access client profile with non-client user type:",
      user.type
    );
    // Redirect to appropriate dashboard or homepage
    window.location.href = "../index.html";
    return;
  }

  // Populate Sidebar User Info
  const sidebarUserName = document.querySelector(
    ".dashboard-sidebar .user-name"
  );
  const sidebarUserEmail = document.querySelector(
    ".dashboard-sidebar .user-email"
  );
  // const sidebarUserAvatar = document.querySelector('.dashboard-sidebar .user-avatar'); // TODO: Update avatar src if stored

  if (sidebarUserName) sidebarUserName.textContent = user.name || "Utilisateur";
  if (sidebarUserEmail) sidebarUserEmail.textContent = user.email;

  // Populate Personal Info View Mode
  const infoView = document.querySelector(".profile-info.view-mode");
  if (infoView) {
    // Assuming user.name is "FirstName LastName"
    const nameParts = user.name ? user.name.split(" ") : ["", ""];
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    infoView.querySelector(".info-group:nth-child(1) .info-value").textContent =
      firstName || "-";
    infoView.querySelector(".info-group:nth-child(2) .info-value").textContent =
      lastName || "-";
    infoView.querySelector(".info-group:nth-child(3) .info-value").textContent =
      user.email || "-";
    // Add placeholders for phone/birthdate as they are not in our basic user object yet
    infoView.querySelector(".info-group:nth-child(4) .info-value").textContent =
      user.phone || "-";
    infoView.querySelector(".info-group:nth-child(5) .info-value").textContent =
      user.birthdate ? formatDate(new Date(user.birthdate)) : "-"; // Assuming formatDate exists or we add it
  }

  // Populate Personal Info Edit Mode Form
  const infoForm = document.getElementById("personal-info-form");
  if (infoForm) {
    const nameParts = user.name ? user.name.split(" ") : ["", ""];
    infoForm.querySelector("#first-name").value = nameParts[0] || "";
    infoForm.querySelector("#last-name").value =
      nameParts.slice(1).join(" ") || "";
    infoForm.querySelector("#email").value = user.email || "";
    infoForm.querySelector("#phone").value = user.phone || "";
    infoForm.querySelector("#birthdate").value = user.birthdate || ""; // Assumes YYYY-MM-DD format if stored
  }

  // TODO: Populate Photo Section (if avatar URL is stored)
  // TODO: Populate Preferences View/Edit Modes (if preferences are stored)
}

/**
 * Initialize toggle functionality between view and edit modes for profile sections.
 */
function initEditToggles() {
  const profileSections = document.querySelectorAll(".profile-section");

  profileSections.forEach((section) => {
    const editBtn = section.querySelector(".edit-section-btn");
    const cancelBtn = section.querySelector(".cancel-edit-btn");
    const viewMode = section.querySelector(".view-mode");
    const editMode = section.querySelector(".edit-mode");

    if (editBtn && cancelBtn && viewMode && editMode) {
      editBtn.addEventListener("click", () => {
        viewMode.classList.add("hidden");
        editMode.classList.remove("hidden");
        editBtn.style.display = "none"; // Hide edit button when editing
      });

      cancelBtn.addEventListener("click", () => {
        editMode.classList.add("hidden");
        viewMode.classList.remove("hidden");
        editBtn.style.display = ""; // Show edit button again
        // Optional: Reset form fields to original values if needed
      });
    }
  });
}

/**
 * Initialize form submission handlers for profile updates.
 */
function initProfileForms() {
  const personalInfoForm = document.getElementById("personal-info-form");
  const photoForm = document.getElementById("photo-form");
  const preferencesForm = document.getElementById("preferences-form"); // Assuming an ID for this form

  // --- Personal Info Form ---
  if (personalInfoForm) {
    personalInfoForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const saveBtn = this.querySelector(".save-btn");
      saveBtn.disabled = true;
      saveBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';

      // Simulate saving data
      setTimeout(() => {
        try {
          const userString = localStorage.getItem("articonnect_user");
          if (!userString) throw new Error("User not found");
          let user = JSON.parse(userString);

          // Get updated values
          const firstName = this.querySelector("#first-name").value.trim();
          const lastName = this.querySelector("#last-name").value.trim();
          user.name = `${firstName} ${lastName}`.trim(); // Reconstruct name
          user.email = this.querySelector("#email").value.trim();
          user.phone = this.querySelector("#phone").value.trim();
          user.birthdate = this.querySelector("#birthdate").value; // Assumes YYYY-MM-DD

          // Save updated user object back to localStorage
          localStorage.setItem("articonnect_user", JSON.stringify(user));

          // Update view mode display
          loadProfileData(); // Reload data to update view mode

          // Switch back to view mode
          const section = this.closest(".profile-section");
          section.querySelector(".edit-mode").classList.add("hidden");
          section.querySelector(".view-mode").classList.remove("hidden");
          section.querySelector(".edit-section-btn").style.display = "";

          alert("Informations personnelles mises à jour.");
        } catch (error) {
          console.error("Error updating personal info:", error);
          alert("Erreur lors de la mise à jour des informations.");
        } finally {
          // Restore button
          saveBtn.disabled = false;
          saveBtn.innerHTML = "Enregistrer";
        }
      }, 1000); // Simulate network delay
    });
  }

  // --- Photo Form ---
  if (photoForm) {
    photoForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // Simulate photo upload - just show alert and switch back
      alert("Simulation: Photo de profil mise à jour (non implémenté).");
      const section = this.closest(".profile-section");
      section.querySelector(".edit-mode").classList.add("hidden");
      section.querySelector(".view-mode").classList.remove("hidden");
      section.querySelector(".edit-section-btn").style.display = "";
    });
    // TODO: Add file input change handler to show preview
  }

  // --- Preferences Form ---
  if (preferencesForm) {
    preferencesForm.addEventListener("submit", function (e) {
      // Assuming a save button exists and triggers submit
      e.preventDefault();
      // Simulate saving preferences - just show alert and switch back
      alert("Simulation: Préférences mises à jour (non implémenté).");
      const section = this.closest(".profile-section");
      section.querySelector(".edit-mode").classList.add("hidden");
      section.querySelector(".view-mode").classList.remove("hidden");
      section.querySelector(".edit-section-btn").style.display = "";
    });
  }
}

// Helper function (consider moving to main.js if used elsewhere)
function formatDate(date) {
  if (!date || !(date instanceof Date)) return "-";
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
