<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

dn_start_session();

if (dn_is_logged_in()) {
    dn_log_action(dn_current_user_id(), 'auth.logout', 'Déconnexion');
}

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
}
session_destroy();

header('Location: /admin/login.php');
exit;
