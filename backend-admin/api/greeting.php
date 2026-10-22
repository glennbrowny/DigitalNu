<?php
require_once __DIR__ . '/../admin/includes/cors.php';
require_once __DIR__ . '/../admin/includes/db.php';

dn_send_cors_headers();

$stmt = dn_db()->query(
    "SELECT event_name, greeting_message, theme FROM event_greetings
     WHERE is_active = TRUE AND display_start <= CURDATE() AND display_end >= CURDATE()
     ORDER BY created_at DESC LIMIT 1"
);
$greeting = $stmt->fetch();

echo json_encode(['greeting' => $greeting ?: null]);
