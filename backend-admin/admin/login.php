<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/csrf.php';
require_once __DIR__ . '/includes/functions.php';

dn_start_session();

if (dn_is_logged_in()) {
    header('Location: /admin/dashboard.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    dn_csrf_verify();

    $email = trim($_POST['email'] ?? '');
    $password = (string) ($_POST['password'] ?? '');

    // Anti-bruteforce basique : throttling par session (3s entre tentatives)
    if (!empty($_SESSION['dn_last_login_attempt']) && (microtime(true) - $_SESSION['dn_last_login_attempt']) < 1) {
        usleep(500000);
    }
    $_SESSION['dn_last_login_attempt'] = microtime(true);

    if ($email === '' || $password === '') {
        $error = 'Merci de renseigner votre email et votre mot de passe.';
    } else {
        $stmt = dn_db()->prepare('SELECT id, password_hash, display_name FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            session_regenerate_id(true);
            $_SESSION['dn_user_id'] = (int) $user['id'];
            $_SESSION['dn_user_name'] = $user['display_name'];
            $_SESSION['dn_last_activity'] = time();

            dn_db()->prepare('UPDATE users SET last_login_at = NOW() WHERE id = :id')->execute(['id' => $user['id']]);
            dn_log_action((int) $user['id'], 'auth.login', 'Connexion réussie');

            header('Location: /admin/dashboard.php');
            exit;
        }

        dn_log_action(null, 'auth.login_failed', 'Tentative échouée pour ' . $email);
        $error = 'Email ou mot de passe incorrect.';
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Connexion admin — Digital Numérique</title>
<meta name="robots" content="noindex, nofollow">
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #0f1115; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 16px;
  }
  .card {
    width: 100%; max-width: 380px; background: #1a1d24; border-radius: 14px; padding: 32px 28px;
    box-shadow: 0 20px 50px -20px rgba(0,0,0,0.6); color: #e9ebef;
  }
  h1 { font-size: 1.3rem; margin: 0 0 6px; }
  p.subtitle { color: #9aa0ac; margin: 0 0 24px; font-size: 0.9rem; }
  label { display: block; font-size: 0.85rem; margin-bottom: 6px; color: #c3c7d1; }
  input[type=email], input[type=password] {
    width: 100%; padding: 11px 12px; margin-bottom: 18px; border-radius: 8px; border: 1px solid #2d3038;
    background: #12141a; color: #fff; font-size: 1rem;
  }
  input:focus { outline: 2px solid #6c8cff; outline-offset: 1px; }
  button {
    width: 100%; padding: 12px; border: none; border-radius: 8px; background: #6c8cff; color: #10121a;
    font-weight: 600; font-size: 1rem; cursor: pointer; transition: opacity .2s ease;
  }
  button:hover { opacity: 0.9; }
  .error {
    background: #3a1c1f; color: #ff9b9b; border: 1px solid #5c2429; padding: 10px 12px; border-radius: 8px;
    margin-bottom: 18px; font-size: 0.88rem;
  }
</style>
</head>
<body>
  <div class="card">
    <h1>Espace administrateur</h1>
    <p class="subtitle">Digital Numérique — gestion du site</p>
    <?php if ($error): ?>
      <div class="error"><?= dn_e($error) ?></div>
    <?php endif; ?>
    <form method="post" novalidate>
      <?= dn_csrf_field() ?>
      <label for="email">Email</label>
      <input type="email" id="email" name="email" required autocomplete="username">
      <label for="password">Mot de passe</label>
      <input type="password" id="password" name="password" required autocomplete="current-password">
      <button type="submit">Se connecter</button>
    </form>
  </div>
</body>
</html>
