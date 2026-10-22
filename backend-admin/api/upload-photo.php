<?php
/**
 * Endpoint AJAX protégé par session admin — utilisé par le drag & drop
 * multi-fichiers de /admin/manage-photos.php. Un upload = une requête ;
 * le client boucle sur chaque fichier déposé.
 */
require_once __DIR__ . '/../admin/includes/auth.php';
require_once __DIR__ . '/../admin/includes/csrf.php';
require_once __DIR__ . '/../admin/includes/functions.php';

header('Content-Type: application/json; charset=utf-8');

if (!dn_is_logged_in()) {
    http_response_code(401);
    echo json_encode(['error' => 'Non authentifié.']);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée.']);
    exit;
}

$sent = $_POST['csrf_token'] ?? '';
$expected = $_SESSION['dn_csrf_token'] ?? '';
if ($sent === '' || $expected === '' || !hash_equals($expected, $sent)) {
    http_response_code(403);
    echo json_encode(['error' => 'Jeton CSRF invalide.']);
    exit;
}

try {
    $extension = dn_validate_image_upload($_FILES['photo'] ?? [], DN_MAX_PHOTO_BYTES);
    $filename = dn_store_upload($_FILES['photo'], $extension, DN_UPLOAD_DIR_PHOTOS);
    $publicPath = DN_UPLOAD_URL_PHOTOS . $filename;

    $category = in_array($_POST['category'] ?? 'photo', ['photo', 'graphisme', 'web'], true) ? $_POST['category'] : 'photo';

    $stmt = dn_db()->prepare(
        'INSERT INTO gallery_photos (file_path, title, description, category, uploaded_by)
         VALUES (:path, :title, :description, :category, :uploaded_by)'
    );
    $stmt->execute([
        'path' => $publicPath,
        'title' => trim($_POST['title'] ?? '') ?: null,
        'description' => trim($_POST['description'] ?? '') ?: null,
        'category' => $category,
        'uploaded_by' => dn_current_user_id(),
    ]);

    $id = (int) dn_db()->lastInsertId();
    dn_log_action(dn_current_user_id(), 'photo.add', 'Ajout (drag & drop) photo #' . $id);

    echo json_encode(['success' => true, 'id' => $id, 'file_path' => $publicPath]);
} catch (RuntimeException $e) {
    http_response_code(422);
    echo json_encode(['error' => $e->getMessage()]);
}
