/**
 * ArtiConnect - Artisan Profile Page JavaScript
 * Handles functionality for the artisan profile page
 */

document.addEventListener("DOMContentLoaded", function () {
  // Check login status and user type before initializing
  if (!isArtisanLoggedIn()) {
    // Redirect if not logged in or not an artisan
    // Calculate the correct path to index.html from html/artisan/
    // const indexPath = "../../index.html"; // Commented out redirect
    // window.location.href = indexPath; // Commented out redirect
    return; // Stop further execution
  }

  // Initialize edit/view mode toggles
  initArtisanEditToggles();

  // Initialize form submissions
  initArtisanProfileForms();

  // Initialize photo upload interactions (optional, for preview/removal)
  initPhotoUpload();
});

/**
 * Checks if an artisan user is logged in based on localStorage.
 * @returns {boolean} True if an artisan is logged in, false otherwise.
 */
function isArtisanLoggedIn() {
  const userString = localStorage.getItem("articonnect_user");
  if (!userString) {
    console.log("No user data found in localStorage.");
    return false;
  }

  try {
    const user = JSON.parse(userString);
    if (user && user.type === "artisan") {
      return true;
    } else {
      console.warn(
        "User found, but is not an artisan. User type:",
        user ? user.type : "unknown"
      );
      return false;
    }
  } catch (e) {
    console.error("Error parsing user data from localStorage", e);
    localStorage.removeItem("articonnect_user"); // Clear corrupted data
    return false;
  }
}

/**
 * Initialize toggle functionality between view and edit modes for profile sections.
 */
function initArtisanEditToggles() {
  const profileSections = document.querySelectorAll(".profile-section");

  profileSections.forEach((section) => {
    const editBtn = section.querySelector(".edit-section-btn");
    const cancelBtn = section.querySelector(".cancel-edit-btn");
    const viewMode = section.querySelector(".view-mode");
    const editMode = section.querySelector(".edit-mode");

    if (editBtn && cancelBtn && viewMode && editMode) {
      editBtn.addEventListener("click", () => {
        // Store original values before showing edit form (optional, for cancel)
        // You might want to store these in data attributes or a temporary object

        viewMode.classList.add("hidden");
        editMode.classList.remove("hidden");
        editBtn.style.display = "none"; // Hide edit button when editing
      });

      cancelBtn.addEventListener("click", () => {
        editMode.classList.add("hidden");
        viewMode.classList.remove("hidden");
        editBtn.style.display = ""; // Show edit button again

        // Optional: Reset form fields to original values if they were stored
        // e.g., resetFormFields(section);
      });
    }
  });
}

/**
 * Initialize form submission handlers for profile updates.
 */
function initArtisanProfileForms() {
  const basicInfoForm = document.getElementById("basic-info-form");

  // --- Basic Info Form ---
  if (basicInfoForm) {
    basicInfoForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const saveBtn = this.querySelector(".save-btn");
      const originalText = saveBtn.textContent;
      saveBtn.disabled = true;
      saveBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';

      // Simulate saving data (replace with actual API call later)
      console.log("Simulating saving basic info...");
      setTimeout(() => {
        try {
          // --- Simulate data update ---
          // In a real app, you'd send data to the backend here.
          // For now, we'll just update the view mode display based on form values.

          const section = this.closest(".profile-section");
          const viewMode = section.querySelector(".view-mode");

          // Get updated values from the form
          const firstName = this.querySelector("#first-name").value.trim();
          const lastName = this.querySelector("#last-name").value.trim();
          const businessName =
            this.querySelector("#business-name").value.trim();
          const email = this.querySelector("#email").value.trim();
          const phone = this.querySelector("#phone").value.trim();
          const categorySelect = this.querySelector("#main-category");
          const category =
            categorySelect.options[categorySelect.selectedIndex].text;
          const sinceSelect = this.querySelector("#artisan-since");
          const since = sinceSelect.options[sinceSelect.selectedIndex].text;

          // Update the view mode elements
          if (viewMode) {
            viewMode.querySelector(
              ".info-group:nth-child(1) .info-value"
            ).textContent = `${firstName} ${lastName}`;
            viewMode.querySelector(
              ".info-group:nth-child(2) .info-value"
            ).textContent = businessName;
            viewMode.querySelector(
              ".info-group:nth-child(3) .info-value"
            ).textContent = email;
            viewMode.querySelector(
              ".info-group:nth-child(4) .info-value"
            ).textContent = phone;
            viewMode.querySelector(
              ".info-group:nth-child(5) .info-value"
            ).textContent = category;
            viewMode.querySelector(
              ".info-group:nth-child(6) .info-value"
            ).textContent = since;
          }

          // --- End Simulate data update ---

          // Switch back to view mode
          section.querySelector(".edit-mode").classList.add("hidden");
          viewMode.classList.remove("hidden");
          section.querySelector(".edit-section-btn").style.display = "";

          alert("Informations de base mises à jour (simulation).");
        } catch (error) {
          console.error("Error updating basic info (simulation):", error);
          alert("Erreur lors de la mise à jour des informations.");
        } finally {
          // Restore button
          saveBtn.disabled = false;
          saveBtn.innerHTML = originalText;
        }
      }, 1000); // Simulate network delay
    });
  }

  // Add handlers for other forms (Description, Address, Password) if/when they are added
}

/**
 * Initialize photo upload interactions (preview, remove).
 */
function initPhotoUpload() {
  const photoInput = document.getElementById("profile-photo-upload");
  const currentPhotoImg = document.querySelector(
    ".current-photo .large-avatar"
  );
  const removePhotoBtn = document.querySelector(".remove-photo-btn");

  if (photoInput && currentPhotoImg) {
    photoInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (e) {
          // Display preview
          currentPhotoImg.src = e.target.result;
          // Optionally enable remove button if a new file is selected
          if (removePhotoBtn) removePhotoBtn.disabled = false;
        };
        reader.readAsDataURL(file);
        console.log("Simulating photo preview update.");
        // In a real app, you might upload immediately or stage for saving with the form.
      }
    });
  }

  if (removePhotoBtn && currentPhotoImg) {
    removePhotoBtn.addEventListener("click", function () {
      // Simulate removing photo - replace with default/placeholder
      const defaultAvatar = "../../images/default-avatar.png"; // Define a default avatar path
      currentPhotoImg.src = defaultAvatar;
      photoInput.value = ""; // Clear the file input
      this.disabled = true; // Disable remove button after removing
      console.log("Simulating photo removal.");
      // In a real app, send request to backend to remove photo.
    });
    // Initially disable remove button if there's no custom photo?
    // removePhotoBtn.disabled = currentPhotoImg.src.includes('default-avatar');
  }
}
