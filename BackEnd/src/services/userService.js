const db = require('../config/db');
const bcrypt = require('bcrypt');

// Champs renvoyés au client (jamais le mot de passe)
const CHAMPS_PUBLICS = 'id_utilisateur, pseudo_site, email, id_groupe, date_inscription';

const getAllUsers = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
        `SELECT ${CHAMPS_PUBLICS} FROM utilisateurs ORDER BY id_utilisateur LIMIT ? OFFSET ?`,
        [limit, offset]
    );
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM utilisateurs');
    return { utilisateurs: rows, page, limit, total };
};

const getUserById = async (id) => {
    const [rows] = await db.query(
        `SELECT ${CHAMPS_PUBLICS} FROM utilisateurs WHERE id_utilisateur = ?`,
        [id]
    );
    return rows[0];
};

const createUser = async (pseudo_site, email, mot_de_passe, id_groupe) => {
    const hash = await bcrypt.hash(mot_de_passe, 10);
    const [result] = await db.query(
        'INSERT INTO utilisateurs (pseudo_site, email, mot_de_passe, id_groupe) VALUES (?, ?, ?, ?)',
        [pseudo_site, email, hash, id_groupe || 2]
    );
    // Relecture pour renvoyer le pseudo normalisé par le trigger tg_clean_pseudo
    return getUserById(result.insertId);
};

const updateUser = async (id, pseudo_site, email) => {
    const [result] = await db.query(
        'UPDATE utilisateurs SET pseudo_site = ?, email = ? WHERE id_utilisateur = ?',
        [pseudo_site, email, id]
    );
    return result.affectedRows > 0;
};

// Suppression via la procédure stockée sp_supprimer_compte (transaction explicite).
// La procédure renvoie un result set contenant `utilisateurs_supprimes`.
const deleteUser = async (id) => {
    const [resultSets] = await db.query('CALL sp_supprimer_compte(?)', [id]);
    const lignes = resultSets[0];
    return lignes && lignes[0] && lignes[0].utilisateurs_supprimes > 0;
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };