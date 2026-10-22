<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/csrf.php';
require_once __DIR__ . '/includes/functions.php';

dn_require_login();

$pdo = dn_db();
$flash = '';
$flashType = 'success';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    dn_csrf_verify();
    $action = $_POST['action'] ?? '';

    try {
        if ($action === 'add') {
            $extension = dn_validate_image_upload($_FILES['photo'] ?? [], DN_MAX_PHOTO_BYTES);
            $filename = dn_store_upload($_FILES['photo'], $extension, DN_UPLOAD_DIR_PHOTOS);

            $stmt = $pdo->prepare(
                'INSERT INTO gallery_photos (file_path, title, description, category, uploaded_by)
                 VALUES (:path, :title, :description, :category, :uploaded_by)'
            );
            $stmt->execute([
                'path' => DN_UPLOAD_URL_PHOTOS . $filename,
                'title' => trim($_POST['title'] ?? '') ?: null,
                'description' => trim($_POST['description'] ?? '') ?: null,
                'category' => in_array($_POST['category'] ?? 'photo', ['photo', 'graphisme', 'web'], true) ? $_POST['category'] : 'photo',
                'uploaded_by' => dn_current_user_id(),
            ]);
            dn_log_action(dn_current_user_id(), 'photo.add', 'Ajout photo #' . $pdo->lastInsertId());
            $flash = 'Photo ajoutée à la galerie.';
        } elseif ($action === 'replace') {
            $id = (int) ($_POST['id'] ?? 0);
            $extension = dn_validate_image_upload($_FILES['photo'] ?? [], DN_MAX_PHOTO_BYTES);
            $filename = dn_store_upload($_FILES['photo'], $extension, DN_UPLOAD_DIR_PHOTOS);

            $stmt = $pdo->prepare('UPDATE gallery_photos SET file_path = :path WHERE id = :id');
            $stmt->execute(['path' => DN_UPLOAD_URL_PHOTOS . $filename, 'id' => $id]);
            dn_log_action(dn_current_user_id(), 'photo.replace', 'Remplacement photo #' . $id);
            $flash = 'Photo remplacée.';
        } elseif ($action === 'delete') {
            $id = (int) ($_POST['id'] ?? 0);
            $stmt = $pdo->prepare('DELETE FROM gallery_photos WHERE id = :id');
            $stmt->execute(['id' => $id]);
            dn_log_action(dn_current_user_id(), 'photo.delete', 'Suppression photo #' . $id);
            $flash = 'Photo supprimée.';
        } elseif ($action === 'toggle') {
            $id = (int) ($_POST['id'] ?? 0);
            $stmt = $pdo->prepare('UPDATE gallery_photos SET is_active = NOT is_active WHERE id = :id');
            $stmt->execute(['id' => $id]);
            dn_log_action(dn_current_user_id(), 'photo.toggle', 'Bascule visibilité photo #' . $id);
            $flash = 'Visibilité mise à jour.';
        }
    } catch (RuntimeException $e) {
        $flash = $e->getMessage();
        $flashType = 'error';
    }
}

$photos = $pdo->query('SELECT * FROM gallery_photos ORDER BY upload_date DESC')->fetchAll();

$pageTitle = 'Photos';
$activeTab = 'photos';
require __DIR__ . '/includes/layout-header.php';
?>

<h1>Galerie photo</h1>

<?php if ($flash): ?>
  <div class="flash <?= $flashType ?>"><?= dn_e($flash) ?></div>
<?php endif; ?>

<div class="card">
  <h2>Ajouter une photo</h2>
  <form method="post" enctype="multipart/form-data">
    <?= dn_csrf_field() ?>
    <input type="hidden" name="action" value="add">
    <label for="photo">Fichier image (JPG, PNG, WebP — max 8 Mo)</label>
    <input type="file" id="photo" name="photo" accept="image/png,image/jpeg,image/webp" required>
    <label for="title">Titre</label>
    <input type="text" id="title" name="title" maxlength="100">
    <label for="description">Description</label>
    <textarea id="description" name="description" maxlength="500"></textarea>
    <label for="category">Catégorie (filtre de la galerie)</label>
    <select id="category" name="category">
      <option value="photo">Photographie</option>
      <option value="graphisme">Graphisme</option>
      <option value="web">Développement web</option>
    </select>
    <button type="submit" style="margin-top:14px;">Ajouter à la galerie</button>
  </form>
</div>

<div class="card">
  <h2>Photos existantes (<?= count($photos) ?>)</h2>
  <table>
    <thead>
      <tr><th></th><th>Titre</th><th>Catégorie</th><th>Date</th><th>Statut</th><th>Actions</th></tr>
    </thead>
    <tbody>
      <?php foreach ($photos as $photo): ?>
      <tr>
        <td><img class="thumb" src="<?= dn_e($photo['file_path']) ?>" alt=""></td>
        <td><?= dn_e($photo['title'] ?: '—') ?></td>
        <td><?= dn_e($photo['category']) ?></td>
        <td><?= dn_e(date('d/m/Y', strtotime($photo['upload_date']))) ?></td>
        <td><span class="badge <?= $photo['is_active'] ? 'active' : 'inactive' ?>"><?= $photo['is_active'] ? 'Active' : 'Masquée' ?></span></td>
        <td class="row-actions">
          <form method="post" enctype="multipart/form-data" style="display:flex; gap:4px; align-items:center;">
            <?= dn_csrf_field() ?>
            <input type="hidden" name="action" value="replace">
            <input type="hidden" name="id" value="<?= (int) $photo['id'] ?>">
            <input type="file" name="photo" accept="image/png,image/jpeg,image/webp" style="max-width:140px;" required>
            <button type="submit" class="secondary">Remplacer</button>
          </form>
          <form method="post">
            <?= dn_csrf_field() ?>
            <input type="hidden" name="action" value="toggle">
            <input type="hidden" name="id" value="<?= (int) $photo['id'] ?>">
            <button type="submit" class="secondary"><?= $photo['is_active'] ? 'Masquer' : 'Activer' ?></button>
          </form>
          <form method="post" onsubmit="return confirm('Supprimer définitivement cette photo ?');">
            <?= dn_csrf_field() ?>
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="id" value="<?= (int) $photo['id'] ?>">
            <button type="submit" class="danger">Supprimer</button>
          </form>
        </td>
      </tr>
      <?php endforeach; ?>
      <?php if (!$photos): ?>
        <tr><td colspan="6" class="hint">Aucune photo pour le moment.</td></tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>

<?php require __DIR__ . '/includes/layout-footer.php'; ?>
