const Match = require('../models/Match');

const getAll = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const matchs = await Match.find()
        .sort({ gameCreation: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Match.countDocuments();
    return { matchs, page, limit, total };
};

const getByPuuid = async (puuid, limit = 20) => {
    return Match.find({ 'participants.puuid': puuid })
        .sort({ gameCreation: -1 })
        .limit(limit);
};

const create = async (data) => {
    const match = new Match(data);
    return match.save();
};


const getStatsProfil = async (puuid) => {
    const resultat = await Match.aggregate([
        { $match: { 'participants.puuid': puuid } },
        { $unwind: '$participants' },
        { $match: { 'participants.puuid': puuid } },
        {
            $group: {
                _id: '$participants.puuid',
                gameName: { $first: '$participants.gameName' },
                nb_parties: { $sum: 1 },
                victoires: { $sum: { $cond: ['$participants.win', 1, 0] } },
                total_kills: { $sum: '$participants.kills' },
                total_deaths: { $sum: '$participants.deaths' },
                total_assists: { $sum: '$participants.assists' }
            }
        },
        {
            $project: {
                _id: 0,
                puuid: '$_id',
                gameName: 1,
                nb_parties: 1,
                victoires: 1,
                defaites: { $subtract: ['$nb_parties', '$victoires'] },
                winrate: {
                    $round: [{ $multiply: [{ $divide: ['$victoires', '$nb_parties'] }, 100] }, 1]
                },
                kda: {
                    $round: [
                        {
                            $cond: [
                                { $eq: ['$total_deaths', 0] },
                                { $add: ['$total_kills', '$total_assists'] },
                                { $divide: [{ $add: ['$total_kills', '$total_assists'] }, '$total_deaths'] }
                            ]
                        },
                        2
                    ]
                }
            }
        }
    ]);

    return resultat[0] || null;
};

const getChampionsJoues = async (puuid) => {
    return Match.aggregate([
        { $match: { 'participants.puuid': puuid } },
        { $unwind: '$participants' },
        { $match: { 'participants.puuid': puuid } },
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
        {
            $project: {
                _id: 0,
                championName: '$_id',
                parties: 1,
                victoires: 1,
                winrate: {
                    $round: [{ $multiply: [{ $divide: ['$victoires', '$parties'] }, 100] }, 1]
                },
                kills_moyens: { $round: ['$kills_moyens', 1] },
                deaths_moyens: { $round: ['$deaths_moyens', 1] },
                assists_moyens: { $round: ['$assists_moyens', 1] }
            }
        },
        { $sort: { parties: -1 } }
    ]);
};

const getChampionStats = async () => {
    return Match.aggregate([
        { $unwind: '$participants' },
        {
            $group: {
                _id: {
                    champion: '$participants.championName',
                    role: '$participants.role'
                },
                totalMatchs: { $sum: 1 },
                totalVictoires: {
                    $sum: { $cond: ['$participants.win', 1, 0] }
                }
            }
        },
        {
            $project: {
                _id: 0,
                champion: '$_id.champion',
                role: { $ifNull: ['$_id.role', 'mid'] },
                totalMatchs: 1,
                winrate: {
                    $round: [
                        {
                            $multiply: [
                                { $divide: ['$totalVictoires', '$totalMatchs'] },
                                100
                            ]
                        },
                        1
                    ]
                }
            }
        },
        { $sort: { totalMatchs: -1, winrate: -1, champion: 1 } }
    ]);
};

module.exports = {
    getAll,
    getByPuuid,
    create,
    getStatsProfil,
    getChampionsJoues,
    getChampionStats
};
