const db = require('../config/db');

const getAll = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
        `SELECT f.id_favori, f.id_utilisateur, f.invocateur_puuid, f.date_ajout,
                i.game_name, i.tag_line, i.solo_rang, i.solo_lp
         FROM favoris f
         INNER JOIN invocateurs i ON i.puuid = f.invocateur_puuid
         ORDER BY f.date_ajout DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
    );
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM favoris');
    return { favoris: rows, page, limit, total };
};

const getByUser = async (idUtilisateur) => {
    const [rows] = await db.query(
        `SELECT f.id_favori, f.invocateur_puuid, f.date_ajout,
                i.game_name, i.tag_line, i.icone_id, i.niveau, r.nom_region,
                i.solo_rang, i.solo_division, i.solo_lp
         FROM favoris f
         INNER JOIN invocateurs i ON i.puuid = f.invocateur_puuid
         INNER JOIN regions r ON r.id_region = i.id_region
         WHERE f.id_utilisateur = ?
         ORDER BY f.date_ajout DESC`,
        [idUtilisateur]
    );
    return rows;
};


const add = async (idUtilisateur, puuid) => {
    const [resultSets] = await db.query(
        'CALL sp_ajouter_favori(?, ?)',
        [idUtilisateur, puuid]
    );
    const lignes = resultSets[0];
    return (lignes && lignes.length > 0) ? lignes[0] : null;
};

// Suppression d'un favori par son identifiant
const remove = async (idFavori, idUtilisateur) => {
    const [result] = await db.query(
        'DELETE FROM favoris WHERE id_favori = ? AND id_utilisateur = ?',
        [idFavori, idUtilisateur]
    );
    return result.affectedRows > 0;
};

module.exports = { getAll, getByUser, add, remove };
