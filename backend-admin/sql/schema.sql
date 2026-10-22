-- ============================================================
-- Digital Numérique — schéma MySQL du panneau d'administration
-- À importer sur l'hébergement PHP/MySQL qui fera tourner /admin
-- et /api (voir backend-admin/INSTALL.md pour la procédure).
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------------
-- Comptes administrateurs
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------
-- Logo, titre du site, favicon
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    logo_path VARCHAR(255) NOT NULL,
    site_title VARCHAR(100),
    favicon_path VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ligne unique de configuration (l'app ne lit/écrit toujours que id = 1)
INSERT INTO site_settings (id, logo_path, site_title, favicon_path)
VALUES (1, '', 'Digital Numérique', '')
ON DUPLICATE KEY UPDATE id = id;

-- --------------------------------------------------------------
-- Photos de la galerie
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_path VARCHAR(255) NOT NULL,
    title VARCHAR(100),
    description TEXT,
    category VARCHAR(50) DEFAULT 'photo', -- photo | graphisme | web (filtres de la galerie)
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    uploaded_by INT,
    CONSTRAINT fk_gallery_photos_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------
-- Messages d'événements (bannière de la page d'accueil)
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_greetings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,       -- ex: "Noël", "Ramadan"
    greeting_message VARCHAR(200) NOT NULL, -- ex: "Joyeux Noël à tous !"
    theme VARCHAR(30) DEFAULT 'default',    -- default | noel | ramadan | nouvel-an (choix des couleurs)
    display_start DATE NOT NULL,
    display_end DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    CONSTRAINT fk_event_greetings_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------
-- Journal des actions admin (upload, suppression, connexion...)
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS action_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,   -- ex: 'logo.update', 'photo.delete', 'auth.login'
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_action_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
