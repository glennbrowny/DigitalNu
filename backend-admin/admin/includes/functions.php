<?php
require_once __DIR__ . '/db.php';

function dn_e(?string $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

function dn_log_action(?int $userId, string $action, string $details = ''): void
{
    $stmt = dn_db()->prepare(
        'INSERT INTO action_logs (user_id, action, details, ip_address) VALUES (:user_id, :action, :details, :ip)'
    );
    $stmt->execute([
        'user_id' => $userId,
        'action' => $action,
        'details' => $details,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
    ]);
}

/**
 * Valide un fichier image uploadé ($_FILES['xxx']) : taille, extension ET
 * type MIME réel (via finfo, pas le Content-Type déclaré par le
 * navigateur) pour empêcher l'upload d'un exécutable déguisé en image.
 *
 * Retourne l'extension normalisée (ex: 'jpg') en cas de succès, ou lève
 * une RuntimeException avec un message destiné à l'admin sinon.
 */
function dn_validate_image_upload(array $file, int $maxBytes): string
{
    if (!isset($file['error']) || is_array($file['error'])) {
        throw new RuntimeException('Paramètres d\'upload invalides.');
    }
    if ($file['error'] === UPLOAD_ERR_NO_FILE) {
        throw new RuntimeException('Aucun fichier sélectionné.');
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Échec de l\'upload (code ' . $file['error'] . ').');
    }
    if ($file['size'] <= 0 || $file['size'] > $maxBytes) {
        throw new RuntimeException('Fichier trop volumineux (max ' . round($maxBytes / 1024 / 1024, 1) . ' Mo).');
    }
    if (!is_uploaded_file($file['tmp_name'])) {
        throw new RuntimeException('Upload invalide.');
    }

    $allowedMimes = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/svg+xml' => 'svg',
    ];

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);

    if (!isset($allowedMimes[$mime])) {
        throw new RuntimeException('Type de fichier non autorisé (' . dn_e($mime) . '). Formats acceptés : JPG, PNG, WebP, SVG.');
    }

    // Les SVG peuvent embarquer du JS : on les autorise uniquement s'ils ne
    // contiennent ni <script>, ni gestionnaire d'événements on*=.
    if ($mime === 'image/svg+xml') {
        $contents = file_get_contents($file['tmp_name']);
        if ($contents === false || preg_match('/<script|on\w+\s*=/i', $contents)) {
            throw new RuntimeException('SVG refusé : contenu potentiellement dangereux détecté.');
        }
    } elseif (@getimagesize($file['tmp_name']) === false) {
        throw new RuntimeException('Le fichier n\'est pas une image valide.');
    }

    return $allowedMimes[$mime];
}

/**
 * Déplace un upload validé vers $targetDir avec un nom de fichier unique
 * et sûr (jamais le nom fourni par le client).
 */
function dn_store_upload(array $file, string $extension, string $targetDir): string
{
    if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true) && !is_dir($targetDir)) {
        throw new RuntimeException('Impossible de créer le dossier de destination.');
    }

    $filename = bin2hex(random_bytes(16)) . '.' . $extension;
    $destination = rtrim($targetDir, '/\\') . DIRECTORY_SEPARATOR . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        throw new RuntimeException('Échec de l\'enregistrement du fichier.');
    }

    return $filename;
}
