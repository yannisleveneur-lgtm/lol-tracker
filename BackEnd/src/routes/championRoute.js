const express = require('express');
const router = express.Router();
const championController = require('../controllers/championController');

/**
 * @openapi
 * tags:
 *   name: Champions
 *   description: Statistiques globales par champion (MongoDB — agrégation, tous joueurs)
 */

/**
 * @openapi
 * /api/champions/statistiques:
 *   get:
 *     summary: Classement global des champions (winrate et KDA sur tous les matchs)
 *     description: Pipeline d'agrégation sur l'ensemble des matchs, regroupé par champion.
 *     tags: [Champions]
 *     responses:
 *       200:
 *         description: Liste des champions avec parties, victoires, winrate et KDA
 */
router.get('/statistiques', championController.getStatistiques);

module.exports = router;
