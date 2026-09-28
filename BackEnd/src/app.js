const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectMongo = require('./config/mongo');
const app = express();

connectMongo();

app.use(helmet());
app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const invocateurRoute = require('./routes/invocateurRoute');
const favoriRoute = require('./routes/favoriRoute');
const matchRoute = require('./routes/matchRoute');
const championRoute = require('./routes/championRoute');

app.use('/api/auth', authRoute);
app.use('/api/utilisateurs', userRoute);
app.use('/api/invocateurs', invocateurRoute);
app.use('/api/favoris', favoriRoute);
app.use('/api/matchs', matchRoute);
app.use('/api/champions', championRoute);

app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'API opérationnelle' });
});

app.use((req, res) => {
    res.status(404).json({ erreur: 'Route introuvable' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur interne du serveur' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`Documentation API : http://localhost:${PORT}/api-docs`);
    console.log(`Hôte BDD SQL : ${process.env.DB_HOST}`);
});

module.exports = app;