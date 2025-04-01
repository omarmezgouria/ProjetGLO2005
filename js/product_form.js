/**
 * ArtiConnect - Product Form JavaScript
 * Handles functionality for adding and editing products
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialiser les onglets du formulaire
  initFormTabs();

  // Initialiser l'éditeur de texte riche
  initRichEditor();

  // Initialiser le téléversement d'images
  initImageUpload();

  // Initialiser la validation du formulaire
  initFormValidation();

  // Initialiser la dépendance catégorie/sous-catégorie
  initCategoryDependencies();

  // Initialiser l'entrée des mots-clés
  initTagInput();
});

/**
 * Initialize form tabs navigation
 */
function initFormTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  if (!tabButtons.length || !tabContents.length) return;

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Obtenir l'ID de l'onglet
      const tabId = this.dataset.tab;

      // Retirer la classe active de tous les boutons et contenus
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Ajouter la classe active au bouton cliqué
      this.classList.add("active");

      // Afficher le contenu de l'onglet correspondant
      const targetContent = document.getElementById(`${tabId}-content`);
      if (targetContent) {
        targetContent.classList.add("active");
      }
    });
  });
}

/**
 * Initialize rich text editor for product description
 */
function initRichEditor() {
  const richEditors = document.querySelectorAll(".rich-editor");

  if (!richEditors.length) return;

  // Dans une implémentation réelle, vous intégreriez une bibliothèque d'éditeur de texte riche comme TinyMCE, CKEditor, etc.
  // Pour cette démo, nous ajouterons simplement une barre d'outils avec des boutons de formatage de base

  richEditors.forEach((editor) => {
    // Créer la barre d'outils
    const toolbar = document.createElement("div");
    toolbar.className = "editor-toolbar";
    toolbar.innerHTML = `
            <button type="button" class="editor-btn" data-command="bold" title="Gras">
                <i class="fas fa-bold"></i>
            </button>
            <button type="button" class="editor-btn" data-command="italic" title="Italique">
                <i class="fas fa-italic"></i>
            </button>
            <button type="button" class="editor-btn" data-command="underline" title="Souligné">
                <i class="fas fa-underline"></i>
            </button>
            <span class="separator"></span>
            <button type="button" class="editor-btn" data-command="insertUnorderedList" title="Liste à puces">
                <i class="fas fa-list-ul"></i>
            </button>
            <button type="button" class="editor-btn" data-command="insertOrderedList" title="Liste numérotée">
                <i class="fas fa-list-ol"></i>
            </button>
            <span class="separator"></span>
            <button type="button" class="editor-btn" data-command="createLink" title="Lien">
                <i class="fas fa-link"></i>
            </button>
        `;

    // Insérer la barre d'outils avant l'éditeur
    editor.parentNode.insertBefore(toolbar, editor);

    // Ajouter la fonctionnalité des boutons de la barre d'outils
    const buttons = toolbar.querySelectorAll(".editor-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        const command = this.dataset.command;

        if (command === "createLink") {
          const url = prompt("Entrez l'URL du lien:", "https://");
          if (url) {
            // Mettre le focus sur l'éditeur et insérer le lien
            editor.focus();
            document.execCommand("createLink", false, url);
          }
        } else {
          // Mettre le focus sur l'éditeur et exécuter la commande
          editor.focus();
          document.execCommand(command, false, null);
        }
      });
    });
  });

  // Ajouter le CSS pour la barre d'outils de l'éditeur
  const style = document.createElement("style");
  style.textContent = `
        .editor-toolbar {
            display: flex;
            gap: 5px;
            background-color: var(--color-grey-100);
            border: 1px solid var(--color-grey-300);
            border-bottom: none;
            border-radius: var(--radius-md) var(--radius-md) 0 0;
            padding: 8px;
        }
        
        .rich-editor {
            border-top-left-radius: 0;
            border-top-right-radius: 0;
        }
        
        .editor-btn {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--color-white);
            border: 1px solid var(--color-grey-300);
            border-radius: var(--radius-sm);
            color: var(--color-grey-700);
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .editor-btn:hover {
            background-color: var(--color-grey-200);
        }
        
        .separator {
            width: 1px;
            height: 24px;
            background-color: var(--color-grey-300);
            margin: 0 5px;
        }
    `;
  document.head.appendChild(style);
}

/**
 * Initialize image upload functionality
 */
