const express = require('express');
const router = express.Router();
const invocateurController = require('../controllers/invocateurController');
const { authentifier } = require('../middlewares/authMiddleware');

/**
 * @openapi
 * tags:
 *   name: Invocateurs
 *   description: Classement, recherche et profils des invocateurs (SQL)
 */

/**
 * @openapi
 * /api/invocateurs:
 *   get:
 *     summary: Classement des invocateurs (paginé, trié, filtrable par région)
 *     tags: [Invocateurs]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - { in: query, name: sort, schema: { type: string, enum: [lp, niveau, nom] } }
 *       - { in: query, name: order, schema: { type: string, enum: [asc, desc] } }
 *       - { in: query, name: region, schema: { type: string, example: EUW } }
 *     responses:
 *       200: { description: Liste paginée des invocateurs }
 */
router.get('/', invocateurController.getClassement);

/**
 * @openapi
 * /api/invocateurs/recherche:
 *   get:
 *     summary: Recherche d'invocateurs par nom, tag et/ou région
 *     tags: [Invocateurs]
 *     parameters:
 *       - { in: query, name: game_name, schema: { type: string, example: Faker } }
 *       - { in: query, name: tag_line, schema: { type: string, example: KR1 } }
 *       - { in: query, name: region, schema: { type: string, example: KR } }
 *     responses:
 *       200: { description: Résultats de la recherche }
 *       400: { description: Aucun critère fourni }
 */
router.get('/recherche', invocateurController.rechercher);

/**
 * @openapi
 * /api/invocateurs/{puuid}:
 *   get:
 *     summary: Détail d'un invocateur
 *     tags: [Invocateurs]
 *     parameters:
 *       - { in: path, name: puuid, required: true, schema: { type: string, example: puuid_faker } }
 *     responses:
 *       200: { description: Détail de l'invocateur }
 *       404: { description: Invocateur introuvable }
 */
router.get('/:puuid', invocateurController.getOne);

/**
 * @openapi
 * /api/invocateurs/{puuid}/solo-stats:
 *   patch:
 *     summary: Met à jour les stats SoloQ (procédure stockée sp_update_solo_stats)
 *     tags: [Invocateurs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: puuid, required: true, schema: { type: string, example: puuid_faker } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [solo_lp, solo_rang]
 *             properties:
 *               solo_lp: { type: integer, example: 1700 }
 *               solo_rang: { type: string, example: CHALLENGER }
 *     responses:
 *       200: { description: Statistiques mises à jour }
 *       400: { description: Champs manquants }
 *       404: { description: Invocateur introuvable }
 */
router.patch('/:puuid/solo-stats', authentifier, invocateurController.updateSoloStats);

module.exports = router;