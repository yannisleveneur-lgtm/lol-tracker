const favoriService = require('../services/favoriService');

const getAll = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const data = await favoriService.getAll(page, limit);
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors de la récupération des favoris' });
    }
};

const getByUser = async (req, res) => {
    try {
        if (Number(req.user.id_utilisateur) !== Number(req.params.id)) {
            return res.status(403).json({
                erreur: 'Vous ne pouvez consulter que vos propres favoris'
            });
        }
        const favoris = await favoriService.getByUser(req.params.id);
        res.status(200).json({ favoris });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors de la récupération des favoris' });
    }
};

const add = async (req, res) => {
    try {
        const { invocateur_puuid } = req.body || {};
        if (!invocateur_puuid) {
            return res.status(400).json({
                erreur: 'Veuillez fournir invocateur_puuid'
            });
        }
        const favori = await favoriService.add(
            req.user.id_utilisateur,
            invocateur_puuid
        );
        res.status(201).json({ message: 'Favori ajouté', favori });
    } catch (error) {
        if (error.sqlState === '45000') {
            return res.status(400).json({ erreur: error.sqlMessage || 'Limite de favoris atteinte' });
        }
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ erreur: 'Cet invocateur est déjà dans les favoris' });
        }
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(422).json({ erreur: 'Utilisateur ou invocateur inexistant' });
        }
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors de l\'ajout du favori' });
    }
};

const remove = async (req, res) => {
    try {
        const success = await favoriService.remove(
            req.params.id,
            req.user.id_utilisateur
        );
        if (!success) {
            return res.status(404).json({ erreur: 'Favori introuvable' });
        }
        // 204 No Content : suppression réussie
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors de la suppression du favori' });
    }
};

module.exports = { getAll, getByUser, add, remove };