function initImageUpload() {
  const imageDropzone = document.querySelector(".image-dropzone");
  const fileInput = document.getElementById("image-upload");
  const uploadedImagesGrid = document.getElementById("uploaded-images-grid");

  if (!imageDropzone || !fileInput || !uploadedImagesGrid) return;

  // Gérer la sélection de fichiers via l'entrée
  fileInput.addEventListener("change", function (e) {
    handleFiles(this.files);
  });

  // Gérer le glisser-déposer
  imageDropzone.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.add("dragover");
  });

  imageDropzone.addEventListener("dragleave", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove("dragover");
  });

  imageDropzone.addEventListener("drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove("dragover");

    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  });

  // Gérer le clic sur la zone de dépôt pour déclencher la boîte de dialogue de fichier
  imageDropzone.addEventListener("click", function () {
    fileInput.click();
  });

  // Traiter les fichiers téléversés
  function handleFiles(files) {
    Array.from(files).forEach((file) => {
      // Valider le type de fichier
      if (!file.type.match("image.*")) {
        alert("Veuillez télécharger uniquement des images (JPG, PNG)");
        return;
      }

      // Valider la taille du fichier (max 5 Mo)
      if (file.size > 5 * 1024 * 1024) {
        alert("La taille maximale d'image est de 5 Mo");
        return;
      }

      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = function (e) {
        const imagePreview = document.createElement("div");
        imagePreview.className = "uploaded-image";
        imagePreview.innerHTML = `
                    <img src="${e.target.result}" alt="Image du produit">
                    <div class="image-actions">
                        <button type="button" class="image-action-btn primary-btn" title="Définir comme image principale">
                            <i class="fas fa-star"></i>
                        </button>
                        <button type="button" class="image-action-btn delete-btn" title="Supprimer">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <div class="drag-handle" title="Déplacer">
                        <i class="fas fa-grip-lines"></i>
                    </div>
                `;

        uploadedImagesGrid.appendChild(imagePreview);

        // Initialiser le bouton de suppression
        const deleteBtn = imagePreview.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", function () {
          imagePreview.classList.add("removing");
          setTimeout(() => {
            imagePreview.remove();
          }, 300);
        });

        // Initialiser le bouton d'image principale
        const primaryBtn = imagePreview.querySelector(".primary-btn");
        primaryBtn.addEventListener("click", function () {
          // Retirer la classe principale de toutes les images
          document.querySelectorAll(".uploaded-image").forEach((img) => {
            img.classList.remove("primary");
          });

          // Ajouter la classe principale à cette image
          imagePreview.classList.add("primary");
        });
      };

      reader.readAsDataURL(file);
    });
  }

  // Ajouter le CSS pour la gestion des images
  const style = document.createElement("style");
  style.textContent = `
        .image-dropzone.dragover {
            border-color: var(--color-primary);
            background-color: rgba(74, 111, 165, 0.05);
        }
        
        .uploaded-image {
            position: relative;
            width: 120px;
            height: 120px;
            border-radius: var(--radius-md);
            overflow: hidden;
            box-shadow: var(--shadow-sm);
            transition: all 0.3s ease;
        }
        
        .uploaded-image.removing {
            opacity: 0;
            transform: scale(0.8);
        }
        
        .uploaded-image.primary {
            border: 2px solid var(--color-primary);
        }
        
        .uploaded-image.primary::after {
            content: "Principale";
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: var(--color-primary);
            color: white;
            font-size: 12px;
            padding: 2px 0;
            text-align: center;
        }
        
        .uploaded-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .image-actions {
            position: absolute;
            top: 0;
            right: 0;
            display: flex;
            flex-direction: column;
            gap: 5px;
            padding: 5px;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        
        .uploaded-image:hover .image-actions {
            opacity: 1;
        }
        
        .image-action-btn {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(255, 255, 255, 0.8);
            border: none;
            border-radius: var(--radius-full);
            cursor: pointer;
            font-size: 12px;
        }
        
        .image-action-btn.primary-btn {
            color: var(--color-warning);
        }
        
        .image-action-btn.delete-btn {
            color: var(--color-danger);
        }
        
        .drag-handle {
            position: absolute;
            top: 50%;
            left: 5px;
            transform: translateY(-50%);
            color: white;
            background-color: rgba(0, 0, 0, 0.3);
            width: 24px;
            height: 24px;
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: grab;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        
        .uploaded-image:hover .drag-handle {
            opacity: 1;
        }
    `;
  document.head.appendChild(style);
}

/**
 * Initialize form validation
 */
function initFormValidation() {
  const productForm = document.getElementById("product-form");

  if (!productForm) return;

  productForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // À des fins de démonstration, enregistrer les données du formulaire
    const formData = new FormData(this);
    const productData = {};

    formData.forEach((value, key) => {
      productData[key] = value;
    });

    console.log("Form submitted with data:", productData);

    // Dans une implémentation réelle, cela soumettrait les données via AJAX
    // Pour la démo, afficher un message de succès
    alert("Produit enregistré avec succès");

    // Optionnellement, rediriger vers la page des produits
    // window.location.href = 'products.html';
  });
}

/**
 * Initialize category dependencies (populate subcategories based on main category)
 */
