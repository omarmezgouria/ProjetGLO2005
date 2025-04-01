/**
 * ArtiConnect - Product Form JavaScript
 * Handles functionality for adding and editing products
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize form tabs
  initFormTabs();

  // Initialize rich text editor
  initRichEditor();

  // Initialize image upload
  initImageUpload();

  // Initialize form validation
  initFormValidation();

  // Initialize category subcategory dependency
  initCategoryDependencies();

  // Initialize tag input
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
      // Get tab id
      const tabId = this.dataset.tab;

      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // Show corresponding tab content
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

  // In a real implementation, you would integrate a rich text editor library like TinyMCE, CKEditor, etc.
  // For this demo, we'll just add a toolbar with basic formatting buttons

  richEditors.forEach((editor) => {
    // Create toolbar
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

    // Insert toolbar before editor
    editor.parentNode.insertBefore(toolbar, editor);

    // Add toolbar button functionality
    const buttons = toolbar.querySelectorAll(".editor-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        const command = this.dataset.command;

        if (command === "createLink") {
          const url = prompt("Entrez l'URL du lien:", "https://");
          if (url) {
            // Focus on editor and insert link
            editor.focus();
            document.execCommand("createLink", false, url);
          }
        } else {
          // Focus on editor and execute command
          editor.focus();
          document.execCommand(command, false, null);
        }
      });
    });
  });

  // Add CSS for editor toolbar
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

  // Handle file selection via input
  fileInput.addEventListener("change", function (e) {
    handleFiles(this.files);
  });

  // Handle drag and drop
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

  // Handle click on dropzone to trigger file dialog
  imageDropzone.addEventListener("click", function () {
    fileInput.click();
  });

  // Process uploaded files
  function handleFiles(files) {
    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.match("image.*")) {
        alert("Veuillez télécharger uniquement des images (JPG, PNG)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La taille maximale d'image est de 5 Mo");
        return;
      }

      // Create image preview
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

        // Initialize delete button
        const deleteBtn = imagePreview.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", function () {
          imagePreview.classList.add("removing");
          setTimeout(() => {
            imagePreview.remove();
          }, 300);
        });

        // Initialize primary image button
        const primaryBtn = imagePreview.querySelector(".primary-btn");
        primaryBtn.addEventListener("click", function () {
          // Remove primary class from all images
          document.querySelectorAll(".uploaded-image").forEach((img) => {
            img.classList.remove("primary");
          });

          // Add primary class to this image
          imagePreview.classList.add("primary");
        });
      };

      reader.readAsDataURL(file);
    });
  }

  // Add CSS for image handling
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

    // For demo purposes, log form data
    const formData = new FormData(this);
    const productData = {};

    formData.forEach((value, key) => {
      productData[key] = value;
    });

    console.log("Form submitted with data:", productData);

    // In a real implementation, this would submit the data via AJAX
    // For demo, show success message
    alert("Produit enregistré avec succès");

    // Optionally redirect back to products page
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

  // Define subcategories for each main category
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

  // Update subcategories when main category changes
  categorySelect.addEventListener("change", function () {
    const category = this.value;

    // Clear current options
    subcategorySelect.innerHTML =
      '<option value="">Sélectionner une sous-catégorie</option>';

    // Add new options based on selected category
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

  // Create container for tags and hidden input
  const tagsContainer = document.createElement("div");
  tagsContainer.className = "tags-container";

  const hiddenInput = document.createElement("input");
  hiddenInput.type = "hidden";
  hiddenInput.name = tagInput.name;

  // Replace original input with tags container
  tagInput.parentNode.insertBefore(tagsContainer, tagInput);
  tagInput.parentNode.insertBefore(hiddenInput, tagInput);

  // Modify original input
  tagInput.classList.add("tag-input-field");
  tagInput.placeholder = "Ajouter un mot-clé et appuyer sur Entrée";
  tagInput.name = "";

  // Move original input into container
  tagsContainer.appendChild(tagInput);

  // Handle tag input
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

  // Function to add a tag
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

    // Handle tag removal
    const removeBtn = tag.querySelector(".tag-remove");
    removeBtn.addEventListener("click", function () {
      tag.remove();
      updateHiddenInput();
    });
  }

  // Update hidden input with comma-separated tags
  function updateHiddenInput() {
    const tags = Array.from(
      tagsContainer.querySelectorAll(".tag .tag-text")
    ).map((tag) => tag.textContent);

    hiddenInput.value = tags.join(",");
  }

  // Add CSS for tags input
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
