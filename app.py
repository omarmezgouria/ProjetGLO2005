from flask import Flask, render_template, request, redirect
import mysql.connector

app = Flask(__name__)

# Connexion à la base de données
db = mysql.connector.connect(
    host='localhost',
    user='root',
    password='r00tPassword1',
    database='utilisateur_db'
)
cursor = db.cursor(dictionary=True)

# Création de la table si elle n'existe pas
cursor.execute("""
CREATE TABLE IF NOT EXISTS utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
)
""")
db.commit()

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        nom = request.form['nom']
        prenom = request.form['prenom']
        email = request.form['email']
        password = request.form['password']

        cursor.execute("""
            INSERT INTO utilisateur (nom, prenom, email, password)
            VALUES (%s, %s, %s, %s)
        """, (nom, prenom, email, password))
        db.commit()

        return "Inscription réussie"

    return render_template('register.html')
@app.route('/user/<int:id>')
def user(id):
    cursor.execute("SELECT * FROM utilisateur WHERE id = %s", (id,))
    user = cursor.fetchone()
    if user:
        return render_template('user.html', user=user)
    else :
        return "Utilisateur non trouvé", 404
    
@app.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        cursor.execute("SELECT * FROM utilisateur WHERE email = %s AND password = %s", (email, password))
        user = cursor.fetchone()

        if user:
            return redirect("/user/" + str(user["id"]))  
        else:
            return "Identifiants incorrects", 401

    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)
