/**
 * ArtiConnect - Client Profile Page JavaScript
 * Handles functionality for the client profile page
 */

document.addEventListener("DOMContentLoaded", function () {
  // Vérifier le statut de connexion et charger les données utilisateur
  loadProfileData();

  // Initialiser les bascules de mode édition/vue
  initEditToggles();

  // Initialiser les soumissions de formulaire
  initProfileForms();
});

/**
 * Check login status and populate profile data from localStorage.
 */
function loadProfileData() {
  const userString = localStorage.getItem("articonnect_user");
  if (!userString) {
    // Non connecté, rediriger vers la connexion
    window.location.href = "../auth/login.html"; // Ajuster le chemin si nécessaire
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

  // S'assurer qu'il s'agit d'un profil client
  if (user.type !== "client") {
    console.warn(
      "Attempting to access client profile with non-client user type:",
      user.type
    );
    // Rediriger vers le tableau de bord ou la page d'accueil approprié
    window.location.href = "../index.html";
    return;
  }

  // Remplir les informations utilisateur de la barre latérale
  const sidebarUserName = document.querySelector(
    ".dashboard-sidebar .user-name"
  );
  const sidebarUserEmail = document.querySelector(
    ".dashboard-sidebar .user-email"
  );
  // const sidebarUserAvatar = document.querySelector('.dashboard-sidebar .user-avatar'); // TODO : Mettre à jour la source de l'avatar si stockée

  if (sidebarUserName) sidebarUserName.textContent = user.name || "Utilisateur";
  if (sidebarUserEmail) sidebarUserEmail.textContent = user.email;

  // Remplir le mode vue des informations personnelles
  const infoView = document.querySelector(".profile-info.view-mode");
  if (infoView) {
    // En supposant que user.name est "Prénom Nom"
    const nameParts = user.name ? user.name.split(" ") : ["", ""];
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    infoView.querySelector(".info-group:nth-child(1) .info-value").textContent =
      firstName || "-";
    infoView.querySelector(".info-group:nth-child(2) .info-value").textContent =
      lastName || "-";
    infoView.querySelector(".info-group:nth-child(3) .info-value").textContent =
      user.email || "-";
    // Ajouter des espaces réservés pour le téléphone/date de naissance car ils ne sont pas encore dans notre objet utilisateur de base
    infoView.querySelector(".info-group:nth-child(4) .info-value").textContent =
      user.phone || "-";
    infoView.querySelector(".info-group:nth-child(5) .info-value").textContent =
      user.birthdate ? formatDate(new Date(user.birthdate)) : "-"; // En supposant que formatDate existe ou que nous l'ajoutons
  }

  // Remplir le formulaire du mode édition des informations personnelles
  const infoForm = document.getElementById("personal-info-form");
  if (infoForm) {
    const nameParts = user.name ? user.name.split(" ") : ["", ""];
    infoForm.querySelector("#first-name").value = nameParts[0] || "";
    infoForm.querySelector("#last-name").value =
      nameParts.slice(1).join(" ") || "";
    infoForm.querySelector("#email").value = user.email || "";
    infoForm.querySelector("#phone").value = user.phone || "";
    infoForm.querySelector("#birthdate").value = user.birthdate || ""; // Suppose le format AAAA-MM-JJ si stocké
  }

  // TODO : Remplir la section Photo (si l'URL de l'avatar est stockée)
  // TODO : Remplir les modes Vue/Édition des préférences (si les préférences sont stockées)
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
        editBtn.style.display = "none"; // Masquer le bouton d'édition lors de l'édition
      });

      cancelBtn.addEventListener("click", () => {
        editMode.classList.add("hidden");
        viewMode.classList.remove("hidden");
        editBtn.style.display = ""; // Afficher à nouveau le bouton d'édition
        // Optionnel : Réinitialiser les champs du formulaire aux valeurs d'origine si nécessaire
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
  const preferencesForm = document.getElementById("preferences-form"); // En supposant un ID pour ce formulaire

  // --- Formulaire d'informations personnelles ---
  if (personalInfoForm) {
    personalInfoForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const saveBtn = this.querySelector(".save-btn");
      saveBtn.disabled = true;
      saveBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';

      // Simuler l'enregistrement des données
      setTimeout(() => {
        try {
          const userString = localStorage.getItem("articonnect_user");
          if (!userString) throw new Error("User not found");
          let user = JSON.parse(userString);

          // Obtenir les valeurs mises à jour
          const firstName = this.querySelector("#first-name").value.trim();
          const lastName = this.querySelector("#last-name").value.trim();
          user.name = `${firstName} ${lastName}`.trim(); // Reconstruire le nom
          user.email = this.querySelector("#email").value.trim();
          user.phone = this.querySelector("#phone").value.trim();
          user.birthdate = this.querySelector("#birthdate").value; // Suppose AAAA-MM-JJ

          // Enregistrer l'objet utilisateur mis à jour dans localStorage
          localStorage.setItem("articonnect_user", JSON.stringify(user));

          // Mettre à jour l'affichage du mode vue
          loadProfileData(); // Recharger les données pour mettre à jour le mode vue

          // Revenir au mode vue
          const section = this.closest(".profile-section");
          section.querySelector(".edit-mode").classList.add("hidden");
          section.querySelector(".view-mode").classList.remove("hidden");
          section.querySelector(".edit-section-btn").style.display = "";

          alert("Informations personnelles mises à jour.");
        } catch (error) {
          console.error("Error updating personal info:", error);
          alert("Erreur lors de la mise à jour des informations.");
        } finally {
          // Restaurer le bouton
          saveBtn.disabled = false;
          saveBtn.innerHTML = "Enregistrer";
        }
      }, 1000); // Simuler le délai réseau
    });
  }

  // --- Formulaire Photo ---
  if (photoForm) {
    photoForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // Simuler le téléversement de photo - afficher simplement une alerte et revenir en arrière
      alert("Simulation: Photo de profil mise à jour (non implémenté).");
      const section = this.closest(".profile-section");
      section.querySelector(".edit-mode").classList.add("hidden");
      section.querySelector(".view-mode").classList.remove("hidden");
      section.querySelector(".edit-section-btn").style.display = "";
    });
    // TODO : Ajouter un gestionnaire de changement d'entrée de fichier pour afficher l'aperçu
  }

  // --- Formulaire Préférences ---
  if (preferencesForm) {
    preferencesForm.addEventListener("submit", function (e) {
      // En supposant qu'un bouton d'enregistrement existe et déclenche la soumission
      e.preventDefault();
      // Simuler l'enregistrement des préférences - afficher simplement une alerte et revenir en arrière
      alert("Simulation: Préférences mises à jour (non implémenté).");
      const section = this.closest(".profile-section");
      section.querySelector(".edit-mode").classList.add("hidden");
      section.querySelector(".view-mode").classList.remove("hidden");
      section.querySelector(".edit-section-btn").style.display = "";
    });
  }
}

// Fonction utilitaire (envisager de déplacer vers main.js si utilisée ailleurs)
function formatDate(date) {
  if (!date || !(date instanceof Date)) return "-";
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
