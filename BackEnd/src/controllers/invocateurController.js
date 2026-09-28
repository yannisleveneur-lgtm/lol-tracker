const invocateurService = require('../services/invocateurService');

// GET /api/invocateurs?page=&limit=&sort=&order=&region=
const getClassement = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const { sort, order, region } = req.query;
        const data = await invocateurService.getClassement({ page, limit, sort, order, region });
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erreur: 'Impossible de récupérer le classement' });
    }
};

// GET /api/invocateurs/recherche?game_name=&tag_line=&region=
const rechercher = async (req, res) => {
    try {
        const { game_name, tag_line, region } = req.query;
        if (!game_name && !tag_line && !region) {
            return res.status(400).json({
                erreur: 'Fournissez au moins un critère : game_name, tag_line ou region'
            });
        }
        const invocateurs = await invocateurService.rechercher({ game_name, tag_line, region });
        res.status(200).json({ invocateurs, total: invocateurs.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors de la recherche' });
    }
};

// GET /api/invocateurs/:puuid
const getOne = async (req, res) => {
    try {
        const invocateur = await invocateurService.getByPuuid(req.params.puuid);
        if (!invocateur) {
            return res.status(404).json({ erreur: 'Invocateur introuvable' });
        }
        res.status(200).json(invocateur);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erreur: 'Impossible de récupérer l\'invocateur' });
    }
};

// PATCH /api/invocateurs/:puuid/solo-stats
const updateSoloStats = async (req, res) => {
    try {
        const { solo_lp, solo_rang } = req.body || {};
        if (solo_lp === undefined || !solo_rang) {
            return res.status(400).json({ erreur: 'Veuillez fournir solo_lp et solo_rang' });
        }
        const success = await invocateurService.updateSoloStats(req.params.puuid, solo_lp, solo_rang);
        if (!success) {
            return res.status(404).json({ erreur: 'Invocateur introuvable' });
        }
        res.status(200).json({ message: 'Statistiques SoloQ mises à jour' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erreur: 'Impossible de mettre à jour les statistiques' });
    }
};

module.exports = { getClassement, rechercher, getOne, updateSoloStats };