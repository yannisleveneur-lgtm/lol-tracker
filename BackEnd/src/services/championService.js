const Match = require('../models/Match');

// =====================================================================
// PIPELINE D'AGRÉGATION GLOBAL — statistiques par champion (tous joueurs)
// Calcule, sur l'ensemble des matchs, pour chaque champion :
// nombre de parties, victoires, winrate, KDA moyen.
// C'est un classement "méta" indépendant d'un joueur précis.
// =====================================================================
const getStatistiquesGlobales = async () => {
    return Match.aggregate([
        // Éclater le tableau participants : 1 ligne par participation
        { $unwind: '$participants' },
        // Regrouper par champion
        {
            $group: {
                _id: '$participants.championName',
                parties: { $sum: 1 },
                victoires: { $sum: { $cond: ['$participants.win', 1, 0] } },
                kills_moyens: { $avg: '$participants.kills' },
                deaths_moyens: { $avg: '$participants.deaths' },
                assists_moyens: { $avg: '$participants.assists' }
            }
        },
        // Calculer winrate et KDA
        {
            $project: {
                _id: 0,
                championName: '$_id',
                parties: 1,
                victoires: 1,
                winrate: {
                    $round: [{ $multiply: [{ $divide: ['$victoires', '$parties'] }, 100] }, 1]
                },
                kda: {
                    $round: [
                        {
                            $cond: [
                                { $eq: ['$deaths_moyens', 0] },
                                { $add: ['$kills_moyens', '$assists_moyens'] },
                                { $divide: [{ $add: ['$kills_moyens', '$assists_moyens'] }, '$deaths_moyens'] }
                            ]
                        },
                        2
                    ]
                }
            }
        },
        // Classer du plus joué au moins joué
        { $sort: { parties: -1, winrate: -1 } }
    ]);
};

module.exports = { getStatistiquesGlobales };
