USE lol_sql_db;

-- 1. Désactivation temporaire des contraintes pour un nettoyage propre
SET FOREIGN_KEY_CHECKS = 0;

-- Nettoyage des tables
DROP TABLE IF EXISTS favoris, invocateurs, utilisateurs, regions, groupes;

-- Nettoyage des vues
DROP VIEW IF EXISTS v_classement_global, v_stats_utilisateurs;

-- Nettoyage des procédures
DROP PROCEDURE IF EXISTS sp_ajouter_favori;
DROP PROCEDURE IF EXISTS sp_update_solo_stats;
DROP PROCEDURE IF EXISTS sp_supprimer_compte;
DROP PROCEDURE IF EXISTS sp_stats_groupes;

-- Nettoyage des triggers
DROP TRIGGER IF EXISTS tg_limite_favoris;
DROP TRIGGER IF EXISTS tg_clean_pseudo;
DROP TRIGGER IF EXISTS tg_clean_pseudo_update;

-- 2. Réactivation des contraintes
SET FOREIGN_KEY_CHECKS = 1;


-- =====================================================================
-- CRÉATION DU SCHÉMA (normalisé 3NF)
-- =====================================================================

CREATE TABLE groupes (
    id_groupe INT AUTO_INCREMENT PRIMARY KEY,
    nom_groupe VARCHAR(50) NOT NULL
);

CREATE TABLE utilisateurs (
    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
    pseudo_site VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    id_groupe INT NOT NULL,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_utilisateurs_groupes
        FOREIGN KEY (id_groupe) REFERENCES groupes(id_groupe)
);

CREATE TABLE regions (
    id_region INT AUTO_INCREMENT PRIMARY KEY,
    nom_region VARCHAR(20) NOT NULL,
    statut VARCHAR(10) DEFAULT 'actif'
);

CREATE TABLE invocateurs (
    puuid VARCHAR(100) PRIMARY KEY,
    game_name VARCHAR(50) NOT NULL,
    tag_line VARCHAR(10) NOT NULL,
    id_region INT NOT NULL,
    niveau INT DEFAULT 1,
    icone_id INT DEFAULT 29,
    solo_rang VARCHAR(20) DEFAULT 'UNRANKED',
    solo_division VARCHAR(5) DEFAULT '',
    solo_lp INT DEFAULT 0,
    flex_rang VARCHAR(20) DEFAULT 'UNRANKED',
    flex_division VARCHAR(5) DEFAULT '',
    flex_lp INT DEFAULT 0,
    CONSTRAINT fk_invocateurs_regions
        FOREIGN KEY (id_region) REFERENCES regions(id_region)
);

CREATE TABLE favoris (
    id_favori INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL,
    invocateur_puuid VARCHAR(100) NOT NULL,
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favoris_utilisateurs
        FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur)
        ON DELETE CASCADE,
    CONSTRAINT fk_favoris_invocateurs
        FOREIGN KEY (invocateur_puuid) REFERENCES invocateurs(puuid)
        ON DELETE CASCADE,
    -- Un utilisateur ne peut pas suivre deux fois le même invocateur
    CONSTRAINT uq_favoris_user_invocateur
        UNIQUE (id_utilisateur, invocateur_puuid)
);

-- =====================================================================
-- INDEX MANUEL (hors clés primaires)
-- Justification : le classement global trie systématiquement sur solo_lp.
-- =====================================================================
CREATE INDEX idx_invocateurs_solo_lp ON invocateurs(solo_lp);


-- =====================================================================
-- JEU DE DONNÉES DE DÉMO (transaction explicite)
-- Comptes de démo — mot de passe en clair : Password123!
-- =====================================================================
START TRANSACTION;

INSERT INTO groupes (nom_groupe) VALUES ('Premium'), ('Standard');

INSERT INTO utilisateurs (pseudo_site, email, mot_de_passe, id_groupe) VALUES
('djow', 'jonathan@ecole.fr', '$2b$10$evwYNaPjvTTtla.Lx2ROvuNIVgFbSxWu9FrgOb8ZW/GteiHoqpTwC', 1),
('nicolas', 'nicolas@ecole.fr', '$2b$10$WJfnCtSQ64MtiIMv/.ra0uK1KsycvgilH/VSfLLUZvvv5X.oBM0gy', 2);

INSERT INTO regions (nom_region, statut) VALUES
('EUW', 'actif'),
('KR', 'actif'),
('NA', 'actif'),
('EUNE', 'actif'),
('JP', 'actif'),
('BR', 'actif'),
('LAN', 'actif');

INSERT INTO invocateurs
(puuid, game_name, tag_line, id_region, niveau, icone_id,
 solo_rang, solo_division, solo_lp, flex_rang, flex_division, flex_lp) VALUES
