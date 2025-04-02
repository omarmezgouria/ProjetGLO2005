# ProjetGLO2005

Pour faire marcher la base de données sur votre machine suivez les étapes suivantes:

- Téléchargez MySQL (assurez-vous d'inclure MySQL Server 8.0, MySQL Workbench et/ou MySQL Shell)

Pour MySQL Shell :

Créer une base de données et un utilisateur de cette façon:

-- Créez la base de données
CREATE DATABASE glo2005_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créez l'utilisateur avec le mot de passe spécifié dans app.py
CREATE USER 'glo_user'@'localhost' IDENTIFIED BY '@glo2005';

-- Accordez les privilèges
GRANT ALL PRIVILEGES ON glo2005_db.\* TO 'glo_user'@'localhost';

-- Appliquez les privilèges
FLUSH PRIVILEGES;

-- Vérifiez que la base de données a été créée
SHOW DATABASES;

-- Quittez MySQL
EXIT;

Pour MySQL Workbench:

- Créez une base de données avec les paramètres suivants:
  Create Schema - nom de schema: glo2005_db - character set : utf8mb4 - collation : utf8mb4_unicode_ci

- Créez un utilisateur:
  Server --> Users and Priveleges --> Add Account - Login Name : glo_user - Authentication Type : Standard - Limit to Hosts Matching : localhost - Password : @glo2005

- Configurez les permissions:
  Users and Privelges --> Schema Priveleges --> Add Entry
  Selectionnez glo2005_db, puis dans "Schema Priveleges" cochez "ALL" dans la section "Object Rights", et enfin "Apply"
