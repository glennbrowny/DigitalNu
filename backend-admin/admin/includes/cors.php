<?php
require_once __DIR__ . '/config.php';

/**
 * Autorise en CORS uniquement les origines listées dans DN_ALLOWED_ORIGINS
 * (le site GitHub Pages) pour les endpoints publics en lecture seule.
 */
function dn_send_cors_headers(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, DN_ALLOWED_ORIGINS, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Content-Type: application/json; charset=utf-8');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }
}
