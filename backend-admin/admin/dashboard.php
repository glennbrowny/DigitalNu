<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

dn_require_login();

$pdo = dn_db();
$photoCount = (int) $pdo->query('SELECT COUNT(*) FROM gallery_photos WHERE is_active = TRUE')->fetchColumn();
$activeGreeting = $pdo->query(
    "SELECT event_name, greeting_message FROM event_greetings
     WHERE is_active = TRUE AND display_start <= CURDATE() AND display_end >= CURDATE()
     ORDER BY created_at DESC LIMIT 1"
)->fetch();
$settings = $pdo->query('SELECT logo_path, site_title FROM site_settings WHERE id = 1')->fetch();

$pageTitle = 'Tableau de bord';
$activeTab = 'dashboard';
require __DIR__ . '/includes/layout-header.php';
?>

<h1>Bonjour, <?= dn_e($_SESSION['dn_user_name'] ?? 'admin') ?> 👋</h1>

<div class="card">
  <h2>Aperçu</h2>
  <table>
    <tr>
      <td>Photos actives dans la galerie</td>
      <td><strong><?= (int) $photoCount ?></strong></td>
      <td><a class="btn secondary" href="/admin/manage-photos.php">Gérer</a></td>
    </tr>
    <tr>
      <td>Logo actuel</td>
      <td><?= $settings && $settings['logo_path'] ? dn_e($settings['logo_path']) : '<em>par défaut</em>' ?></td>
      <td><a class="btn secondary" href="/admin/upload-logo.php">Gérer</a></td>
    </tr>
    <tr>
      <td>Message d'événement actif</td>
      <td><?= $activeGreeting ? dn_e($activeGreeting['event_name']) . ' — ' . dn_e($activeGreeting['greeting_message']) : '<em>aucun</em>' ?></td>
      <td><a class="btn secondary" href="/admin/manage-greetings.php">Gérer</a></td>
    </tr>
  </table>
</div>
<?php require __DIR__ . '/includes/layout-footer.php'; ?>
