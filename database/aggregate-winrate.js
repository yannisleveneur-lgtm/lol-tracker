// Pipeline d'agregation : winrate par champion (T-NOSQL-03 / Figure 11.7)
db.matchs.aggregate([
  { $unwind: "$participants" },
  { $group: {
      _id: "$participants.championName",
      totalMatchs: { $sum: 1 },
      totalVictoires: { $sum: { $cond: ["$participants.win", 1, 0] } }
    }
  },
  { $project: {
      _id: 0,
      champion: "$_id",
      totalMatchs: 1,
      winrate: { $multiply: [ { $divide: ["$totalVictoires", "$totalMatchs"] }, 100 ] }
    }
  },
  { $sort: { totalMatchs: -1 } }
]);
