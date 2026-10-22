<?php
/**
 * Crée le premier compte administrateur. À exécuter UNE FOIS en ligne de
 * commande sur le serveur (jamais accessible via le navigateur) :
 *
 *   php create-admin.php "admin@digitalnumerique.ga" "MotDePasseSolide123!" "Glenn Browny"
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Ce script ne peut être exécuté qu\'en ligne de commande.');
}

require_once __DIR__ . '/../admin/includes/db.php';

[$script, $email, $password, $name] = array_pad($argv, 4, null);

if (!$email || !$password || !$name) {
    fwrite(STDERR, "Usage: php create-admin.php <email> <mot_de_passe> <nom_affiche>\n");
    exit(1);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Email invalide.\n");
    exit(1);
}
if (strlen($password) < 10) {
    fwrite(STDERR, "Le mot de passe doit faire au moins 10 caractères.\n");
    exit(1);
}

$hash = password_hash($password, PASSWORD_BCRYPT);

$pdo = dn_db();
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email');
$stmt->execute(['email' => $email]);

if ($stmt->fetch()) {
    fwrite(STDERR, "Un compte existe déjà avec cet email.\n");
    exit(1);
}

$stmt = $pdo->prepare('INSERT INTO users (email, password_hash, display_name) VALUES (:email, :hash, :name)');
$stmt->execute(['email' => $email, 'hash' => $hash, 'name' => $name]);

echo "Compte administrateur créé avec succès (id " . $pdo->lastInsertId() . ").\n";
