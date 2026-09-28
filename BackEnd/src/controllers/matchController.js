const matchService = require('../services/matchService');

const getAll = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const data = await matchService.getAll(page, limit);
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors de la récupération des matchs' });
    }
};

const getByPuuid = async (req, res) => {
    try {
        const matchs = await matchService.getByPuuid(req.params.puuid);
        res.status(200).json({ matchs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors de la récupération de l\'historique' });
    }
};

const create = async (req, res) => {
    try {
        const match = await matchService.create(req.body || {});
        res.status(201).json({ message: 'Match enregistré', match });
    } catch (error) {
        // Doublon de match_id (index unique)
        if (error.code === 11000) {
            return res.status(409).json({ erreur: 'Ce match existe déjà' });
        }
        // Erreur de validation Mongoose (champ manquant ou type invalide)
        if (error.name === 'ValidationError') {
            return res.status(400).json({ erreur: 'Données du match invalides', detail: error.message });
        }
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors de l\'enregistrement du match' });
    }
};

const getStats = async (req, res) => {
    try {
        const profil = await matchService.getStatsProfil(req.params.puuid);
        if (!profil) {
            return res.status(404).json({ erreur: 'Aucun match trouvé pour cet invocateur' });
        }
        const champions = await matchService.getChampionsJoues(req.params.puuid);
        res.status(200).json({ profil, champions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors du calcul des statistiques' });
    }
};

const getChampionStats = async (req, res) => {
    try {
        const champions = await matchService.getChampionStats();
        res.status(200).json({ champions, total: champions.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            erreur: 'Erreur lors du calcul des statistiques de champions'
        });
    }
};

module.exports = { getAll, getByPuuid, create, getStats, getChampionStats };
