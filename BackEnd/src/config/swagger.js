const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API LoL Tracker',
            version: '1.0.0',
            description: 'API REST polyglotte (MySQL + MongoDB) de suivi de joueurs League of Legends. Projet BDD Avancée — B3.'
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Serveur local (Docker)' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Collez le token reçu via /api/auth/login'
                }
            }
        }
    },
    // Fichiers où swagger-jsdoc va lire les commentaires @openapi
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
