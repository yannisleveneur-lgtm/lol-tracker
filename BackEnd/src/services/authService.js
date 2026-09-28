const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const genererToken = (utilisateur) => {
    return jwt.sign(
        {
            id_utilisateur: utilisateur.id_utilisateur,
            pseudo_site: utilisateur.pseudo_site,
            id_groupe: utilisateur.id_groupe
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const register = async (pseudo_site, email, mot_de_passe, id_groupe) => {
    const hash = await bcrypt.hash(mot_de_passe, 10);
    const [result] = await db.query(
        'INSERT INTO utilisateurs (pseudo_site, email, mot_de_passe, id_groupe) VALUES (?, ?, ?, ?)',
        [pseudo_site, email, hash, id_groupe || 2]
    );
    // Relecture pour récupérer le pseudo normalisé par le trigger tg_clean_pseudo
    const [rows] = await db.query(
        'SELECT id_utilisateur, pseudo_site, email, id_groupe, date_inscription FROM utilisateurs WHERE id_utilisateur = ?',
        [result.insertId]
    );
    const utilisateur = rows[0];
    const token = genererToken(utilisateur);
    return { utilisateur, token };
};

const login = async (email, mot_de_passe) => {
    const [rows] = await db.query(
        'SELECT id_utilisateur, pseudo_site, email, mot_de_passe, id_groupe, date_inscription FROM utilisateurs WHERE email = ?',
        [email]
    );
    const utilisateur = rows[0];
    if (!utilisateur) return null;

    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!motDePasseValide) return null;

    const { mot_de_passe: _, ...utilisateurSansMotDePasse } = utilisateur;
    const token = genererToken(utilisateurSansMotDePasse);
    return { utilisateur: utilisateurSansMotDePasse, token };
};

const getMe = async (id) => {
    const [rows] = await db.query(
        'SELECT id_utilisateur, pseudo_site, email, id_groupe, date_inscription FROM utilisateurs WHERE id_utilisateur = ?',
        [id]
    );
    return rows[0];
};

module.exports = { register, login, getMe };
