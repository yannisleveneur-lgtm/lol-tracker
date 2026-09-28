const userService = require('../services/userService');

const getAll = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const data = await userService.getAllUsers(page, limit);
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors de la récupération des utilisateurs' });
    }
};

const getOne = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ erreur: 'Utilisateur introuvable' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors de la récupération de l\'utilisateur' });
    }
};

const create = async (req, res) => {
    try {
        const { pseudo_site, email, mot_de_passe, id_groupe } = req.body || {};
        if (!pseudo_site || !email || !mot_de_passe) {
            return res.status(400).json({
                erreur: 'Veuillez fournir pseudo_site, email et mot_de_passe'
            });
        }
        const newUser = await userService.createUser(pseudo_site, email, mot_de_passe, id_groupe);
        res.status(201).json({ message: 'Utilisateur créé avec succès', utilisateur: newUser });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ erreur: 'Ce pseudo ou cet email est déjà utilisé' });
        }
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(422).json({ erreur: 'Le groupe indiqué n\'existe pas' });
        }
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors de la création de l\'utilisateur' });
    }
};

const update = async (req, res) => {
    try {
        const { pseudo_site, email } = req.body || {};
        if (!pseudo_site || !email) {
            return res.status(400).json({ erreur: 'Veuillez fournir pseudo_site et email' });
        }
        const success = await userService.updateUser(req.params.id, pseudo_site, email);
        if (!success) {
            return res.status(404).json({ erreur: 'Utilisateur introuvable' });
        }
        res.status(200).json({ message: 'Utilisateur mis à jour' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ erreur: 'Ce pseudo ou cet email est déjà utilisé' });
        }
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
};

const remove = async (req, res) => {
    try {
        const success = await userService.deleteUser(req.params.id);
        if (!success) {
            return res.status(404).json({ erreur: 'Utilisateur introuvable' });
        }
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors de la suppression de l\'utilisateur' });
    }
};

module.exports = { getAll, getOne, create, update, remove };