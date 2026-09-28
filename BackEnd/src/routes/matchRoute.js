const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { authentifier } = require('../middlewares/authMiddleware');

/**
 * @openapi
 * tags:
 *   name: Matchs
 *   description: Historique des matchs et statistiques (MongoDB — agrégation)
 */

/**
 * @openapi
 * /api/matchs:
 *   get:
 *     summary: Liste paginée des matchs
 *     tags: [Matchs]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: Liste des matchs }
 *   post:
 *     summary: Enregistre un nouveau match
 *     tags: [Matchs]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [matchId, region, gameDuration, gameCreation, participants]
 *             properties:
 *               matchId: { type: string, example: EUW1_006 }
 *               region: { type: string, example: KR }
 *               gameMode: { type: string, example: CLASSIC }
 *               gameDuration: { type: integer, example: 1800 }
 *               gameCreation: { type: integer, example: 1749216000 }
 *               participants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     puuid: { type: string, example: puuid_faker }
 *                     gameName: { type: string, example: Faker }
 *                     championName: { type: string, example: Azir }
 *                     teamId: { type: integer, example: 100 }
 *                     win: { type: boolean, example: true }
 *                     kills: { type: integer, example: 8 }
 *                     deaths: { type: integer, example: 2 }
 *                     assists: { type: integer, example: 11 }
 *     responses:
 *       201: { description: Match enregistré }
 *       400: { description: Données invalides }
 *       409: { description: Ce match existe déjà }
 */
router.get('/', matchController.getAll);

/**
 * @openapi
 * /api/matchs/champions/statistiques:
 *   get:
 *     summary: Winrate et volume de matchs par champion
 *     description: Agrégation globale MongoDB avec $unwind, $group et $project.
 *     tags: [Matchs]
 *     responses:
 *       200: { description: Statistiques agrégées par champion }
 */
router.get('/champions/statistiques', matchController.getChampionStats);

/**
 * @openapi
 * /api/matchs/stats/{puuid}:
 *   get:
 *     summary: Profil de stats d'un invocateur (pipeline d'agrégation MongoDB)
 *     description: Calcule winrate, KDA et champions joués via $unwind + $group.
 *     tags: [Matchs]
 *     parameters:
 *       - { in: path, name: puuid, required: true, schema: { type: string, example: puuid_faker } }
 *     responses:
 *       200: { description: Profil + liste des champions joués }
 *       404: { description: Aucun match trouvé pour cet invocateur }
 */
router.get('/stats/:puuid', matchController.getStats);

/**
 * @openapi
 * /api/matchs/invocateur/{puuid}:
 *   get:
 *     summary: Historique des matchs d'un invocateur
 *     tags: [Matchs]
 *     parameters:
 *       - { in: path, name: puuid, required: true, schema: { type: string, example: puuid_faker } }
 *     responses:
 *       200: { description: Historique des matchs }
 */
router.get('/invocateur/:puuid', matchController.getByPuuid);

router.post('/', authentifier, matchController.create);

module.exports = router;
