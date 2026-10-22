# Installation du back-office (backend-admin/)

## Architecture — important

Le site public (`index.html` et les autres pages à la racine du dépôt) reste
**100% statique et continue d'être hébergé sur GitHub Pages**, qui ne peut
pas exécuter de PHP ni se connecter à MySQL. Tout ce qui se trouve dans ce
dossier `backend-admin/` doit donc être déployé **séparément**, sur un
hébergement supportant PHP 8+ et MySQL 8+ (mutualisé, VPS, ou un sous-domaine
type `admin.votredomaine.tld`).

Le site GitHub Pages ne fait ensuite qu'appeler, en JavaScript côté client,
les endpoints JSON publics exposés par ce back-office (`/api/settings.php`,
`/api/photos.php`, `/api/greeting.php`) pour afficher automatiquement le
logo, les photos et les messages d'événements gérés depuis l'admin — sans
jamais exécuter de PHP lui-même.

```
GitHub Pages (statique)              Hébergement PHP/MySQL séparé
─────────────────────────            ─────────────────────────────
index.html, main.js, ...    ───►     /admin  (back-office protégé par login)
dynamic-content.js  (fetch)  ◄───    /api    (JSON public en lecture seule, CORS)
```

## 1. Déployer les fichiers

Copiez tout le contenu de `backend-admin/` (à l'exception de ce fichier et
de `sql/`) à la racine du document root de votre hébergement PHP, de sorte
que les URLs obtenues soient bien :

- `https://votre-domaine/admin/login.php`
- `https://votre-domaine/api/settings.php`

## 2. Créer la base de données

```bash
mysql -u root -p -e "CREATE DATABASE digital_numerique CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p digital_numerique < sql/schema.sql
```

Créez un utilisateur MySQL dédié avec des droits limités à cette base :

```sql
CREATE USER 'dn_admin'@'localhost' IDENTIFIED BY 'un-mot-de-passe-fort';
GRANT SELECT, INSERT, UPDATE, DELETE ON digital_numerique.* TO 'dn_admin'@'localhost';
FLUSH PRIVILEGES;
```

## 3. Configurer l'application

Éditez `admin/includes/config.php` (ou définissez les variables
d'environnement `DN_DB_HOST`, `DN_DB_NAME`, `DN_DB_USER`, `DN_DB_PASS` sur le
serveur, ce qui est préférable pour ne jamais committer de secrets) :

- Identifiants MySQL
- `DN_ALLOWED_ORIGINS` : l'origine exacte de votre site GitHub Pages
  (ex. `https://glennbrowny.github.io`), pour que les endpoints `/api`
  n'acceptent des requêtes CORS que depuis ce domaine.

## 4. Créer le premier compte administrateur

En ligne de commande sur le serveur (jamais via le navigateur) :

```bash
cd scripts
php create-admin.php "admin@digitalnumerique.ga" "MotDePasseSolide123!" "Glenn Browny"
```

## 5. Vérifier les prérequis serveur

- **HTTPS obligatoire** : les cookies de session sont marqués `secure`, la
  connexion ne fonctionnera qu'en HTTPS (le `.htaccess` fourni force la
  redirection sous Apache).
- Extensions PHP requises : `pdo_mysql`, `fileinfo`, `session`.
- `upload_max_filesize` / `post_max_size` : au moins 8 Mo (déjà réglé dans le
  `.htaccess` fourni ; à adapter dans `php.ini` sous Nginx/PHP-FPM).
- Sous **Nginx**, les `.htaccess` fournis (protection de `admin/includes/` et
  interdiction d'exécuter du PHP dans `admin/uploads/`) n'ont aucun effet :
  reproduisez ces règles directement dans votre configuration de site
  (`location ~ ^/admin/includes/ { deny all; }`, etc.).

## 6. Activer le contenu dynamique sur le site GitHub Pages

Éditez `dn-config.js` à la racine du dépôt du site et renseignez l'URL de
votre back-office :

```js
window.DN_API_BASE_URL = 'https://admin.digitalnumerique.ga';
```

Tant que cette valeur reste vide, le site continue de fonctionner
normalement avec son contenu statique par défaut (logo, galerie) — aucun
appel réseau n'est effectué.

## Emplacement des fichiers

- Fichiers audio du site public : à la racine du dépôt (déjà en place —
  `Ludovico Einaudi - Nuvole Bianche.mp3`).
- Logos/photos gérés depuis l'admin : stockés automatiquement dans
  `admin/uploads/logo/` et `admin/uploads/photos/` sur l'hébergement
  PHP/MySQL (ne jamais y déposer de fichier manuellement, les noms sont
  générés aléatoirement par l'application).
