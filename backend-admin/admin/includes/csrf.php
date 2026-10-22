<?php
require_once __DIR__ . '/auth.php';

function dn_csrf_token(): string
{
    dn_start_session();
    if (empty($_SESSION['dn_csrf_token'])) {
        $_SESSION['dn_csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['dn_csrf_token'];
}

function dn_csrf_field(): string
{
    return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars(dn_csrf_token(), ENT_QUOTES, 'UTF-8') . '">';
}

/**
 * À appeler en tête de traitement de tout POST admin.
 */
function dn_csrf_verify(): void
{
    dn_start_session();
    $sent = $_POST['csrf_token'] ?? '';
    $expected = $_SESSION['dn_csrf_token'] ?? '';
    if ($sent === '' || $expected === '' || !hash_equals($expected, $sent)) {
        http_response_code(403);
        exit('Requête invalide (jeton CSRF manquant ou expiré). Rechargez la page et réessayez.');
    }
}
