<?php
require_once __DIR__ . '/../admin/includes/cors.php';
require_once __DIR__ . '/../admin/includes/db.php';

dn_send_cors_headers();

$stmt = dn_db()->query(
    "SELECT id, file_path, title, description, category, upload_date
     FROM gallery_photos WHERE is_active = TRUE ORDER BY upload_date DESC"
);
$photos = $stmt->fetchAll();

echo json_encode(['photos' => $photos]);
