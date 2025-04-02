import os
import mysql.connector
from mysql.connector import errorcode
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
import decimal # Importer decimal pour gérer les types Decimal potentiels de la BDD

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

# Initialiser l'application Flask
app = Flask(__name__)

# --- Configuration ---
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'a_very_default_and_insecure_secret_key')

# Configuration de la base de données depuis les variables d'environnement
DB_CONFIG = {
    'user': os.environ.get('DB_USER', 'glo_user'),
    'password': os.environ.get('DB_PASSWORD', '@glo2005'), # Assurez-vous que cela correspond à votre .env ou aux valeurs par défaut
    'host': os.environ.get('DB_HOST', 'localhost'),
    'database': os.environ.get('DB_NAME', 'glo2005_db'), # Assurez-vous que cela correspond au nom réel de votre BDD
    'port': os.environ.get('DB_PORT', 3306) # Port MySQL par défaut
}

# Afficher la configuration BDD utilisée (excluant le mot de passe pour la sécurité)
print(f"--- Using DB Config: User={DB_CONFIG['user']}, Host={DB_CONFIG['host']}, Port={DB_CONFIG['port']}, Database={DB_CONFIG['database']} ---")

# --- Aide à la Connexion Base de Données ---
def get_db_connection():
    """Établit une connexion à la base de données."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("!!! Erreur Base de Données : Problème avec votre nom d'utilisateur ou mot de passe !!!")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print(f"!!! Erreur Base de Données : La base de données '{DB_CONFIG['database']}' n'existe pas !!!")
        else:
            print(f"!!! Erreur de connexion à la base de données : {err} !!!")
        return None # Indiquer l'échec de la connexion

# --- Configuration CORS ---
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}}) # Ajuster les origines si nécessaire

# --- Fonction d'Aide pour Convertir Ligne en Dict ---
def row_to_dict(cursor, row):
    """Convertit un tuple de ligne de base de données en dictionnaire."""
    if row is None:
        return None
    # Convertir les types Decimal en float pour la sérialisation JSON
    return {col[0]: float(value) if isinstance(value, decimal.Decimal) else value for col, value in zip(cursor.description, row)}

# --- Routes ---

@app.route('/')
def index():
    """Route de base pour vérifier si le backend fonctionne."""
    return jsonify({"message": "Welcome to the ArtiConnect Backend (MySQL Direct)!"})

# ============================================================================
# Routes d'Authentification
# ============================================================================

@app.route('/api/register', methods=['POST'])
def register():
    """Enregistre un nouvel utilisateur en utilisant SQL direct."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    email = data.get('email')
    password = data.get('password')
    nom = data.get('nom')
    prenom = data.get('prenom')
    role = data.get('role', 'client') # Rôle par défaut : client

    if not email or not password or not nom:
        return jsonify({"error": "Missing required fields (email, password, nom)"}), 400

    # Validation de base du rôle (peut être étendue)
    if role not in ['client', 'artisan', 'admin']:
         return jsonify({"error": f"Invalid role specified: {role}"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error. Please check server logs."}), 500

    cursor = None
    try:
        cursor = conn.cursor()

        # Vérifier si l'utilisateur existe déjà
        query_check = "SELECT id FROM Utilisateur WHERE email = %s"
        cursor.execute(query_check, (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({"error": "Email déjà enregistré"}), 409 # Conflit

        # Hacher le mot de passe
        hashed_password = generate_password_hash(password)

        # Insérer le nouvel utilisateur
        query_insert = """
            INSERT INTO Utilisateur (email, mot_de_passe_hash, nom, prenom, role)
            VALUES (%s, %s, %s, %s, %s)
        """
        user_data = (email, hashed_password, nom, prenom, role)
        cursor.execute(query_insert, user_data)
        conn.commit()

        return jsonify({"message": "Utilisateur enregistré avec succès"}), 201 # Créé

    except mysql.connector.Error as err:
        conn.rollback() # Annuler en cas d'erreur
        if err.errno == errorcode.ER_DUP_ENTRY: # Vérifier l'erreur d'entrée dupliquée
             return jsonify({"error": "Email déjà enregistré (Erreur d'intégrité)"}), 409
        else:
             print(f"!!! Database error during registration: {err} !!!")
             return jsonify({"error": "Registration failed due to database issue"}), 500
    except Exception as e:
         conn.rollback()
         print(f"!!! Unexpected error during registration: {e} !!!")
         return jsonify({"error": "An unexpected error occurred during registration."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


@app.route('/api/login', methods=['POST'])
def login():
    """Connecte un utilisateur en utilisant SQL direct."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error. Please check server logs."}), 500

    cursor = None
    try:
        # Utiliser dictionary=True pour obtenir les résultats sous forme de dictionnaires
        cursor = conn.cursor(dictionary=True)

        query = "SELECT id, nom, prenom, email, role, mot_de_passe_hash FROM Utilisateur WHERE email = %s"
        cursor.execute(query, (email,))
        user = cursor.fetchone() # Récupérer une seule ligne

        if user and check_password_hash(user['mot_de_passe_hash'], password):
            # Le mot de passe correspond, connecter l'utilisateur
            session['user_id'] = user['id']
            session['role'] = user['role'] # Le rôle est déjà une chaîne depuis la BDD
            session['nom'] = user['nom']

            # Ne pas renvoyer le hash du mot de passe au client
            user_info = {k: v for k, v in user.items() if k != 'mot_de_passe_hash'}

            return jsonify({
                "message": "Login successful",
                "user": user_info
            }), 200
        else:
            # Identifiants invalides
            return jsonify({"error": "Email ou mot de passe invalide"}), 401 # Non autorisé

    except mysql.connector.Error as err:
        print(f"!!! Database error during login: {err} !!!")
        return jsonify({"error": "Login failed due to database issue"}), 500
    except Exception as e:
        print(f"!!! Unexpected error during login: {e} !!!")
        return jsonify({"error": "An unexpected error occurred during login."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

@app.route('/api/logout', methods=['POST'])
def logout():
    """Déconnecte l'utilisateur actuel."""
    session.clear() # Effacer toutes les données de session
    return jsonify({"message": "Logout successful"}), 200

@app.route('/api/check_session', methods=['GET'])
def check_session():
    """Vérifie si un utilisateur est actuellement connecté en utilisant SQL direct."""
    if 'user_id' in session:
        conn = get_db_connection()
        if not conn:
             # Impossible de vérifier la session si la BDD est hors service, traiter comme non connecté
             session.clear()
             return jsonify({"isLoggedIn": False, "user": None, "error": "Database error checking session"}), 500

        cursor = None
        try:
            cursor = conn.cursor(dictionary=True)
            query = "SELECT id, nom, prenom, email, role FROM Utilisateur WHERE id = %s"
            cursor.execute(query, (session['user_id'],))
            user = cursor.fetchone()

            if user:
                 return jsonify({
                    "isLoggedIn": True,
                    "user": user
                }), 200
            else: # ID utilisateur dans la session mais pas dans la BDD (cas limite)
                 session.clear() # Effacer la session invalide
                 return jsonify({"isLoggedIn": False, "user": None}), 200

        except mysql.connector.Error as err:
            print(f"!!! Database error during session check: {err} !!!")
            session.clear()
            return jsonify({"isLoggedIn": False, "user": None, "error": "Database error checking session"}), 500
        except Exception as e:
            print(f"!!! Unexpected error during session check: {e} !!!")
            session.clear()
            return jsonify({"isLoggedIn": False, "user": None, "error": "An unexpected error occurred checking session."}), 500
        finally:
            if cursor:
                cursor.close()
            if conn and conn.is_connected():
                conn.close()
    else:
        return jsonify({"isLoggedIn": False, "user": None}), 200

# ============================================================================
# Routes Produits
# ============================================================================

@app.route('/api/products', methods=['GET'])
def get_products():
    """Point de terminaison pour obtenir une liste de produits en utilisant SQL direct."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error fetching products. Please check server logs."}), 500

    cursor = None
    try:
        cursor = conn.cursor(dictionary=True) # Obtenir les résultats sous forme de dicts

        # Requête de base joignant les tables nécessaires
        base_query = """
            SELECT
                p.id,
                p.titre AS name,
                p.prix AS price,
                p.photo_principale_url AS imageUrl,
                p.description,
                p.stock,
                u.nom AS artisan,
                c.nom AS category
            FROM Produit p
            JOIN Artisan a ON p.id_artisan = a.id
            JOIN Utilisateur u ON a.id = u.id
            LEFT JOIN Categorie c ON p.id_categorie = c.id
            WHERE p.est_actif = TRUE
        """
        params = []

        # Filtrer par catégorie si fournie
        category_name = request.args.get('category')
        if category_name:
            # Trouver d'abord l'ID de catégorie (insensible à la casse)
            cursor.execute("SELECT id FROM Categorie WHERE LOWER(nom) = LOWER(%s)", (category_name,))
            category_row = cursor.fetchone()
            if category_row:
                base_query += " AND p.id_categorie = %s"
                params.append(category_row['id'])
            else:
                return jsonify([]) # Catégorie non trouvée, retourner une liste vide

        cursor.execute(base_query, params)
        products = cursor.fetchall()

        # Convertir Decimal en float pour JSON
        for p in products:
            if p.get('price') is not None:
                p['price'] = float(p['price'])
            if p.get('imageUrl') is None:
                 p['imageUrl'] = "../images/placeholder.jpg" # Image par défaut

        return jsonify(products)

    except mysql.connector.Error as err:
        print(f"!!! Database error fetching products: {err} !!!")
        return jsonify({"error": "Failed to fetch products due to database issue"}), 500
    except Exception as e:
        print(f"!!! Unexpected error fetching products: {e} !!!")
        return jsonify({"error": "An unexpected error occurred fetching products."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_detail(product_id):
    """Point de terminaison pour obtenir les détails d'un seul produit en utilisant SQL direct."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error fetching product detail. Please check server logs."}), 500

    cursor = None
    try:
        cursor = conn.cursor(dictionary=True)

        # Requête pour les détails du produit et joindre les infos artisan/utilisateur/catégorie
        query = """
            SELECT
                p.id,
                p.titre AS name,
                p.prix AS price,
                p.photo_principale_url AS imageUrl,
                p.description,
                p.stock,
                c.nom AS category,
                a.id AS artisan_id,
                u.nom AS artisan_nom,
                u.prenom AS artisan_prenom,
                a.nom_entreprise AS artisan_nom_entreprise,
                a.bio AS artisan_bio,
                a.photo_url AS artisan_photo_url
            FROM Produit p
            JOIN Artisan a ON p.id_artisan = a.id
            JOIN Utilisateur u ON a.id = u.id
            LEFT JOIN Categorie c ON p.id_categorie = c.id
            WHERE p.id = %s AND p.est_actif = TRUE
        """
        cursor.execute(query, (product_id,))
        product_data = cursor.fetchone()

        if not product_data:
            return jsonify({"error": "Product not found or not active"}), 404

        # Formater le résultat
        artisan_info = {
            "id": product_data['artisan_id'],
            "nom": product_data['artisan_nom'],
            "prenom": product_data['artisan_prenom'],
            "nom_entreprise": product_data['artisan_nom_entreprise'],
            "bio": product_data['artisan_bio'],
            "photo_url": product_data['artisan_photo_url']
        }

        product_detail = {
            "id": product_data['id'],
            "name": product_data['name'],
            "price": float(product_data['price']) if product_data.get('price') is not None else None,
            "imageUrl": product_data['imageUrl'] or "../images/placeholder.jpg",
            "description": product_data['description'],
            "stock": product_data['stock'],
            "category": product_data['category'],
            "artisan": artisan_info
        }

        return jsonify(product_detail)

    except mysql.connector.Error as err:
        print(f"!!! Database error fetching product detail for ID {product_id}: {err} !!!")
        return jsonify({"error": "Failed to fetch product details due to database issue"}), 500
    except Exception as e:
        print(f"!!! Unexpected error fetching product detail for ID {product_id}: {e} !!!")
        return jsonify({"error": "An unexpected error occurred fetching product details."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


# ============================================================================
# Espace réservé pour les Routes Futures
# ============================================================================
# - Gestion du Panier (Ajouter, Supprimer, Voir)
# - Passation de Commande & Historique
# - Profils Artisans & Gestion Produits
# - Gestion Profil Utilisateur
# ============================================================================

# --- Exécuter l'Application ---

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Définir host='0.0.0.0' pour être accessible de l'extérieur, sinon localhost seulement
    app.run(debug=True, port=port) # host='0.0.0.0'