<?php
require_once __DIR__ . '/config.php';

/**
 * Démarre (ou reprend) une session admin sécurisée avec expiration
 * après DN_SESSION_TIMEOUT secondes d'inactivité.
 */
function dn_start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        // HTTPS obligatoire en production (voir .htaccess) ; en local
        // (WAMP/localhost sans certificat), le cookie reste utilisable en HTTP.
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();

    if (!empty($_SESSION['dn_last_activity']) && (time() - $_SESSION['dn_last_activity']) > DN_SESSION_TIMEOUT) {
        $_SESSION = [];
        session_destroy();
        session_start();
    }
    $_SESSION['dn_last_activity'] = time();
}

function dn_is_logged_in(): bool
{
    dn_start_session();
    return !empty($_SESSION['dn_user_id']);
}

/**
 * À appeler en tête de chaque page admin protégée.
 */
function dn_require_login(): void
{
    dn_start_session();
    if (empty($_SESSION['dn_user_id'])) {
        header('Location: /admin/login.php');
        exit;
    }
}

function dn_current_user_id(): ?int
{
    dn_start_session();
    return $_SESSION['dn_user_id'] ?? null;
}
