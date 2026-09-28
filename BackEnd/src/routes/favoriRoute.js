const express = require('express');
const router = express.Router();
const favoriController = require('../controllers/favoriController');
const { authentifier } = require('../middlewares/authMiddleware');

/**
 * @openapi
 * tags:
 *   name: Favoris
 *   description: Gestion des invocateurs favoris (SQL — procédure + trigger)
 */

/**
 * @openapi
 * /api/favoris:
 *   get:
 *     summary: Liste paginée de tous les favoris
 *     tags: [Favoris]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: Liste des favoris }
 *   post:
 *     summary: Ajoute un favori (procédure sp_ajouter_favori, trigger limite à 10)
 *     tags: [Favoris]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [invocateur_puuid]
 *             properties:
 *               invocateur_puuid: { type: string, example: puuid_faker }
 *     responses:
 *       201: { description: Favori ajouté }
 *       400: { description: Champs manquants ou limite de 10 favoris atteinte }
 *       401: { description: Token manquant ou invalide }
 *       409: { description: Cet invocateur est déjà en favori }
 *       422: { description: Utilisateur ou invocateur inexistant }
 */
router.get('/', favoriController.getAll);

/**
 * @openapi
 * /api/favoris/utilisateur/{id}:
 *   get:
 *     summary: Favoris d'un utilisateur précis
 *     tags: [Favoris]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer, example: 1 } }
 *     responses:
 *       200: { description: Favoris de l'utilisateur }
 */
router.get('/utilisateur/:id', authentifier, favoriController.getByUser);

router.post('/', authentifier, favoriController.add);

/**
 * @openapi
 * /api/favoris/{id}:
 *   delete:
 *     summary: Supprime un favori
 *     tags: [Favoris]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer, example: 1 } }
 *     responses:
 *       204: { description: Favori supprimé }
 *       401: { description: Token manquant ou invalide }
 *       404: { description: Favori introuvable }
 */
router.delete('/:id', authentifier, favoriController.remove);

module.exports = router;