function initCategoryDependencies() {
  const categorySelect = document.getElementById("product-category");
  const subcategorySelect = document.getElementById("product-subcategory");

  if (!categorySelect || !subcategorySelect) return;

  // Définir les sous-catégories pour chaque catégorie principale
  const subcategories = {
    bois: [
      "Mobilier",
      "Décoration",
      "Cuisine",
      "Jouets",
      "Accessoires",
      "Autre",
    ],
    ceramique: ["Vaisselle", "Décoration", "Sculptures", "Bijoux", "Autre"],
    textile: [
      "Vêtements",
      "Accessoires",
      "Décoration",
      "Linge de maison",
      "Autre",
    ],
    bijoux: [
      "Colliers",
      "Bracelets",
      "Boucles d'oreilles",
      "Bagues",
      "Broches",
      "Autre",
    ],
    cuir: [
      "Sacs",
      "Portefeuilles",
      "Ceintures",
      "Chaussures",
      "Accessoires",
      "Autre",
    ],
    verre: ["Vases", "Verrerie", "Décoration", "Luminaires", "Autre"],
    metal: ["Bijoux", "Décoration", "Ustensiles", "Sculptures", "Autre"],
    papier: ["Papeterie", "Art", "Décoration", "Autre"],
  };

  // Mettre à jour les sous-catégories lorsque la catégorie principale change
  categorySelect.addEventListener("change", function () {
    const category = this.value;

    // Effacer les options actuelles
    subcategorySelect.innerHTML =
      '<option value="">Sélectionner une sous-catégorie</option>';

    // Ajouter de nouvelles options en fonction de la catégorie sélectionnée
    if (category && subcategories[category]) {
      subcategories[category].forEach((subcategory) => {
        const option = document.createElement("option");
        option.value = subcategory.toLowerCase().replace(/\s+/g, "-");
        option.textContent = subcategory;
        subcategorySelect.appendChild(option);
      });
    }
  });
}

/**
 * Initialize tag input
 */
function initTagInput() {
  const tagInput = document.querySelector(".tags-input");

  if (!tagInput) return;

  // Créer un conteneur pour les mots-clés et l'entrée cachée
  const tagsContainer = document.createElement("div");
  tagsContainer.className = "tags-container";

  const hiddenInput = document.createElement("input");
  hiddenInput.type = "hidden";
  hiddenInput.name = tagInput.name;

  // Remplacer l'entrée originale par le conteneur de mots-clés
  tagInput.parentNode.insertBefore(tagsContainer, tagInput);
  tagInput.parentNode.insertBefore(hiddenInput, tagInput);

  // Modifier l'entrée originale
  tagInput.classList.add("tag-input-field");
  tagInput.placeholder = "Ajouter un mot-clé et appuyer sur Entrée";
  tagInput.name = "";

  // Déplacer l'entrée originale dans le conteneur
  tagsContainer.appendChild(tagInput);

  // Gérer l'entrée des mots-clés
  tagInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();

      const value = this.value.trim();
      if (value) {
        addTag(value);
        this.value = "";
        updateHiddenInput();
      }
    }
  });

  // Fonction pour ajouter un mot-clé
  function addTag(text) {
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.innerHTML = `
            <span class="tag-text">${text}</span>
            <button type="button" class="tag-remove">
                <i class="fas fa-times"></i>
            </button>
        `;

    tagsContainer.insertBefore(tag, tagInput);

    // Gérer la suppression des mots-clés
    const removeBtn = tag.querySelector(".tag-remove");
    removeBtn.addEventListener("click", function () {
      tag.remove();
      updateHiddenInput();
    });
  }

  // Mettre à jour l'entrée cachée avec les mots-clés séparés par des virgules
  function updateHiddenInput() {
    const tags = Array.from(
      tagsContainer.querySelectorAll(".tag .tag-text")
    ).map((tag) => tag.textContent);

    hiddenInput.value = tags.join(",");
  }

  // Ajouter le CSS pour l'entrée des mots-clés
  const style = document.createElement("style");
  style.textContent = `
        .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 5px;
            border: 1px solid var(--color-grey-300);
            border-radius: var(--radius-md);
            background-color: var(--color-white);
            min-height: 42px;
        }
        
        .tags-container:focus-within {
            border-color: var(--color-primary-light);
            box-shadow: 0 0 0 0.2rem rgba(74, 111, 165, 0.25);
        }
        
        .tag {
            display: flex;
            align-items: center;
            gap: 5px;
            background-color: var(--color-primary-light);
            color: var(--color-white);
            border-radius: var(--radius-full);
            padding: 2px 10px;
            font-size: 14px;
        }
        
        .tag-remove {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
            border-radius: var(--radius-full);
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 10px;
        }
        
        .tag-remove:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }
        
        .tag-input-field {
            flex: 1;
            min-width: 120px;
            border: none;
            outline: none;
            padding: 8px 5px;
            background: transparent;
        }
    `;
  document.head.appendChild(style);
}
