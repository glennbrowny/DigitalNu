<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/csrf.php';
require_once __DIR__ . '/includes/functions.php';

dn_require_login();

$pdo = dn_db();
$flash = '';
$flashType = 'success';
$THEMES = ['default' => 'Générique', 'noel' => 'Noël', 'ramadan' => 'Ramadan', 'nouvel-an' => 'Nouvel An', 'paques' => 'Pâques'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    dn_csrf_verify();
    $action = $_POST['action'] ?? '';

    try {
        if ($action === 'create' || $action === 'update') {
            $eventName = trim($_POST['event_name'] ?? '');
            $message = trim($_POST['greeting_message'] ?? '');
            $theme = array_key_exists($_POST['theme'] ?? '', $THEMES) ? $_POST['theme'] : 'default';
            $start = $_POST['display_start'] ?? '';
            $end = $_POST['display_end'] ?? '';
            $isActive = isset($_POST['is_active']) ? 1 : 0;

            if ($eventName === '' || $message === '' || mb_strlen($message) > 200 || !$start || !$end) {
                throw new RuntimeException('Merci de renseigner un nom d\'événement, un message (200 caractères max) et des dates valides.');
            }
            if (strtotime($start) === false || strtotime($end) === false || $start > $end) {
                throw new RuntimeException('La date de fin doit être postérieure à la date de début.');
            }

            if ($action === 'create') {
                $stmt = $pdo->prepare(
                    'INSERT INTO event_greetings (event_name, greeting_message, theme, display_start, display_end, is_active, created_by)
                     VALUES (:event_name, :message, :theme, :start, :end, :is_active, :created_by)'
                );
                $stmt->execute([
                    'event_name' => $eventName, 'message' => $message, 'theme' => $theme,
                    'start' => $start, 'end' => $end, 'is_active' => $isActive, 'created_by' => dn_current_user_id(),
                ]);
                dn_log_action(dn_current_user_id(), 'greeting.create', $eventName);
                $flash = 'Message d\'événement créé.';
            } else {
                $id = (int) ($_POST['id'] ?? 0);
                $stmt = $pdo->prepare(
                    'UPDATE event_greetings SET event_name = :event_name, greeting_message = :message, theme = :theme,
                     display_start = :start, display_end = :end, is_active = :is_active WHERE id = :id'
                );
                $stmt->execute([
                    'event_name' => $eventName, 'message' => $message, 'theme' => $theme,
                    'start' => $start, 'end' => $end, 'is_active' => $isActive, 'id' => $id,
                ]);
                dn_log_action(dn_current_user_id(), 'greeting.update', 'ID ' . $id);
                $flash = 'Message d\'événement mis à jour.';
            }
        } elseif ($action === 'toggle') {
            $id = (int) ($_POST['id'] ?? 0);
            $pdo->prepare('UPDATE event_greetings SET is_active = NOT is_active WHERE id = :id')->execute(['id' => $id]);
            dn_log_action(dn_current_user_id(), 'greeting.toggle', 'ID ' . $id);
            $flash = 'Statut mis à jour.';
        } elseif ($action === 'delete') {
            $id = (int) ($_POST['id'] ?? 0);
            $pdo->prepare('DELETE FROM event_greetings WHERE id = :id')->execute(['id' => $id]);
            dn_log_action(dn_current_user_id(), 'greeting.delete', 'ID ' . $id);
            $flash = 'Message supprimé.';
        }
    } catch (RuntimeException $e) {
        $flash = $e->getMessage();
        $flashType = 'error';
    }
}

$greetings = $pdo->query('SELECT * FROM event_greetings ORDER BY display_start DESC')->fetchAll();
$editId = isset($_GET['edit']) ? (int) $_GET['edit'] : null;
$editing = null;
if ($editId) {
    $stmt = $pdo->prepare('SELECT * FROM event_greetings WHERE id = :id');
    $stmt->execute(['id' => $editId]);
    $editing = $stmt->fetch() ?: null;
}

$pageTitle = 'Messages d\'événements';
$activeTab = 'greetings';
require __DIR__ . '/includes/layout-header.php';
?>

<h1>Messages d'événements</h1>

<?php if ($flash): ?>
  <div class="flash <?= $flashType ?>"><?= dn_e($flash) ?></div>
