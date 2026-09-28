const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    puuid: { type: String, required: true },        
    gameName: { type: String, required: true },
    championName: { type: String, required: true },
    role: {
        type: String,
        enum: ['top', 'jungle', 'mid', 'adc', 'support'],
        default: 'mid'
    },
    teamId: { type: Number, enum: [100, 200], required: true }, 
    win: { type: Boolean, required: true },
    kills: { type: Number, default: 0 },
    deaths: { type: Number, default: 0 },
    assists: { type: Number, default: 0 }
}, { _id: false });

const matchSchema = new mongoose.Schema({
    matchId: { type: String, required: true, unique: true },
    region: { type: String, required: true },
    gameMode: { type: String, default: 'CLASSIC' },
    gameDuration: { type: Number, required: true },      // en secondes
    gameCreation: { type: Number, required: true },      // timestamp epoch (format Riot)
    participants: { type: [participantSchema], required: true }
});

matchSchema.index({ 'participants.puuid': 1 });
matchSchema.index({ gameCreation: -1 });

module.exports = mongoose.model('Match', matchSchema, 'matchs');
