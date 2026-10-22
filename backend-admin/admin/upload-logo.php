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

    try {
        $extension = dn_validate_image_upload($_FILES['logo'] ?? [], DN_MAX_LOGO_BYTES);
        $filename = dn_store_upload($_FILES['logo'], $extension, DN_UPLOAD_DIR_LOGO);
        $publicPath = DN_UPLOAD_URL_LOGO . $filename;

        $pdo->prepare('UPDATE site_settings SET logo_path = :path WHERE id = 1')->execute(['path' => $publicPath]);
        dn_log_action(dn_current_user_id(), 'logo.update', 'Nouveau logo : ' . $publicPath);

        $flash = 'Logo mis à jour avec succès. Il sera repris automatiquement sur toutes les pages du site public.';
    } catch (RuntimeException $e) {
        $flash = $e->getMessage();
        $flashType = 'error';
    }
}

$settings = $pdo->query('SELECT logo_path FROM site_settings WHERE id = 1')->fetch();

$pageTitle = 'Logo';
$activeTab = 'logo';
require __DIR__ . '/includes/layout-header.php';
?>

<h1>Logo du site</h1>

<?php if ($flash): ?>
  <div class="flash <?= $flashType ?>"><?= dn_e($flash) ?></div>
<?php endif; ?>

<div class="card">
  <h2>Logo actuel</h2>
  <?php if (!empty($settings['logo_path'])): ?>
    <img src="<?= dn_e($settings['logo_path']) ?>" alt="Logo actuel" style="max-width:180px; border-radius:10px; border:1px solid #eee;">
  <?php else: ?>
    <p class="hint">Aucun logo personnalisé n'a encore été mis en ligne — le site public utilise son logo par défaut.</p>
  <?php endif; ?>
</div>

<div class="card">
  <h2>Changer le logo</h2>
  <form method="post" enctype="multipart/form-data">
    <?= dn_csrf_field() ?>
    <label for="logo">Nouveau fichier (PNG, JPG, WebP ou SVG — max 2 Mo)</label>
    <input type="file" id="logo" name="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml" required>
    <p class="hint">L'ancien logo n'est pas écrasé : chaque upload crée un nouveau fichier, seule la référence active change.</p>
    <button type="submit" style="margin-top:14px;">Mettre à jour le logo</button>
  </form>
</div>

<?php require __DIR__ . '/includes/layout-footer.php'; ?>