<?php endif; ?>

<div class="card">
  <h2><?= $editing ? 'Modifier le message' : 'Créer un nouveau message' ?></h2>
  <form method="post">
    <?= dn_csrf_field() ?>
    <input type="hidden" name="action" value="<?= $editing ? 'update' : 'create' ?>">
    <?php if ($editing): ?><input type="hidden" name="id" value="<?= (int) $editing['id'] ?>"><?php endif; ?>

    <label for="event_name">Nom de l'événement</label>
    <input type="text" id="event_name" name="event_name" maxlength="100" required value="<?= dn_e($editing['event_name'] ?? '') ?>">

    <label for="greeting_message">Message de souhait (200 caractères max)</label>
    <textarea id="greeting_message" name="greeting_message" maxlength="200" required><?= dn_e($editing['greeting_message'] ?? '') ?></textarea>

    <label for="theme">Thème (couleurs de la bannière)</label>
    <select id="theme" name="theme">
      <?php foreach ($THEMES as $key => $label): ?>
        <option value="<?= dn_e($key) ?>" <?= (($editing['theme'] ?? 'default') === $key) ? 'selected' : '' ?>><?= dn_e($label) ?></option>
      <?php endforeach; ?>
    </select>

    <div style="display:flex; gap:16px; flex-wrap:wrap;">
      <div style="flex:1; min-width:160px;">
        <label for="display_start">Date de début</label>
        <input type="date" id="display_start" name="display_start" required value="<?= dn_e($editing['display_start'] ?? '') ?>">
      </div>
      <div style="flex:1; min-width:160px;">
        <label for="display_end">Date de fin</label>
        <input type="date" id="display_end" name="display_end" required value="<?= dn_e($editing['display_end'] ?? '') ?>">
      </div>
    </div>

    <label style="display:flex; align-items:center; gap:8px; margin-top:14px;">
      <input type="checkbox" name="is_active" style="width:auto;" <?= (!isset($editing) || !empty($editing['is_active'])) ? 'checked' : '' ?>>
      Actif
    </label>

    <button type="submit" style="margin-top:14px;"><?= $editing ? 'Enregistrer les modifications' : 'Créer le message' ?></button>
    <?php if ($editing): ?><a class="btn secondary" href="/admin/manage-greetings.php" style="margin-left:8px;">Annuler</a><?php endif; ?>
  </form>
</div>

<div class="card">
  <h2>Messages existants (<?= count($greetings) ?>)</h2>
  <table>
    <thead><tr><th>Événement</th><th>Message</th><th>Période</th><th>Statut</th><th>Actions</th></tr></thead>
    <tbody>
      <?php foreach ($greetings as $g): ?>
      <tr>
        <td><?= dn_e($g['event_name']) ?></td>
        <td><?= dn_e($g['greeting_message']) ?></td>
        <td><?= dn_e(date('d/m/Y', strtotime($g['display_start']))) ?> → <?= dn_e(date('d/m/Y', strtotime($g['display_end']))) ?></td>
        <td><span class="badge <?= $g['is_active'] ? 'active' : 'inactive' ?>"><?= $g['is_active'] ? 'Actif' : 'Inactif' ?></span></td>
        <td class="row-actions">
          <a class="btn secondary" href="/admin/manage-greetings.php?edit=<?= (int) $g['id'] ?>">Modifier</a>
          <form method="post">
            <?= dn_csrf_field() ?>
            <input type="hidden" name="action" value="toggle">
            <input type="hidden" name="id" value="<?= (int) $g['id'] ?>">
            <button type="submit" class="secondary"><?= $g['is_active'] ? 'Désactiver' : 'Activer' ?></button>
          </form>
          <form method="post" onsubmit="return confirm('Supprimer définitivement ce message ?');">
            <?= dn_csrf_field() ?>
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="id" value="<?= (int) $g['id'] ?>">
            <button type="submit" class="danger">Supprimer</button>
          </form>
        </td>
      </tr>
      <?php endforeach; ?>
      <?php if (!$greetings): ?>
        <tr><td colspan="5" class="hint">Aucun message pour le moment.</td></tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>

<?php require __DIR__ . '/includes/layout-footer.php'; ?>
