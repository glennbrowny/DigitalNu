<?php
/**
 * Configuration centrale du back-office. Copiez ce fichier en config.local.php
 * (ignoré par les instructions de déploiement) et renseignez vos identifiants
 * réels — ne committez jamais de vrais identifiants dans config.php.
 */

// --- Base de données ---------------------------------------------------
define('DB_HOST', getenv('DN_DB_HOST') ?: '127.0.0.1');
// Cette machine fait tourner deux instances MySQL/MariaDB en parallèle
// (un autre projet occupe le port 3306) : celle de WAMP pour ce projet
// écoute sur 3307 en local. En production, laissez DN_DB_PORT vide
// (le 3306 standard sera utilisé).
define('DB_PORT', getenv('DN_DB_PORT') ?: '3307');
define('DB_NAME', getenv('DN_DB_NAME') ?: 'digital_numerique');
// Valeurs par défaut adaptées à WAMP en local (root sans mot de passe).
// En production, définissez plutôt les variables d'environnement
// DN_DB_USER / DN_DB_PASS avec un compte dédié à droits limités.
define('DB_USER', getenv('DN_DB_USER') ?: 'root');
define('DB_PASS', getenv('DN_DB_PASS') ?: '');

// --- Origine(s) autorisée(s) à appeler /api en CORS (le site GitHub Pages) ---
define('DN_ALLOWED_ORIGINS', [
    'https://glennbrowny.github.io',
]);

// --- Uploads -------------------------------------------------------------
// Stockés sous /admin/uploads/ (protégé contre l'exécution PHP par
// admin/uploads/.htaccess) ; les URLs publiques reflètent ce même chemin.
define('DN_UPLOAD_DIR_LOGO', __DIR__ . '/../uploads/logo/');
define('DN_UPLOAD_DIR_PHOTOS', __DIR__ . '/../uploads/photos/');
define('DN_UPLOAD_URL_LOGO', '/admin/uploads/logo/');
define('DN_UPLOAD_URL_PHOTOS', '/admin/uploads/photos/');
define('DN_MAX_LOGO_BYTES', 2 * 1024 * 1024); // 2 Mo
define('DN_MAX_PHOTO_BYTES', 8 * 1024 * 1024); // 8 Mo

// --- Session ---------------------------------------------------------------
define('DN_SESSION_TIMEOUT', 30 * 60); // 30 minutes d'inactivité

if (!defined('DN_CONFIG_LOADED')) {
    define('DN_CONFIG_LOADED', true);
}
