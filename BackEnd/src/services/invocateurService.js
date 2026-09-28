const db = require('../config/db');

// Colonnes de tri autorisées (liste blanche : évite l'injection SQL via le
// paramètre `sort`, qui ne peut pas passer en placeholder)
const TRIS_AUTORISES = {
    lp: 'solo_lp',
    niveau: 'niveau',
    nom: 'game_name'
};

// Classement, avec pagination, tri et filtre optionnel par région
const getClassement = async ({ page = 1, limit = 10, sort = 'lp', order = 'desc', region } = {}) => {
    const offset = (page - 1) * limit;
    const colonne = TRIS_AUTORISES[sort] || 'solo_lp';
    const sens = order === 'asc' ? 'ASC' : 'DESC';

    // Filtre région : on travaille sur la table pour pouvoir filtrer par nom_region
    const params = [];
    let where = '';
    if (region) {
        where = 'WHERE r.nom_region = ?';
        params.push(region);
    }

    const [rows] = await db.query(
        `SELECT i.puuid, i.game_name, i.tag_line, r.nom_region,
                i.solo_rang, i.solo_division, i.solo_lp, i.icone_id, i.niveau
         FROM invocateurs i
         INNER JOIN regions r ON i.id_region = r.id_region
         ${where}
         ORDER BY ${colonne} ${sens}
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    );

    const [[{ total }]] = await db.query(
        `SELECT COUNT(*) AS total
         FROM invocateurs i
         INNER JOIN regions r ON i.id_region = r.id_region
         ${where}`,
        params
    );

    return { invocateurs: rows, page, limit, total };
};

// Détail d'un invocateur par son puuid
const getByPuuid = async (puuid) => {
    const [rows] = await db.query(
        `SELECT i.*, r.nom_region
         FROM invocateurs i
         INNER JOIN regions r ON i.id_region = r.id_region
         WHERE i.puuid = ?`,
        [puuid]
    );
    return rows[0];
};

// Recherche d'invocateurs par nom de jeu, tag et/ou région (tous optionnels)
const rechercher = async ({ game_name, tag_line, region } = {}) => {
    const conditions = [];
    const params = [];

    if (game_name) {
        conditions.push('i.game_name LIKE ?');
        params.push(`%${game_name}%`);
    }
    if (tag_line) {
        conditions.push('i.tag_line = ?');
        params.push(tag_line);
    }
    if (region) {
        conditions.push('r.nom_region = ?');
        params.push(region);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await db.query(
        `SELECT i.puuid, i.game_name, i.tag_line, r.nom_region,
                i.solo_rang, i.solo_division, i.solo_lp, i.icone_id, i.niveau
         FROM invocateurs i
         INNER JOIN regions r ON i.id_region = r.id_region
         ${where}
         ORDER BY i.solo_lp DESC`,
        params
    );
    return rows;
};

// Mise à jour des stats SoloQ via la procédure stockée sp_update_solo_stats
const updateSoloStats = async (puuid, lp, rang) => {
    const [resultSets] = await db.query(
        'CALL sp_update_solo_stats(?, ?, ?)',
        [puuid, lp, rang]
    );
    const lignes = resultSets[0];
    return lignes && lignes[0] && lignes[0].lignes_modifiees > 0;
};

module.exports = { getClassement, getByPuuid, rechercher, updateSoloStats };