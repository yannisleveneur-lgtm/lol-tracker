const authService = require('../services/authService');

const register = async (req, res) => {
    try {
        const { pseudo_site, email, mot_de_passe, id_groupe } = req.body || {};
        if (!pseudo_site || !email || !mot_de_passe) {
            return res.status(400).json({
                erreur: 'Veuillez fournir pseudo_site, email et mot_de_passe'
            });
        }
        const data = await authService.register(pseudo_site, email, mot_de_passe, id_groupe);
        res.status(201).json({
            message: 'Compte créé avec succès',
            utilisateur: data.utilisateur,
            token: data.token
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ erreur: 'Ce pseudo ou cet email est déjà utilisé' });
        }
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(422).json({ erreur: 'Le groupe indiqué n\'existe pas' });
        }
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors de la création du compte' });
    }
};

const login = async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body || {};
        if (!email || !mot_de_passe) {
            return res.status(400).json({ erreur: 'Veuillez fournir email et mot_de_passe' });
        }
        const data = await authService.login(email, mot_de_passe);
        if (!data) {
            return res.status(401).json({ erreur: 'Email ou mot de passe incorrect' });
        }
        res.status(200).json({
            message: 'Connexion réussie',
            utilisateur: data.utilisateur,
            token: data.token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors de la connexion' });
    }
};

const me = async (req, res) => {
    try {
        // req.user est injecté par authMiddleware
        const utilisateur = await authService.getMe(req.user.id_utilisateur);
        if (!utilisateur) {
            return res.status(404).json({ erreur: 'Utilisateur introuvable' });
        }
        res.status(200).json(utilisateur);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors de la récupération du profil' });
    }
};


const logout = async (req, res) => {
    res.status(200).json({ message: 'Déconnexion réussie. Supprimez le token côté client.' });
};

module.exports = { register, login, me, logout };