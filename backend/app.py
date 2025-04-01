import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

# Initialiser l'application Flask
app = Flask(__name__)

# Charger la configuration depuis les variables d'environnement
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default_secret_key_for_dev')
# Ajouter la configuration de la base de données plus tard, ex., app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')

# Activer CORS pour toutes les routes, autorisant les requêtes de n'importe quelle origine
# Pour la production, vous voudrez peut-être restreindre cela au domaine de votre frontend
CORS(app)

# --- Routes ---

@app.route('/')
def index():
    """Basic route to check if the backend is running."""
    return jsonify({"message": "Welcome to the ArtiConnect Backend!"})

@app.route('/api/products', methods=['GET'])
def get_products():
    """Example endpoint to get a list of products."""
    # TODO : Remplacer ceci par la logique réelle de récupération de base de données
    sample_products = [
        {"id": 1, "name": "Table basse en chêne", "price": 620.00, "imageUrl": "../images/product-1.jpg", "artisan": "Sophie Dupont", "category": "Travail du bois"},
        {"id": 2, "name": "Étagère murale sur mesure", "price": 345.00, "imageUrl": "../images/product-2.jpg", "artisan": "Lucas Morin", "category": "Travail du bois"},
        {"id": 3, "name": "Banc en bois recyclé", "price": 280.00, "imageUrl": "../images/product-3.jpg", "artisan": "Atelier Verde", "category": "Mobilier"},
        # Ajouter plus de produits d'exemple si nécessaire
    ]
    # Simuler le filtrage si un paramètre de requête de catégorie est présent
    category = request.args.get('category')
    if category:
        filtered_products = [p for p in sample_products if p.get('category', '').lower() == category.lower()]
        return jsonify(filtered_products)
    else:
        return jsonify(sample_products)

# Ajouter plus de points de terminaison API ici pour :
# - Détails produit (/api/products/<int:product_id>)
# - Authentification utilisateur (connexion, inscription, déconnexion)
# - Gestion du panier (ajouter, supprimer, voir)
# - Passation de commande et historique
# - Profils artisan et produits

# --- Exécuter l'Application ---

if __name__ == '__main__':
    # Obtenir le port depuis la variable d'environnement ou 5000 par défaut
    port = int(os.environ.get('PORT', 5000))
    # Exécuter en mode débogage pour le développement (recharge auto lors des changements de code)
    # Mettre debug=False pour la production
    app.run(debug=True, port=port)