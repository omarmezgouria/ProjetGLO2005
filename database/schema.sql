-- ============================================================================
-- Utilisateurs et Roles
-- ============================================================================

CREATE TABLE Utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    role ENUM('client', 'artisan', 'admin') NOT NULL DEFAULT 'client',
    telephone VARCHAR(20),
    adresse TEXT
);

CREATE TABLE Artisan (
    id INT PRIMARY KEY,
    nom_entreprise VARCHAR(255),
    bio TEXT,
    photo_url VARCHAR(255),
    site_web VARCHAR(255),
    FOREIGN KEY (id) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

-- ============================================================================
-- Produits et Categories
-- ============================================================================

CREATE TABLE Categorie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE Produit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_artisan INT NOT NULL,
    id_categorie INT,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    prix DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT NULL,
    photo_principale_url VARCHAR(255),
    est_actif BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_artisan) REFERENCES Artisan(id) ON DELETE CASCADE,
    FOREIGN KEY (id_categorie) REFERENCES Categorie(id) ON DELETE SET NULL
);

-- ============================================================================
-- Commandes
-- ============================================================================

CREATE TABLE Commande (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_client INT NOT NULL,
    date_commande DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('en_attente', 'confirmé', 'livré', 'annulé') NOT NULL DEFAULT 'en_attente',
    montant_total DECIMAL(10, 2) DEFAULT 0.00,
    adresse_livraison TEXT,
    notes_client TEXT,
    FOREIGN KEY (id_client) REFERENCES Utilisateur(id) ON DELETE RESTRICT
);

CREATE TABLE Commande_Item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_commande INT NOT NULL,
    id_produit INT NOT NULL,
    quantite INT NOT NULL DEFAULT 1,
    prix_unitaire DECIMAL(10, 2) NOT NULL, -- Price at the time of order
    FOREIGN KEY (id_commande) REFERENCES Commande(id) ON DELETE CASCADE,
    FOREIGN KEY (id_produit) REFERENCES Produit(id) ON DELETE RESTRICT,
    UNIQUE KEY uq_commande_produit (id_commande, id_produit)
);