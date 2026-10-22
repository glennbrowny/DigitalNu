<?php
/**
 * @var string $pageTitle défini par la page appelante avant l'include
 */
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= dn_e($pageTitle ?? 'Admin') ?> — Digital Numérique</title>
<meta name="robots" content="noindex, nofollow">
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: #f4f5f8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1c1e24;
  }
  header.topbar {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    background: #14161c; color: #fff; padding: 14px 20px; flex-wrap: wrap;
  }
  header.topbar .brand { font-weight: 700; font-size: 1.05rem; }
  nav.tabs { display: flex; gap: 6px; flex-wrap: wrap; }
  nav.tabs a {
    color: #cfd3dc; text-decoration: none; padding: 8px 12px; border-radius: 7px; font-size: 0.9rem;
    transition: background .2s ease, color .2s ease;
  }
  nav.tabs a:hover, nav.tabs a.active { background: #2a2d36; color: #fff; }
  .logout-link { color: #ff9b9b; text-decoration: none; font-size: 0.85rem; }
  main { max-width: 1000px; margin: 0 auto; padding: 24px 16px 60px; }
  .card { background: #fff; border-radius: 12px; padding: 22px; margin-bottom: 20px; box-shadow: 0 2px 10px -4px rgba(0,0,0,0.08); }
  h1 { font-size: 1.4rem; margin: 0 0 18px; }
  h2 { font-size: 1.1rem; margin: 0 0 14px; }
  label { display: block; font-size: 0.85rem; margin: 12px 0 6px; color: #444; }
  input[type=text], input[type=email], input[type=password], input[type=date], input[type=file], textarea, select {
    width: 100%; padding: 9px 10px; border-radius: 7px; border: 1px solid #d7dae0; font-size: 0.95rem; font-family: inherit;
  }
  textarea { resize: vertical; min-height: 70px; }
  button, .btn {
    display: inline-block; padding: 9px 16px; border: none; border-radius: 7px; background: #3b5bfd; color: #fff;
    font-weight: 600; font-size: 0.9rem; cursor: pointer; text-decoration: none; transition: opacity .2s ease;
  }
  button.secondary, .btn.secondary { background: #eceef3; color: #24262d; }
  button.danger, .btn.danger { background: #e0384a; }
  button:hover, .btn:hover { opacity: 0.88; }
  .flash { padding: 10px 14px; border-radius: 8px; margin-bottom: 18px; font-size: 0.9rem; }
  .flash.success { background: #e4f7ea; color: #1c7a3b; border: 1px solid #b6e6c3; }
  .flash.error { background: #fbe6e6; color: #a3222d; border: 1px solid #f1b8ba; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th, td { text-align: left; padding: 9px 8px; border-bottom: 1px solid #eceef2; vertical-align: middle; }
  .thumb { width: 64px; height: 64px; object-fit: cover; border-radius: 6px; display: block; }
  .badge { display: inline-block; padding: 2px 9px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
  .badge.active { background: #e4f7ea; color: #1c7a3b; }
  .badge.inactive { background: #eceef3; color: #666; }
  .row-actions { display: flex; gap: 6px; flex-wrap: wrap; }
  .row-actions form { display: inline; }
  .hint { color: #6b7280; font-size: 0.8rem; margin-top: 4px; }
</style>
</head>
<body>
<header class="topbar">
  <div class="brand">Digital Numérique — Admin</div>
  <nav class="tabs">
    <a href="/admin/dashboard.php"<?= ($activeTab ?? '') === 'dashboard' ? ' class="active"' : '' ?>>Tableau de bord</a>
    <a href="/admin/upload-logo.php"<?= ($activeTab ?? '') === 'logo' ? ' class="active"' : '' ?>>Logo</a>
    <a href="/admin/manage-photos.php"<?= ($activeTab ?? '') === 'photos' ? ' class="active"' : '' ?>>Photos</a>
    <a href="/admin/manage-greetings.php"<?= ($activeTab ?? '') === 'greetings' ? ' class="active"' : '' ?>>Messages d'événements</a>
  </nav>
  <a href="/admin/logout.php" class="logout-link">Déconnexion</a>
</header>
<main>
