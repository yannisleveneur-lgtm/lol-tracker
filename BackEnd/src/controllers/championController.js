const championService = require('../services/championService');

// GET /api/champions/statistiques
const getStatistiques = async (req, res) => {
    try {
        const champions = await championService.getStatistiquesGlobales();
        res.status(200).json({ champions, total: champions.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erreur: 'Erreur lors du calcul des statistiques des champions' });
    }
};

module.exports = { getStatistiques };
