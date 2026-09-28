const mongoose = require('mongoose');

const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connecté à MongoDB');
    } catch (error) {
        console.error('Erreur de connexion MongoDB :', error.message);    }
};

module.exports = connectMongo;