('puuid_faker', 'Faker', 'KR1', 2, 712, 6000, 'CHALLENGER', 'I', 1650, 'DIAMOND', 'I', 75),
('puuid_caps',  'Caps',  'EUW', 1, 543, 1240, 'GRANDMASTER', 'I', 890, 'UNRANKED', '', 0),
('puuid_chovy', 'Chovy', 'KR1', 2, 684, 4568, 'CHALLENGER', 'I', 1588, 'MASTER', 'I', 241),
('puuid_showmaker', 'ShowMaker', 'KR1', 2, 632, 588, 'CHALLENGER', 'I', 1412, 'DIAMOND', 'II', 62),
('puuid_keria', 'Keria', 'KR1', 2, 701, 4022, 'CHALLENGER', 'I', 1325, 'MASTER', 'I', 117),
('puuid_viper', 'Viper', 'KR1', 2, 599, 5212, 'GRANDMASTER', 'I', 947, 'DIAMOND', 'I', 84),
('puuid_rekkles', 'Rekkles', 'EUW', 1, 611, 3377, 'MASTER', 'I', 512, 'DIAMOND', 'III', 28),
('puuid_jankos', 'Jankos', 'EUW', 1, 578, 1598, 'GRANDMASTER', 'I', 765, 'MASTER', 'I', 103),
('puuid_perkz', 'Perkz', 'EUW', 1, 552, 23, 'MASTER', 'I', 421, 'EMERALD', 'I', 44),
('puuid_hanssama', 'HansSama', 'EUW', 1, 534, 3870, 'CHALLENGER', 'I', 1024, 'DIAMOND', 'I', 91),
('puuid_doublelift', 'Doublelift', 'NA1', 3, 505, 984, 'DIAMOND', 'II', 75, 'EMERALD', 'I', 35),
('puuid_bjergsen', 'Bjergsen', 'NA1', 3, 531, 936, 'MASTER', 'I', 285, 'DIAMOND', 'IV', 12),
('puuid_jojo', 'jojopyun', 'NA1', 3, 489, 5402, 'GRANDMASTER', 'I', 681, 'MASTER', 'I', 64),
('puuid_sniper', 'Sniper', 'NA1', 3, 421, 5430, 'CHALLENGER', 'I', 1102, 'DIAMOND', 'II', 57),
('puuid_inspired', 'Inspired', 'EUNE', 4, 563, 3546, 'GRANDMASTER', 'I', 832, 'MASTER', 'I', 141),
('puuid_jankos_eune', 'JankosEUNE', 'EUNE', 4, 472, 1630, 'MASTER', 'I', 377, 'DIAMOND', 'I', 73),
('puuid_evi', 'Evi', 'JP1', 5, 496, 29, 'CHALLENGER', 'I', 908, 'MASTER', 'I', 49),
('puuid_yutapon', 'Yutapon', 'JP1', 5, 438, 4025, 'MASTER', 'I', 318, 'EMERALD', 'II', 18),
('puuid_robo', 'Robo', 'BR1', 6, 522, 4534, 'GRANDMASTER', 'I', 714, 'DIAMOND', 'I', 81),
('puuid_titan', 'TitaN', 'BR1', 6, 477, 539, 'CHALLENGER', 'I', 988, 'MASTER', 'I', 93),
('puuid_seiya', 'Seiya', 'LAN', 7, 501, 1374, 'MASTER', 'I', 462, 'DIAMOND', 'II', 25),
('puuid_oddie', 'Oddie', 'LAN', 7, 455, 3159, 'DIAMOND', 'I', 96, 'EMERALD', 'I', 41),
('puuid_demo_ahri', 'AhriEnjoyer', 'EUW', 1, 243, 28, 'PLATINUM', 'II', 42, 'GOLD', 'I', 19),
('puuid_demo_yasuo', 'YasuoMain99', 'EUW', 1, 198, 17, 'GOLD', 'I', 18, 'SILVER', 'I', 5),
('puuid_demo_lux', 'LuxSupport', 'NA1', 3, 276, 7, 'EMERALD', 'IV', 9, 'PLATINUM', 'III', 33),
('puuid_demo_jinx', 'JinxCarry', 'EUW', 1, 321, 22, 'DIAMOND', 'IV', 51, 'PLATINUM', 'I', 45);

INSERT INTO favoris (id_utilisateur, invocateur_puuid) VALUES
(1, 'puuid_faker'),
(1, 'puuid_caps'),
(1, 'puuid_chovy'),
(1, 'puuid_hanssama'),
(1, 'puuid_titan'),
(2, 'puuid_rekkles'),
(2, 'puuid_jankos'),
(2, 'puuid_bjergsen'),
(2, 'puuid_evi');

COMMIT;


-- =====================================================================
-- VUES
-- =====================================================================

