<?php
require_once __DIR__ . '/../admin/includes/cors.php';
require_once __DIR__ . '/../admin/includes/db.php';

dn_send_cors_headers();

$settings = dn_db()->query('SELECT logo_path, site_title, favicon_path FROM site_settings WHERE id = 1')->fetch();

echo json_encode([
    'logo_url' => !empty($settings['logo_path']) ? $settings['logo_path'] : null,
    'favicon_url' => !empty($settings['favicon_path']) ? $settings['favicon_path'] : null,
    'site_title' => $settings['site_title'] ?? null,
]);
