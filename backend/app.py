import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize the Flask application
app = Flask(__name__)

# Load configuration from environment variables
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default_secret_key_for_dev')
# Add database config later, e.g., app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')

# Enable CORS for all routes, allowing requests from any origin
# For production, you might want to restrict this to your frontend's domain
CORS(app)

# --- Routes ---

@app.route('/')
def index():
    """Basic route to check if the backend is running."""
    return jsonify({"message": "Welcome to the ArtiConnect Backend!"})

@app.route('/api/products', methods=['GET'])
def get_products():
    """Example endpoint to get a list of products."""
    # TODO: Replace this with actual database fetching logic
    sample_products = [
        {"id": 1, "name": "Table basse en chêne", "price": 620.00, "imageUrl": "../images/product-1.jpg", "artisan": "Sophie Dupont", "category": "Travail du bois"},
        {"id": 2, "name": "Étagère murale sur mesure", "price": 345.00, "imageUrl": "../images/product-2.jpg", "artisan": "Lucas Morin", "category": "Travail du bois"},
        {"id": 3, "name": "Banc en bois recyclé", "price": 280.00, "imageUrl": "../images/product-3.jpg", "artisan": "Atelier Verde", "category": "Mobilier"},
        # Add more sample products if needed
    ]
    # Simulate filtering if a category query parameter is present
    category = request.args.get('category')
    if category:
        filtered_products = [p for p in sample_products if p.get('category', '').lower() == category.lower()]
        return jsonify(filtered_products)
    else:
        return jsonify(sample_products)

# Add more API endpoints here for:
# - Product details (/api/products/<int:product_id>)
# - User authentication (login, register, logout)
# - Cart management (add, remove, view)
# - Order placement and history
# - Artisan profiles and products

# --- Run the Application ---

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    # Run in debug mode for development (auto-reloads on code changes)
    # Set debug=False for production
    app.run(debug=True, port=port)