-- Classement global des invocateurs, trié par LP (exploite l'index)
CREATE VIEW v_classement_global AS
SELECT i.puuid, i.game_name, i.tag_line, r.nom_region,
       i.solo_rang, i.solo_division, i.solo_lp, i.icone_id
FROM invocateurs i
INNER JOIN regions r ON i.id_region = r.id_region
ORDER BY i.solo_lp DESC;

-- Statistiques par utilisateur (nombre de favoris suivis)
CREATE VIEW v_stats_utilisateurs AS
SELECT u.id_utilisateur, u.pseudo_site, COUNT(f.id_favori) AS total_favoris
FROM utilisateurs u
LEFT JOIN favoris f ON u.id_utilisateur = f.id_utilisateur
GROUP BY u.id_utilisateur, u.pseudo_site;


-- =====================================================================
-- TRIGGERS
-- =====================================================================
DELIMITER //

-- Limite stricte : 10 favoris maximum par utilisateur
CREATE TRIGGER tg_limite_favoris
BEFORE INSERT ON favoris
FOR EACH ROW
BEGIN
    DECLARE total INT;
    SELECT COUNT(*) INTO total
    FROM favoris
    WHERE id_utilisateur = NEW.id_utilisateur;
    IF total >= 10 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Max 10 favoris !';
    END IF;
END //

-- Normalisation du pseudo en minuscules à l'inscription
CREATE TRIGGER tg_clean_pseudo
BEFORE INSERT ON utilisateurs
FOR EACH ROW
BEGIN
    SET NEW.pseudo_site = LOWER(NEW.pseudo_site);
END //

-- Même normalisation lors d'une modification du pseudo
-- (sans ce trigger, un UPDATE contournerait la règle)
CREATE TRIGGER tg_clean_pseudo_update
BEFORE UPDATE ON utilisateurs
FOR EACH ROW
BEGIN
    SET NEW.pseudo_site = LOWER(NEW.pseudo_site);
END //

DELIMITER ;


-- =====================================================================
-- PROCÉDURES STOCKÉES
-- =====================================================================
DELIMITER //

-- Ajout d'un favori (déclenche tg_limite_favoris + contrainte UNIQUE)
CREATE PROCEDURE sp_ajouter_favori(
    IN p_user INT,
    IN p_puuid VARCHAR(100)
)
BEGIN
    INSERT INTO favoris (id_utilisateur, invocateur_puuid)
    VALUES (p_user, p_puuid);

    SELECT f.id_favori, f.id_utilisateur, f.invocateur_puuid, f.date_ajout
    FROM favoris f
    WHERE f.id_favori = LAST_INSERT_ID();
END //

-- Mise à jour des statistiques SoloQ d'un invocateur
CREATE PROCEDURE sp_update_solo_stats(
    IN p_puuid VARCHAR(100),
    IN p_lp INT,
    IN p_rang VARCHAR(20)
)
BEGIN
    UPDATE invocateurs
    SET solo_lp = p_lp, solo_rang = p_rang
    WHERE puuid = p_puuid;

    SELECT ROW_COUNT() AS lignes_modifiees;
END //

-- Suppression d'un compte : transaction explicite avec gestion d'erreur.
-- En cas d'échec à n'importe quelle étape, tout est annulé (ROLLBACK).
CREATE PROCEDURE sp_supprimer_compte(
    IN p_user INT
)
BEGIN
    DECLARE v_supprimes INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    DELETE FROM favoris WHERE id_utilisateur = p_user;
    DELETE FROM utilisateurs WHERE id_utilisateur = p_user;
    SET v_supprimes = ROW_COUNT();

    COMMIT;

    SELECT v_supprimes AS utilisateurs_supprimes;
END //

-- Requête métier complexe : statistiques des favoris par groupe et
-- utilisateur, comparées à la moyenne de LP de chaque région.
-- Contient : 1 CTE, 5 jointures, 2 agrégations (COUNT + AVG),
-- GROUP BY + HAVING.
CREATE PROCEDURE sp_stats_groupes()
BEGIN
    WITH lp_moyen_par_region AS (
        SELECT id_region, AVG(solo_lp) AS lp_moyen_region
        FROM invocateurs
        GROUP BY id_region
    )
    SELECT
        g.nom_groupe,
        u.pseudo_site,
        COUNT(f.id_favori)            AS nb_favoris,
        AVG(i.solo_lp)                AS lp_moyen_favoris,
        AVG(lmr.lp_moyen_region)      AS lp_moyen_regions_suivies
    FROM utilisateurs u
    INNER JOIN groupes g            ON g.id_groupe = u.id_groupe
    INNER JOIN favoris f            ON f.id_utilisateur = u.id_utilisateur
    INNER JOIN invocateurs i        ON i.puuid = f.invocateur_puuid
    INNER JOIN regions r            ON r.id_region = i.id_region
    INNER JOIN lp_moyen_par_region lmr ON lmr.id_region = i.id_region
    GROUP BY g.nom_groupe, u.pseudo_site
    HAVING COUNT(f.id_favori) >= 1
    ORDER BY lp_moyen_favoris DESC;
END //

DELIMITER ;
